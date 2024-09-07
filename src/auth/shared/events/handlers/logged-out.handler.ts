import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { UserLoggedOutEvent } from "../events/logged-out.event";
import { AccessLogService } from "src/user-activities/services/access-log.service";

@EventsHandler(UserLoggedOutEvent)
export class UserLoggedOutEventHandler
  implements IEventHandler<UserLoggedOutEvent>
{
  constructor(private readonly accessLogService: AccessLogService) {}

  async handle(event: UserLoggedOutEvent) {
    const { userId } = event;
    await this.accessLogService.logUserAction({
      userId,
      action: "logout",
      timestamp: new Date(),
    });
  }
}
