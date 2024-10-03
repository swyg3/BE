import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetNotificationsQuery } from './get-list-by-userId.query';
import { NotificationViewRepository } from '../notification.repository';

@QueryHandler(GetNotificationsQuery)
export class GetNotificationsHandler implements IQueryHandler<GetNotificationsQuery> {
  constructor(private readonly notificationRepository: NotificationViewRepository) {}

  async execute(query: GetNotificationsQuery) {
    const { userId } = query;
    return this.notificationRepository.findByUserId(userId);
  }
}