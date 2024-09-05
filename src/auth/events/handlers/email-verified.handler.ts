import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { EmailVerifiedEvent } from '../events/email-verified.event';

@EventsHandler(EmailVerifiedEvent)
export class EmailVerifiedHandler implements IEventHandler<EmailVerifiedEvent> {
  private readonly logger = new Logger(EmailVerifiedHandler.name);

  handle(event: EmailVerifiedEvent) {
    this.logger.log(`이메일 인증 이벤트 처리: ${event.email}`);
    
    /**
     * TODO
     * 이메일 인증 실패 통계 혹은 사용 패턴 추적 등
     */
  }
}