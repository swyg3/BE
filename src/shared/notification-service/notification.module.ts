import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DynamooseModule } from 'nestjs-dynamoose';
import * as CommandHandlers from './commands';
import * as EventHandlers from './events';
import { NotificationSchema } from './schema/notification.schema';
import { NotificationController } from './notification.controller';
import { NotificationViewRepository } from './notification.repository';

@Module({
  imports: [
    CqrsModule,
    DynamooseModule.forFeature([
      {
        name: 'Notification',
        schema: NotificationSchema,
      },
    ]),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationViewRepository,
    ...Object.values(CommandHandlers),
    ...Object.values(EventHandlers),
  ],
  exports: [NotificationViewRepository],
})
export class NotificationModule {}