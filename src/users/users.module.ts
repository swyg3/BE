import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MongooseModule } from "@nestjs/mongoose";
import { UsersController } from "./users.controller";
import { User } from "./entities/user.entity";
import { UserView, UserViewSchema } from "./schemas/user-view.schema";
import { RegisterUserHandler } from "./commands/handlers/register-user.handler";
import { GetUserProfileHandler } from "./queries/handlers/get-user-profile.handler";
import { UserRegisteredHandler } from "./events/handlers/user-registered.handler";
import { UserViewRepository } from "./repositories/user-view.repository";
import { EventSourcingModule } from "../shared/infrastructure/event-sourcing/event-sourcing.module";
import { PasswordService } from "./services/password.service";
import { UserProfileUpdatedHandler } from "./events/handlers/user-profile-updated.handler";
import { UpdateUserProfileHandler } from "./commands/handlers/update-user-profile.handler";
import {
  REDIS_CLIENT,
  RedisModule,
} from "src/shared/infrastructure/redis/redis.config";
import { UserRepository } from "./repositories/user.repository";
const CommandHandlers = [RegisterUserHandler, UpdateUserProfileHandler];
const QueryHandlers = [GetUserProfileHandler];
const EventHandlers = [UserRegisteredHandler, UserProfileUpdatedHandler];

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MongooseModule.forFeature([
      { name: UserView.name, schema: UserViewSchema },
    ]),
    EventSourcingModule,
    RedisModule,
  ],
  controllers: [UsersController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
    UserViewRepository,
    PasswordService,
    UserRepository,
  ],
  exports: [UserRepository],
})
export class UsersModule {}
