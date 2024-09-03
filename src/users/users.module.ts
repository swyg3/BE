import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { UserView, UserViewSchema } from './schemas/user-view.schema';
import { RegisterUserHandler } from './commands/handlers/register-user.handler';
import { GetUserProfileHandler } from './queries/handlers/get-user-profile.handler';
import { UserRegisteredHandler } from './events/handlers/user-registered.handler';
import { UserViewRepository } from './repositories/user-view.repository';
import { EventStoreModule } from '../shared/infrastructure/event-store/event-store.module';

const CommandHandlers = [RegisterUserHandler];
const QueryHandlers = [GetUserProfileHandler];
const EventHandlers = [UserRegisteredHandler];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([User]),
    MongooseModule.forFeature([{ name: UserView.name, schema: UserViewSchema }]),
    EventStoreModule,
  ],
  controllers: [UsersController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
    UserViewRepository,
  ],
})
export class UsersModule {}