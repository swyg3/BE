import { CreateProductCommand, CreateProductResult } from "../impl/create-product.command";
import { ProductRepository } from "../../repositories/product.repository";
import { Product } from "src/product/entities/product.entity";
import { CreateInventoryCommand } from "src/inventory/commands/impl/create-inventory.command";
import { InjectRepository } from "@nestjs/typeorm";
import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BadRequestException, Inject, Logger } from "@nestjs/common";
import { EventBusService } from "src/shared/infrastructure/event-sourcing/event-bus.service";
import { SellerRepository } from "src/sellers/repositories/seller.repository";
import { ProductCreatedEvent } from "src/product/events/impl/product-created.event";
import { NaverMapsClient } from "src/shared/infrastructure/database/navermap.config";
interface GeocodingResult {
  x: string;
  y: string;
}

@CommandHandler(CreateProductCommand)
export class CreateProductHandler
  implements ICommandHandler<CreateProductCommand, CreateProductResult> {
  private readonly logger = new Logger(CreateProductHandler.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: ProductRepository,
    private readonly sellerRepository: SellerRepository,
    private readonly naverMapsClient: NaverMapsClient,
    private readonly eventBusService: EventBusService,
    @Inject(CommandBus) private readonly commandBus: CommandBus,
  ) { }

  async execute(command: CreateProductCommand): Promise<CreateProductResult> {
    const {
      sellerId,
      category,
      name,
      productImageUrl,
      description,
      originalPrice,
      discountedPrice,
      quantity,
      expirationDate,
    } = command;

    const seller = await this.sellerRepository.findBySellerId(sellerId);
    if (!seller) {
      throw new Error("존재하지 않는 판매자입니다.");
    }
    // 판매자 주소 조회
    const sellerAddress = await this.sellerRepository.getSellerAddress(sellerId);

    if (!sellerAddress) {
      throw new Error(`판매자 주소를 찾을 수 없습니다: ${sellerId}`);
    }

    // 주소로 지오코딩 정보 얻기
    let geocodingResult: GeocodingResult;
    try {
      geocodingResult = await this.naverMapsClient.getGeocode(sellerAddress);
    } catch (error) {
      this.logger.error(`지오코딩 실패: ${error.message}`);
      throw error;
    }

    let savedProduct: Product | null = null;

    try {
      // Product 저장
      const product = this.productRepository.create({
        sellerId,
        category,
        name,
        productImageUrl,
        description,
        originalPrice,
        discountedPrice,
        locationX: geocodingResult.x,  
        locationY: geocodingResult.y,
        distance: 0
      });
      this.logger.log(`command handler${productImageUrl}`);

      try {
        savedProduct = await this.productRepository.save(product);
      } catch (dbError) {
        this.logger.error(
          `Error occurred while saving product: ${dbError.message}`,
        );
        this.logger.error(`Stack trace: ${dbError.stack}`);
        throw new BadRequestException("Failed to save product to the database");
      }

      const id = savedProduct.id;
      const discountRate = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
      this.logger.log(`Received expirationDate: ${expirationDate}`);
      this.logger.log(expirationDate);

      // ProductCreatedEvent 생성 및 발행
      const event = new ProductCreatedEvent(
        product.id,
        {
          sellerId: product.sellerId,
          category: product.category,
          name: product.name,
          productImageUrl: product.productImageUrl,
          description: product.description,
          originalPrice: product.originalPrice,
          discountedPrice: product.discountedPrice,
          discountRate: discountRate,
          availableStock: quantity,
          expirationDate: expirationDate,
          createdAt: new Date(),
          updatedAt: new Date(),
          locationX: geocodingResult.x,
          locationY: geocodingResult.y,
          distance:0
        },
        1,
      );

      try {
        await this.eventBusService.publishAndSave(event);
      } catch (eventError) {
        this.logger.error(
          `Error occurred while publishing event: ${eventError.message}`,
        );
        this.logger.error(`Stack trace: ${eventError.stack}`);
        throw new BadRequestException(
          "Failed to publish product creation event",
        );
      }

      // Inventory 생성 명령어 발행
      const createInventoryCommand = new CreateInventoryCommand(
        id,
        quantity,
        expirationDate,
      );

      try {
        await this.commandBus.execute(createInventoryCommand);
      } catch (commandError) {
        this.logger.error(
          `Error occurred while executing CreateInventoryCommand: ${commandError.message}`,
        );
        this.logger.error(`Stack trace: ${commandError.stack}`);
        throw new BadRequestException("Failed to create inventory");
      }
    } catch (error) {
      // 전체 에러 처리
      this.logger.error(
        `Error occurred while executing CreateProductCommand: ${error.message}`,
      );
      this.logger.error(`Event data: ${JSON.stringify(command)}`);
      this.logger.error(`Stack trace: ${error.stack}`);
      throw new BadRequestException(
        "Error occurred during product creation process",
      );
    }

    // 컨트롤러에 응답 반환
    return { id: savedProduct.id };
  }
}
