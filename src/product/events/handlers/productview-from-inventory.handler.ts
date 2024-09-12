/*import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InventoryCreatedEvent } from '../../inventory/events/inventory-created.event';

@EventsHandler(InventoryCreatedEvent)
export class ProductViewFromInventoryHandler implements IEventHandler<InventoryCreatedEvent> {
  constructor(
    private readonly productViewRepository: ProductViewRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async handle(event: InventoryCreatedEvent) {
    const { inventoryId, productId, quantity, expirationDate } = event;

    // productId로 Product 데이터를 조회하고, ProductView 생성
    const product = await this.productRepository.findById(productId);
    if (product) {
      await this.productViewRepository.createProduct({
        Id: inventoryId,
        productId: productId,
        productName: product.name,
        productImageUrl: product.imageUrl,
        description: product.description,
        originalPrice: product.originalPrice,
        discountedPrice: product.discountedPrice,
        quantity: quantity,
        expirationDate: expirationDate,
      });
    }
  }
}*/
