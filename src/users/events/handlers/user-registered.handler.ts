import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserRegisteredEvent } from '../events/user-registered.event';
import { UserViewRepository } from '../../repositories/user-view.repository';

@EventsHandler(UserRegisteredEvent)
export class UserRegisteredHandler implements IEventHandler<UserRegisteredEvent> {
  constructor(private readonly userViewRepository: UserViewRepository) {}

  async handle(event: UserRegisteredEvent) {
    await this.userViewRepository.create({
      id: event.userId,
      email: event.email,
      name: event.name,
      phoneNumber: event.phoneNumber,
      isSeller: event.isSeller,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
}