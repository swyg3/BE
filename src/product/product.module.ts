import { BadRequestException, forwardRef, Logger, Module, ValidationPipe } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "./entities/product.entity";
import { ProductController } from "./product.controller";
import { ProductRepository } from "./repositories/product.repository";
import { CreateProductHandler } from "./commands/handlers/create-product.handler";
import { CommandHandler, CqrsModule, EventsHandler, QueryBus } from "@nestjs/cqrs";
import { DeleteProductHandler } from "./commands/handlers/delete-product.handler";
import { InventoryCreatedEvent } from "src/inventory/events/impl/inventory-created.event";
import { EventSourcingModule } from "src/shared/infrastructure/event-sourcing";
import { RedisModule } from "src/shared/infrastructure/redis/redis.config";
import { Seller } from "src/sellers/entities/seller.entity";
import { SellerRepository } from "src/sellers/repositories/seller.repository";
import { MulterModule } from "@nestjs/platform-express";
import { extname } from "path";
import { v4 as uuid } from "uuid";
import * as multer from "multer";
import { PRODUCTS_IMAGE_PATH, TEMP_FOLDER_PATH } from "./const/path.const";
import { DynamooseModule } from "nestjs-dynamoose";
import { ProductSchema } from "./schemas/product-view.shema";
import { ProductCreatedHandler } from "./events/handlers/product-created.handler";
import { SellersModule } from "src/sellers/sellers.module";
import { ProductViewRepository } from "./repositories/product-view.repository";
import { GetProductByIdHandler } from "./queries/handlers/get-product-by-id.handler";
import { GeocodingController } from "./geocodingcotroller";
import { GeocodingService } from "./geocodingservice";
import { NaverMapsClient } from "src/shared/infrastructure/database/navermap.config";
import { HttpModule } from "@nestjs/axios";
import { GetNearestProductsHandler } from "./queries/handlers/get-nearest-products.handler";
import { FindProductsByCategoryHandler } from "./queries/handlers/get-product-by-category.handler";
import { GetProductByDiscountRateHandler } from "./queries/handlers/get-products-by-discountRate.handler";
import { UserLocation2Schema } from "src/location/schemas/location-view.schema";
import { LocationModule } from "src/location/location.module";
import { LocationViewRepository } from "src/location/repositories/location-view.repository";
import { ProductService } from "./product.service";
import { Inventory } from "src/inventory/inventory.entity";
import { InventoryModule } from "src/inventory/inventory.module";
import { RedisGeo } from "./util/geoadd";
import { SearchProductsHandler } from "./queries/handlers/get-search-products.handler";

const CommandHandlers = [
  CreateProductHandler,
  //UpdateProductHandler,
  DeleteProductHandler,
];
const EventsHandlers = [
  InventoryCreatedEvent,
  ProductCreatedHandler,
];

@Module({
  imports: [
    CqrsModule,
    EventSourcingModule,
    RedisModule,
    TypeOrmModule.forFeature([Product, Seller, Inventory]),
    DynamooseModule.forFeature([
      { name: "ProductView", schema: ProductSchema },
    ]),
    DynamooseModule.forFeature([
      { 
        name: 'LocationView2',
        schema: UserLocation2Schema,
      }
    ]),
    SellersModule,
    forwardRef(() => LocationModule),
    InventoryModule, 
    HttpModule,
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

        if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png"&& ext !== ".PNG") {
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
    LocationViewRepository,
    GetProductByIdHandler,
    FindProductsByCategoryHandler,
    GetNearestProductsHandler,
    Logger,
    HttpModule,
    GeocodingService,
    NaverMapsClient,
    SearchProductsHandler,
    GetProductByDiscountRateHandler,
    ProductService,
    RedisGeo
    
  ],
  controllers: [ProductController,GeocodingController],
  exports: [ProductRepository, SellerRepository,
     ProductViewRepository,NaverMapsClient,ProductService
  ],
})
export class ProductModule {}
