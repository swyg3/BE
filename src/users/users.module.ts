import { Module } from "@nestjs/common";
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
import { DyUserSchema } from "./schemas/dy-user-view.schema";
import { DyUserViewRepository } from "./repositories/dy-user-view.repository";

@Module({
  imports: [
    CqrsModule,
    RedisModule,
    EventSourcingModule,
    TypeOrmModule.forFeature([User]),
    DynamooseModule.forFeature([{ name: 'UserView', schema: DyUserSchema }]),
  ],
  controllers: [UsersController],
  providers: [
    ...Object.values(CommandHandlers),
    ...Object.values(QueryHandlers),
    ...Object.values(EventHandlers),
    DyUserViewRepository,
    UserRepository,
    PasswordService,
  ],
  exports: [UserRepository, DyUserViewRepository],
})
export class UsersModule {}
