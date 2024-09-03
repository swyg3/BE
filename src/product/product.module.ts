import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductController } from './product.controller';
import { ProductRepository } from './repositories/product.repository';
import { ProductCreatedHandler } from './events/handlers/product-created.handler';
import { CreateProductHandler } from './commands/handlers/create-product.handler';
import { ProductView, ProductViewSchema } from './schemas/product-view.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { EventStoreModule } from 'src/shared/event-store/event-store.module';
import { CommandHandler, EventsHandler } from '@nestjs/cqrs';


export const CommandHandlers = [ProductCreatedHandler]
export const EventsHandlers = [CreateProductHandler]
@Module({
  imports: [
    MongooseModule.forFeature([{ name: ProductView.name, schema: ProductViewSchema }]),
    TypeOrmModule.forFeature([Product]),
    EventStoreModule,
  ],
  providers: [ProductRepository,
    ...CommandHandlers,
    ...EventsHandlers,
    ProductView,
    ProductRepository
  ],
  controllers: [ProductController],
  exports: [TypeOrmModule],
})
export class ProductModule { }
