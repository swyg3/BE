import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { DynamooseModule } from "nestjs-dynamoose";
import * as CommandHandlers from "./commands";
import * as QueryHandlers from "./queries";
import { NotificationSchema } from "./schema/notification.schema";
import { NotificationController } from "./notification.controller";
import { NotificationViewRepository } from "./notification.repository";
import { EventSourcingModule } from "../infrastructure/event-sourcing";

@Module({
  imports: [
    CqrsModule,
    EventSourcingModule,
    DynamooseModule.forFeature([
      {
        name: "NotificationView",
        schema: NotificationSchema,
      },
    ]),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationViewRepository,
    ...Object.values(CommandHandlers),
    ...Object.values(QueryHandlers),
  ],
  exports: [NotificationViewRepository],
})
export class NotificationModule {}
