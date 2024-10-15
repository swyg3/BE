import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Event } from "../shared/infrastructure/event-sourcing";
import { UserActivityController } from "./user-activity.controller";
import { UserActivityService } from "./user-activity.service";
import { UserActivityRepository } from "./user-activity.repository";
import { Product } from "src/product/entities/product.entity";
import { User } from "src/users/entities/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Event, Product, User])],
  controllers: [UserActivityController],
  providers: [UserActivityService, UserActivityRepository],
  exports: [UserActivityRepository],
})
export class UserActivitiesModule {}
