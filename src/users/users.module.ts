import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersController } from "./users.controller";
import { User } from "./entities/user.entity";
import * as CommandHandlers from "./commands/handlers";
import * as QueryHandlers from "./queries/handlers";
import * as EventHandlers from "./events/handlers";
import { EventSourcingModule } from "../shared/infrastructure/event-sourcing/event-sourcing.module";
import { UserRepository } from "./repositories/user.repository";
import { CqrsModule } from "@nestjs/cqrs";
import { RedisModule } from "src/shared/infrastructure/redis/redis.config";
import { PasswordService } from "src/shared/services/password.service";
import { DynamooseModule } from "nestjs-dynamoose";
import { UserSchema } from "./schemas/user-view.schema";
import { UserViewRepository } from "./repositories/user-view.repository";
import { NotificationModule } from "src/shared/notification-service/notification.module";
import { LocationModule } from "src/location/location.module";

@Module({
  imports: [
    CqrsModule,
    RedisModule,
    EventSourcingModule,
    NotificationModule,
    TypeOrmModule.forFeature([User]),
    DynamooseModule.forFeature([{ name: "UserView", schema: UserSchema }]),
    forwardRef(() => LocationModule),
  ],
  controllers: [UsersController],
  providers: [
    ...Object.values(CommandHandlers),
    ...Object.values(QueryHandlers),
    ...Object.values(EventHandlers),
    UserViewRepository,
    UserRepository,
    PasswordService,
  ],
  exports: [UserRepository, UserViewRepository,TypeOrmModule],
})
export class UsersModule {}
