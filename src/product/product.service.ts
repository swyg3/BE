import { Inject, Injectable, Logger } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { ProductView, SortByOption } from './repositories/product-view.repository';
import { ConfigService } from '@nestjs/config';
import { Category } from './product.category';
import { Inventory } from 'src/inventory/inventory.entity';
import { InventoryRepository } from 'src/inventory/repositories/inventory.repository';
import { ProductRepository } from './repositories/product.repository';
import { REDIS_CLIENT } from 'src/shared/infrastructure/redis/redis.config';
import Redis from 'ioredis';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

interface ProductWithInventory {
    product: Product;
    inventory: Inventory;
}

export interface FindProductsParams {
    category: Category;
    sortBy: SortByOption;
    order: 'asc' | 'desc';
    limit: number;
    exclusiveStartKey?: string;
    previousPageKey?: string;
    latitude?: string;
    longitude?: string;
}

export interface ProductQueryResult {
    items: ProductView[];
    lastEvaluatedUrl: string | null;
    firstEvaluatedUrl: string | null;
    prevPageUrl: string | null;
    count: number;
}

@Injectable()
export class ProductService {
    private readonly logger = new Logger(ProductService.name);

    constructor(
        private productRepository: ProductRepository,
        private inventoryRepository: InventoryRepository,
        @InjectModel("ProductView")
        private readonly productViewModel: Model<ProductView, { productId: string }>,
        private readonly configService: ConfigService,
        @Inject(REDIS_CLIENT) private readonly redis: Redis,
        @InjectDataSource() private dataSource: DataSource
    ) { }
  
    async findProductsByCategoryAndSort(params: FindProductsParams): Promise<ProductQueryResult> {
        try {
          const { category, sortBy, order, limit, latitude, longitude, exclusiveStartKey, previousPageKey } = params;
                // 1. PostgreSQL에서 카테고리별 상품 조회

          let products = await this.fetchProductsFromPostgres(category);

            if (this.shouldCalculateDistance(sortBy, latitude, longitude)) {
                products = await this.calculateAndUpdateDistances(products, Number(latitude), Number(longitude));
            }

            const sortedProducts = this.sortProducts(products, sortBy, order);
            const { paginatedItems: paginatedProducts, lastEvaluatedKey } = this.applyPagination(sortedProducts, limit, params.exclusiveStartKey);

            await this.syncToReadModel(paginatedProducts);
            const items = await this.fetchFromDynamoDB(paginatedProducts.map(p => p.id));

            return this.formatResult(items, lastEvaluatedKey, params);
        } catch (error) {
            this.logger.error(`Error in findProductsByCategoryAndSort: ${error.message}`, error.stack);
            throw error;
        }
    }

    private async fetchProductsFromPostgres(category: Category): Promise<Product[]> {
      const queryBuilder = this.productRepository.createQueryBuilder('product')
        .select(['product.id', 'product.locationX', 'product.locationY', 'product.discountRate']);
    
      // 카테고리가 'all'이 아닌 경우에만 where 조건 추가
      if (category !== Category.ALL) {
        queryBuilder.where('product.category = :category', { category });
      }
    
      const products = await queryBuilder.getMany();
      return products;
    }
    

    private shouldCalculateDistance(sortBy: SortByOption, latitude?: string, longitude?: string): boolean {
        return (sortBy === SortByOption.Distance || sortBy === SortByOption.DistanceDiscountScore) && !!latitude && !!longitude;
    }

    private async calculateAndUpdateDistances(products: Product[], latitude: number, longitude: number): Promise<Product[]> {
        const productIds = products.map(p => p.id);
        const distances = await this.calculateDistancesWithRedis(latitude, longitude, productIds);

        return Promise.all(products.map(async (product) => {
            const distanceInMeters = distances[product.id];
            if (distanceInMeters !== undefined) {
                product.distance = +(distanceInMeters / 1000).toFixed(2);
                product.distanceDiscountScore = this.calculateRecommendationScore(product);
                return this.productRepository.save(product);
            }
            return product;
        }));
    }

    private async calculateDistancesWithRedis(latitude: number, longitude: number, productIds: string[]): Promise<Record<string, number>> {
        const distances: Record<string, number> = {};
        for (const productId of productIds) {
            try {
                const distance = await (this.redis.geodist as any)('products', productId, `${longitude},${latitude}`, 'm');
                if (distance !== null) {
                    distances[productId] = parseFloat(distance);
                }
            } catch (error) {
                this.logger.error(`Error calculating distance for product ${productId}: ${error.message}`);
            }
        }
        return distances;
    }

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
            }
            return order === 'asc' ? comparison : -comparison;
        });
    }

    private applyPagination(items: Product[], limit: number, exclusiveStartKey?: string): { paginatedItems: Product[], lastEvaluatedKey: any } {
        let startIndex = 0;
        if (exclusiveStartKey) {
            const startKey = JSON.parse(decodeURIComponent(exclusiveStartKey));
            startIndex = items.findIndex(item => item.id === startKey.productId);
            startIndex = startIndex === -1 ? 0 : startIndex + 1;
        }

        const paginatedItems = items.slice(startIndex, startIndex + limit);
        const lastEvaluatedKey = paginatedItems.length === limit ? { productId: paginatedItems[paginatedItems.length - 1].id } : null;

        return { paginatedItems, lastEvaluatedKey };
    }

    private async syncToReadModel(products: Product | Product[]): Promise<void> {
        const productsToSync = Array.isArray(products) ? products : [products];
        const productIds = productsToSync.map(product => product.id);
        const inventories = await this.getInventoriesByProductIds(productIds);

        const productsWithInventory: ProductWithInventory[] = productsToSync.map(product => {
            const inventory = inventories.find(inv => inv.productId === product.id);
            if (!inventory) {
                throw new Error(`해당 제품 ID에 대한 재고를 찾을 수 없습니다: ${product.id}`);
            }
            return { product, inventory };
        });

        const productViews: ProductView[] = productsWithInventory.map(({ product, inventory }) =>
            this.mapToViewModel(product, inventory)
        );

        const BATCH_SIZE = 100;
        for (let i = 0; i < productViews.length; i += BATCH_SIZE) {
            const batch = productViews.slice(i, i + BATCH_SIZE);
            await this.productViewModel.batchPut(batch);
        }
    }

    private async getInventoriesByProductIds(productIds: string[]): Promise<Inventory[]> {
        return this.inventoryRepository.findManyByProductIds(productIds);
    }

    private async fetchFromDynamoDB(productIds: string[]): Promise<ProductView[]> {
        console.log(`Attempting to fetch ${productIds.length} products from DynamoDB`);
        console.log('Product IDs:', productIds);
        if (productIds.length === 0) {
            console.warn('No product IDs to fetch from DynamoDB');
        }
        const formattedProductIds = productIds.map(id => ({ productId: id }));
        console.log('Formatted product IDs:', formattedProductIds);

        try {
            const items = await this.productViewModel.batchGet(formattedProductIds);
            console.log(`Fetched ${items.length} items from DynamoDB`);
            return items;
        } catch (error) {
            console.error('Error fetching from DynamoDB:', error);
            throw error;
        }
    }

    private formatResult(
        items: ProductView[],
        lastEvaluatedKey: any,
        params: FindProductsParams
    ): ProductQueryResult {
        const appUrl = this.configService.get<string>('APP_URL');
        const createUrlWithKey = (key: Record<string, any> | null, prevKey: string | null = null) => {
            if (!key || !appUrl) return null;
            const baseUrl = new URL("/api/products/category", appUrl);
            Object.entries(params).forEach(([paramKey, value]) => {
                if (value !== undefined) baseUrl.searchParams.append(paramKey, value.toString());
            });
            baseUrl.searchParams.append('exclusiveStartKey', encodeURIComponent(JSON.stringify(key)));
            if (prevKey) {
                baseUrl.searchParams.append('previousPageKey', encodeURIComponent(prevKey));
            }
            return baseUrl.toString();
        };

        const firstEvaluatedKey = items.length > 0 ? { productId: items[0].productId } : null;
        const firstEvaluatedUrl = createUrlWithKey(firstEvaluatedKey, params.previousPageKey);
        const lastEvaluatedUrl = lastEvaluatedKey ? createUrlWithKey(lastEvaluatedKey, JSON.stringify(firstEvaluatedKey)) : null;

        let prevPageUrl: string | null = null;
        if (params.previousPageKey) {
            const prevKey = JSON.parse(decodeURIComponent(params.previousPageKey));
            prevPageUrl = createUrlWithKey(prevKey, null);
        }

        return {
            items,
            lastEvaluatedUrl,
            firstEvaluatedUrl,
            prevPageUrl,
            count: items.length
        };
    }

    private mapToViewModel(product: Product, inventory: Inventory): ProductView {
        return {
            productId: product.id,
            GSI_KEY: "PRODUCT",
            sellerId: product.sellerId ? product.sellerId.id : null,  // seller가 있으면 id를 할당
            name: product.name,
            originalPrice: product.originalPrice,
            discountedPrice: product.discountedPrice,
            discountRate: product.discountRate,
            category: product.category,
            distance: product.distance,
            distanceDiscountScore: product.distanceDiscountScore,
            productImageUrl: product.productImageUrl,
            description: product.description,
            availableStock: inventory.quantity,
            expirationDate: product.expirationDate,
            locationX: product.locationX,
            locationY: product.locationY,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            inventoryUpdatedAt: inventory.updatedAt
        };
    }

    private calculateRecommendationScore(product: Product): number {
        const distanceWeight = 0.6;
        const discountWeight = 0.4;
        const normalizedDistance = 1 - Math.min((product.distance || 0) / 10, 1);
        const normalizedDiscount = (product.discountRate || 0) / 100;

        return (normalizedDistance * distanceWeight) + (normalizedDiscount * discountWeight);
    }
}