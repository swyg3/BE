import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductController } from './product.controller';
import { ProductRepository } from './repositories/product.repository';
import { ProductCreatedHandler } from './events/handlers/product-created.handler';
import { CreateProductHandler } from './commands/handlers/create-product.handler';
import { ProductView, ProductViewSchema } from './schemas/product-view.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { EventStoreModule } from '../shared/event-store/event-store.module';
import { CommandHandler, CqrsModule, EventsHandler } from '@nestjs/cqrs';
import { ProductViewRepository } from './repositories/product-view.repository';
import { GetProductByIdHandler } from './queries/handlers/get-product-by-id.handler';


const CommandHandlers = [CreateProductHandler]
const EventsHandlers = [ProductCreatedHandler]

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: ProductView.name, schema: ProductViewSchema }]),
    TypeOrmModule.forFeature([Product]),
    EventStoreModule,
  ],
  providers: [
    ...CommandHandlers,
    ...EventsHandlers,
    ProductRepository,
    ProductViewRepository,
    GetProductByIdHandler,
  ],
  controllers: [ProductController],
  exports: [ProductRepository],
  
})
export class ProductModule { }
