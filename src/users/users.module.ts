import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MongooseModule } from "@nestjs/mongoose";
import { UsersController } from "./users.controller";
import { User } from "./entities/user.entity";
import { UserView, UserViewSchema } from "./schemas/user-view.schema";
import * as CommandHandlers from "./commands/handlers";
import * as QueryHandlers from "./queries/handlers";
import * as EventHandlers from "./events/handlers";
import { UserViewRepository } from "./repositories/user-view.repository";
import { EventSourcingModule } from "../shared/infrastructure/event-sourcing/event-sourcing.module";
import { UserRepository } from "./repositories/user.repository";
import { CqrsModule } from "@nestjs/cqrs";
import { RedisModule } from "src/shared/infrastructure/redis/redis.config";
import { PasswordService } from "src/shared/services/password.service";

@Module({
  imports: [
    CqrsModule,
    RedisModule,
    EventSourcingModule,
    TypeOrmModule.forFeature([User]),
    MongooseModule.forFeature([
      { name: UserView.name, schema: UserViewSchema },
    ]),
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
  exports: [UserRepository, UserViewRepository],
})
export class UsersModule {}
