import { BadRequestException, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "./entities/product.entity";
import { ProductController } from "./product.controller";
import { ProductRepository } from "./repositories/product.repository";
import { CreateProductHandler } from "./commands/handlers/create-product.handler";
import { ProductView, ProductViewSchema } from "./schemas/product-view.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { CommandHandler, CqrsModule, EventsHandler } from "@nestjs/cqrs";
import { ProductViewRepository } from "./repositories/product-view.repository";
import { GetProductByIdHandler } from "./queries/handlers/get-product-by-id.handler";
import { DeleteProductHandler } from "./commands/handlers/delete-product.handler";
import { UpdateProductHandler } from "./commands/handlers/update-product.handler";
import { ProductUpdatedEventHandler } from "./events/handlers/product-update.handler";
import { ProductDeletedHandler } from "./events/handlers/product-deleted.handler";
import { InventoryCreatedEvent } from "src/inventory/events/impl/inventory-created.event";
import { ProductCreatedHandler } from "./events/handlers/product-created.handler";
import { EventSourcingModule } from "src/shared/infrastructure/event-sourcing";
import { RedisModule } from "src/shared/infrastructure/redis/redis.config";
import { GetProductByDiscountRateHandler } from "./queries/handlers/get-products-by-discountRate.handler";
import { Seller } from "src/sellers/entities/seller.entity";
import { SellerRepository } from "src/sellers/repositories/seller.repository";
import { MulterModule } from "@nestjs/platform-express";
import { extname } from "path";
import { v4 as uuid } from "uuid";
import * as multer from "multer";
import { PRODUCTS_IMAGE_PATH, TEMP_FOLDER_PATH } from "./const/path.const";

const CommandHandlers = [
  CreateProductHandler,
  UpdateProductHandler,
  DeleteProductHandler,
];
const EventsHandlers = [
  InventoryCreatedEvent,
  ProductCreatedHandler,
  ProductUpdatedEventHandler,
  ProductDeletedHandler,
];

@Module({
  imports: [
    CqrsModule,
    EventSourcingModule,
    RedisModule,
    MongooseModule.forFeature([
      { name: ProductView.name, schema: ProductViewSchema },
    ]),
    TypeOrmModule.forFeature([Product, Seller]),
    MulterModule.register({
      limits: {
        // 바이트 단위로 입력
        fileSize: 10000000,
      },
      fileFilter: (req, file, cb) => {
        /**
         * cb(에러, boolean)
         *
         * 첫번째 파라미터에는 에러가 있을경우 에러 정보를 넣어준다.
         * 두번째 파라미터는 파일을 받을지 말지 boolean을 넣어준다.
         */
        // xxx.jpg -> .jpg
        const ext = extname(file.originalname);

        if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
          return cb(
            new BadRequestException("jpg/jpeg/png 파일만 업로드 가능합니다!"),
            false,
          );
        }

        return cb(null, true);
      },
      storage: multer.diskStorage({
        destination: function (req, res, cb) {
          cb(null, PRODUCTS_IMAGE_PATH);
        },
        filename: function (req, file, cb) {
          // 123123-123-123123-123123.png
          cb(null, `${uuid()}${extname(file.originalname)}`);
        },
      }),
    }),
  ],
  providers: [
    ...CommandHandlers,
    ...EventsHandlers,
    ProductRepository,
    SellerRepository,
    ProductViewRepository,
    GetProductByIdHandler,
    GetProductByDiscountRateHandler,
  ],
  controllers: [ProductController],
  exports: [ProductRepository, SellerRepository],
})
export class ProductModule {}
