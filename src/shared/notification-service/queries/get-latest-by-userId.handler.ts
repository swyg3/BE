import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetLatestNotificationsQuery } from "./get-latest-by-userId.query";
import {
  NotificationView,
  NotificationViewRepository,
} from "../notification.repository";

@QueryHandler(GetLatestNotificationsQuery)
export class GetLatestNotificationsHandler
  implements IQueryHandler<GetLatestNotificationsQuery>
{
  constructor(
    private readonly notificationViewRepository: NotificationViewRepository,
  ) {}

  async execute(
    query: GetLatestNotificationsQuery,
  ): Promise<NotificationView[]> {
    const { userId } = query;
    return this.notificationViewRepository.findLatestByUserId(userId, 5);
  }
}
