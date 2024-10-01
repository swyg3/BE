import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateNotificationCommand } from './commands/create-notification.command';
import { GetNotificationsQuery } from './queries/get-list-by-userId.query';
import { UpdateNotificationCommand } from './commands/update-notification.command';
import { DeleteNotificationCommand } from './commands/delete-notification.command';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async createNotification(@Body() createNotificationDto: any) {
    return this.commandBus.execute(
      new CreateNotificationCommand(
        createNotificationDto.userId,
        createNotificationDto.message,
      )
    );
  }

  @Get()
  async getNotifications(@Query('userId') userId: string) {
    return this.queryBus.execute(new GetNotificationsQuery(userId));
  }

  @Put(':id')
  async updateNotification(
    @Param('id') id: string,
    @Body() updateNotificationDto: any
  ) {
    return this.commandBus.execute(
      new UpdateNotificationCommand(
        id,
        updateNotificationDto.message,
        updateNotificationDto.isRead
      )
    );
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteNotificationCommand(id));
  }
}