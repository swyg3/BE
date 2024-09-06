import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ProductUpdatedEvent } from '../impl/product-updated.event';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductView } from 'src/product/schemas/product-view.schema';

@EventsHandler(ProductUpdatedEvent)
export class ProductUpdatedEventHandler implements IEventHandler<ProductUpdatedEvent> {
  constructor(
    @InjectModel(ProductView.name) private readonly productViewModel: Model<ProductView>,
  ) {}

  async handle(event: ProductUpdatedEvent): Promise<void> {
    const { Id, name, productImageUrl, description, originalPrice, discountedPrice } = event;

    const updates = {
      ...(name && { name }),
      ...(productImageUrl && { productImageUrl }),
      ...(description && { description }),
      ...(originalPrice && { originalPrice }),
      ...(discountedPrice && { discountedPrice }),
    };

   
    await this.productViewModel.updateOne(
      { productId: Id }, 
      { $set: updates },
    );
  }
}
