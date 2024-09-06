import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { EmailVerificationRequestedEvent } from '../events/email-verify-requested.event';


@EventsHandler(EmailVerificationRequestedEvent)
export class EmailVerificationRequestedHandler implements IEventHandler<EmailVerificationRequestedEvent> {
  private readonly logger = new Logger(EmailVerificationRequestedHandler.name);

  handle(event: EmailVerificationRequestedEvent) {
    this.logger.log(`이메일 인증 요청 이벤트 처리: ${event.email}`);
    /**
     * TODO: 
     * 과도한 요청에 대한 처리(로깅, Slack 알림 등)
     */
  }
}