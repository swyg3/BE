import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { TokenBlacklistService } from "../../services/token-blacklist.service";
import { LogoutCommand } from "../commands/logout.command";
import { UserLoggedOutEvent } from "../../events/events/logged-out.event";
import { EventBusService } from "src/shared/infrastructure/event-sourcing/event-bus.service";

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  constructor(
    private readonly tokenBlacklistService: TokenBlacklistService,
    private readonly eventBusService: EventBusService,
  ) {}

  async execute(command: LogoutCommand) {
    const { userId, accessToken, refreshToken } = command;

    await Promise.all([
      this.tokenBlacklistService.addToBlacklist(accessToken, "access"),
      this.tokenBlacklistService.addToBlacklist(refreshToken, "refresh"),
    ]);

    await this.eventBusService.publishAndSave(new UserLoggedOutEvent(userId));

    return { success: true };
  }
}
