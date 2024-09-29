import { CreateProductCommand } from "../impl/create-product.command";
import { ProductRepository } from "../../repositories/product.repository";
import { Product } from "src/product/entities/product.entity";
import { CreateInventoryCommand } from "src/inventory/commands/impl/create-inventory.command";
import { InjectRepository } from "@nestjs/typeorm";
import { ProductCreatedEvent } from "src/product/events/impl/product-created.event";
import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BadRequestException, Inject, Logger } from "@nestjs/common";
import { EventBusService } from "src/shared/infrastructure/event-sourcing/event-bus.service";
import { SellerRepository } from "src/sellers/repositories/seller.repository";
import { Seller } from "src/sellers/entities/seller.entity";
import { DyProductCreatedEvent } from "src/product/events/impl/dy-product-created.event";

@CommandHandler(CreateProductCommand)
export class CreateProductHandler
  implements ICommandHandler<CreateProductCommand> {
  private readonly logger = new Logger(CreateProductHandler.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: ProductRepository,
    private readonly sellerRepository: SellerRepository,
    private readonly eventBusService: EventBusService,
    @Inject(CommandBus) private readonly commandBus: CommandBus,
  ) { }

  async execute(command: CreateProductCommand) {
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
      const discountRate =
        ((originalPrice - discountedPrice) / originalPrice) * 100;
      this.logger.log(`Received expirationDate: ${expirationDate}`);
      this.logger.log(expirationDate);

      // ProductCreatedEvent 생성 및 발행
      const event = new DyProductCreatedEvent(
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
    return name;
  }
}
