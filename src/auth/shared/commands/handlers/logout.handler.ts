import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { TokenBlacklistService } from '../../services/token-blacklist.service';
import { LogoutCommand } from '../commands/logout.command';
import { UserLoggedOutEvent } from '../../events/events/logged-out.event';


@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  constructor(
    private readonly tokenBlacklistService: TokenBlacklistService,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: LogoutCommand) {
    const { userId, accessToken, refreshToken } = command;
    
    await Promise.all([
      this.tokenBlacklistService.addToBlacklist(accessToken, 'access'),
      this.tokenBlacklistService.addToBlacklist(refreshToken, 'refresh')
    ]);

    this.eventBus.publish(new UserLoggedOutEvent(userId));

    return { success: true };
  }
}