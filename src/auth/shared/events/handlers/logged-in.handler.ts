import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserLoggedInEvent } from '../events/logged-in.event';
import { AccessLogService } from 'src/user-activities/services/access-log.service';
import { Logger } from '@nestjs/common';

@EventsHandler(UserLoggedInEvent)
export class UserLoggedInEventHandler implements IEventHandler<UserLoggedInEvent> {
  private readonly logger = new Logger(UserLoggedInEventHandler.name);
  
  constructor(private readonly accessLogService: AccessLogService) {}

  async handle(event: UserLoggedInEvent) {
    await this.accessLogService.logUserAction({
      userId: event.userId,
      userType: event.userType,
      action: 'login',
      loginMethod: event.loginMethod,
      timestamp: new Date()
    });
    this.logger.log(`로그인 이벤트 처리 완료: ${event.userId}`);
  } catch (error) {
    this.logger.error(`로그인 이벤트 처리 실패: ${error.message}`, error.stack);
  }
}
