import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { ProductUpdatedEvent } from "../impl/product-updated.event";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ProductView } from "src/product/schemas/product-view.schema";
import { Logger } from "@nestjs/common";

@EventsHandler(ProductUpdatedEvent)
export class ProductUpdatedEventHandler
  implements IEventHandler<ProductUpdatedEvent>
{
  private readonly logger = new Logger(ProductUpdatedEventHandler.name);

  constructor(
    @InjectModel(ProductView.name)
    private readonly productViewModel: Model<ProductView>,
  ) {}

  async handle(event: ProductUpdatedEvent): Promise<void> {
    const {
      name,
      productImageUrl,
      description,
      originalPrice,
      discountedPrice,
      discountRate,
      availableStock,
      expirationDate,
      updatedAt,
    } = event.data;

    const updates = {
      ...(name && { name }),
      ...(productImageUrl && { productImageUrl }),
      ...(description && { description }),
      ...(originalPrice !== undefined && { originalPrice }),
      ...(discountedPrice !== undefined && { discountedPrice }),
      ...(discountRate !== undefined && { discountRate }),
      ...(availableStock !== undefined && { availableStock }),
      ...(expirationDate && { expirationDate }),
      ...(updatedAt && { updatedAt }),
    };

    try {
      const result = await this.productViewModel.updateOne(
        { id: event.aggregateId },
        { $set: updates },
      );

      if (result.matchedCount === 0) {
        this.logger.warn(
          `Product view with id ${event.aggregateId} not found.`,
        );
      } else {
        this.logger.log(
          `Product view with id ${event.aggregateId} updated successfully.`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to update product view with id ${event.aggregateId}. Error: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
