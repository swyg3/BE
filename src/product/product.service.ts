import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { ProductView } from './repositories/product-view.repository';
import { ConfigService } from '@nestjs/config';
import { Category } from './product.category';
import { DistanceCalculator } from './util/distance-calculator';
import { CreateProductDto, FindProductsParams, ProductQueryResult, SortByOption, PaginationResult } from './dto';
import { Inventory } from 'src/inventory/inventory.entity';
import { InventoryRepository } from 'src/inventory/repositories/inventory.repository';
import { ProductRepository } from './repositories/product.repository';
import { REDIS_CLIENT } from 'src/shared/infrastructure/redis/redis.config';
import Redis from 'ioredis';

// Product와 해당하는 Inventory를 가진 객체 타입 정의
interface ProductWithInventory {
    product: Product;
    inventory: Inventory;
}

@Injectable()
export class ProductService {
    constructor(
        private productRepository: ProductRepository,
        private inventoryRepository: InventoryRepository,
        @InjectModel("ProductView")
        private readonly productViewModel: Model<ProductView, { productId: string }>,
        private readonly configService: ConfigService,
        @Inject(REDIS_CLIENT) private readonly redis: Redis

    ) { }

    // Command: 제품 생성/수정
    async createOrUpdateProduct(productData: CreateProductDto): Promise<void> {
        // PostgreSQL에 제품 데이터 저장
        const product = await this.productRepository.save(productData);
        // 읽기 모델(DynamoDB)에 동기화
        await this.syncToReadModel(product);
    }

    // Query: 제품 검색 및 정렬
    async findProductsByCategoryAndSort(params: FindProductsParams): Promise<ProductQueryResult> {
        const { category, sortBy, order, limit, latitude, longitude } = params;

        // 1. PostgreSQL에서 기본 데이터 조회
        let products = await this.fetchProductsFromPostgres(category);

        // 2. 거리 및 점수 계산 (필요한 경우)
        if (this.shouldCalculateDistance(sortBy, latitude, longitude)) {
            products = await this.calculateAndUpdateDistances(products, Number(latitude), Number(longitude));
        }

        // 3. 정렬 및 페이지네이션
        const sortedProducts = this.sortProducts(products, sortBy, order);
        const { paginatedProducts, lastEvaluatedKey } = this.applyPagination(sortedProducts, limit, params.exclusiveStartKey);

        // 4. 읽기 모델 (DynamoDB) 동기화
        await this.syncToReadModel(paginatedProducts);

        // 5. DynamoDB에서 최종 데이터 조회
        const items = await this.fetchFromDynamoDB(paginatedProducts.map(p => p.id));

        // 6. 결과 포맷팅 및 반환
        return this.formatResult(items, lastEvaluatedKey, params);
    }

    // 1-1. PostgreSQL에서 제품 데이터 가져오기
    private async fetchProductsFromPostgres(category: Category): Promise<Product[]> {
        if (category === Category.ALL) {
            // 모든 카테고리의 제품을 가져옵니다.
            return this.productRepository.find();
        } else {
            // 특정 카테고리의 제품만 가져옵니다.
            return this.productRepository.find({ where: { category } });
        }
    }

    // 2-1. 거리 계산 필요 여부 확인
    private shouldCalculateDistance(sortBy: SortByOption, latitude?: string, longitude?: string): boolean {
        return (sortBy === SortByOption.Distance || sortBy === SortByOption.DistanceDiscountScore) && !!latitude && !!longitude;
    }

    // 2-2. 거리 계산 및 업데이트 distance, distancediscountscore은 때마다 postgres에 업데이트가 되어야함 event역시 발생 
    private async calculateAndUpdateDistances(products: Product[], latitude: number, longitude: number): Promise<Product[]> {
        const userLocation = DistanceCalculator.createPolygonFromCoordinates(latitude, longitude);

        return Promise.all(products.map(async (product) => {
            if (product.locationX && product.locationY) {
                const itemLocation = DistanceCalculator.createPolygonFromCoordinates(Number(product.locationX), Number(product.locationY));
                product.distance = DistanceCalculator.vincentyDistance(userLocation, itemLocation);
                product.distanceDiscountScore = this.calculateRecommendationScore(product);
                return this.productRepository.save(product);
            }
            return product;
        }));
    }

    // 3-1. 제품 정렬 프론트 요구에의해 asc가 내림차순이도록 
    private sortProducts(products: Product[], sortBy: SortByOption, order: 'asc' | 'desc'): Product[] {
        return products.sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case SortByOption.DiscountRate:
                    comparison = (b.discountRate || 0) - (a.discountRate || 0);
                    break;
                case SortByOption.Distance:
                    comparison = (a.distance || Infinity) - (b.distance || Infinity);
                    break;
                case SortByOption.DistanceDiscountScore:
                    comparison = (b.distanceDiscountScore || -Infinity) - (a.distanceDiscountScore || -Infinity);
                    break;
                // 필요에 따라 다른 정렬 옵션 추가
            }
            return order === 'asc' ? comparison : -comparison;
        });
    }

    // 3-2. 페이지네이션 적용
    // start = 0 으로 지정, exkey 존재시 이것을 첫번째 키로
    // 여기서 productid를 추츨하여 start index로
    private applyPagination(products: Product[], limit: number, exclusiveStartKey?: string): PaginationResult {
        let startIndex = 0;
        if (exclusiveStartKey) {
            const startKey = JSON.parse(decodeURIComponent(exclusiveStartKey));
            startIndex = products.findIndex(product => product.id === startKey.productId);
            startIndex = startIndex === -1 ? 0 : startIndex + 1;
        }

        const paginatedProducts = products.slice(startIndex, startIndex + limit);
        const lastEvaluatedKey = paginatedProducts.length === limit ? { productId: paginatedProducts[paginatedProducts.length - 1].id } : null;

        return { paginatedProducts, lastEvaluatedKey };
    }

    // 4-1. 읽기 모델(DynamoDB) 동기화 뷰모델에 배치 업데이트
    // 재고 + 상품 => view 생성 그때마다 재고도 반영 할 수 있음
    private async syncToReadModel(products: Product | Product[]): Promise<void> {
        const productsToSync = Array.isArray(products) ? products : [products];

        // 모든 Product ID를 추출
        const productIds = productsToSync.map(product => product.id);

        // 한 번의 쿼리로 모든 Inventory를 가져옵니다. (최적화된 접근)
        const inventories = await this.getInventoriesByProductIds(productIds);

        // Product와 해당 Inventory를 매핑
        const productsWithInventory: ProductWithInventory[] = productsToSync.map(product => {
            const inventory = inventories.find(inv => inv.productId === product.id);
            if (!inventory) {
                throw new Error(`Inventory not found for product ID: ${product.id}`);
            }
            return { product, inventory };
        });

        // ProductView로 변환
        const productViews: ProductView[] = productsWithInventory.map(({ product, inventory }) =>
            this.mapToViewModel(product, inventory)
        );

        // DynamoDB에 배치 업데이트 (배치 크기 조절)
        const BATCH_SIZE = 25; // DynamoDB의 최대 배치 크기
        for (let i = 0; i < productViews.length; i += BATCH_SIZE) {
            const batch = productViews.slice(i, i + BATCH_SIZE);
            await this.productViewModel.batchPut(batch);
        }
    }

    // 4-1-1. Inventory를 가져오는 예시 함수
    private async getInventoriesByProductIds(productIds: string[]): Promise<Inventory[]> {
        // Inventory를 한 번에 가져오는 로직 구현
        // 예를 들어, 데이터베이스 조회
        return await this.inventoryRepository.findManyByProductIds(productIds);    }

    // 4-2. DynamoDB에서 데이터 가져오기 배치로 업데이트
    private async fetchFromDynamoDB(productIds: string[]): Promise<ProductView[]> {
        const formattedProductIds = productIds.map(id => ({ productId: id }));
        return this.productViewModel.batchGet(formattedProductIds);
    }

    // 결과 포맷팅
    private formatResult(items: ProductView[], lastEvaluatedKey: any, params: FindProductsParams): ProductQueryResult {
        const appUrl = this.configService.get<string>('APP_URL');
        const createUrlWithKey = (key: Record<string, any> | null) => {
            if (!key || !appUrl) return null;
            const baseUrl = new URL("/api/products/category", appUrl);
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) baseUrl.searchParams.append(key, value.toString());
            });
            if (key) baseUrl.searchParams.append('exclusiveStartKey', encodeURIComponent(JSON.stringify(key)));
            return baseUrl.toString();
        };

        const lastEvaluatedUrl = createUrlWithKey(lastEvaluatedKey);
        const firstEvaluatedKey = items.length > 0 ? { productId: items[0].productId } : null;
        const firstEvaluatedUrl = createUrlWithKey(firstEvaluatedKey);

        return {
            items,
            lastEvaluatedUrl,
            firstEvaluatedUrl,
            count: items.length
        };
    }

    // ProductEntity를 ProductView로 매핑
    private mapToViewModel(product: Product, inventory: Inventory): ProductView {
        return {
            productId: product.id,
            GSI_KEY: "PRODUCT",  // 하드코딩된 값 추가
            name: product.name,
            originalPrice: product.originalPrice,
            discountedPrice: product.discountedPrice,
            discountRate: product.discountRate,
            category: product.category,
            distance: product.distance,
            distanceDiscountScore: product.distanceDiscountScore,
            productImageUrl: product.productImageUrl,
            description: product.description,
            availableStock: inventory.quantity,  // Inventory에서 가져옴
            expirationDate: product.expirationDate,
            locationX: product.locationX,
            locationY: product.locationY,
            sellerId: product.sellerId.id,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            inventoryUpdatedAt: inventory.updatedAt  // 재고 처리시간 
        };
    }


    // 추천 점수 계산
    private calculateRecommendationScore(product: Product): number {
        // 거리와 할인율을 고려한 추천 점수 계산 로직
        const distanceWeight = 0.6;
        const discountWeight = 0.4;
        const normalizedDistance = 1 - (product.distance || 0) / 10000; // 거리를 0~1 사이 값으로 정규화 (10km를 최대로 가정)
        const normalizedDiscount = (product.discountRate || 0) / 100; // 할인율을 0~1 사이 값으로 정규화

        return (normalizedDistance * distanceWeight) + (normalizedDiscount * discountWeight);
    }
}