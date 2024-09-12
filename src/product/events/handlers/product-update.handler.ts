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
    const { id, name, productImageUrl, description, originalPrice, discountedPrice, availableStock, expirationDate } = event;

    const updates = {
      ...(name && { name }),
      ...(productImageUrl && { productImageUrl }),
      ...(description && { description }),
      ...(originalPrice && { originalPrice }),
      ...(discountedPrice && { discountedPrice }),
      ...(availableStock !== undefined && { availableStock }),    
      ...(expirationDate && { expirationDate }),    
    };

    await this.productViewModel.updateOne(
      { id: id }, 
      { $set: updates },
    );
  }
}
