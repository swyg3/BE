import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserRegisteredEvent } from '../events/user-registered.event';
import { UserViewRepository } from '../../repositories/user-view.repository';
import { Logger } from '@nestjs/common';

@EventsHandler(UserRegisteredEvent)
export class UserRegisteredHandler implements IEventHandler<UserRegisteredEvent> {
  private readonly logger = new Logger(UserRegisteredHandler.name);

  constructor(private readonly userViewRepository: UserViewRepository) {}

  async handle(event: UserRegisteredEvent) {

    this.logger.log(`Handling UserRegisteredEvent for user: ${event.userId}`);

    try {
      await this.userViewRepository.create({
        userId: event.userId,
        email: event.email,
        name: event.name,
        phoneNumber: event.phoneNumber,
        isEmailVerified: event.isEmailVerified,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      this.logger.log(`Users-View 업데이트 성공: ${event.userId}`);
    } catch (error) {
      this.logger.error(`---Users-View 업데이트 실패: ${event.userId}, ${error.message}`, error.stack);
    }
  }
}