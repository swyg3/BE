import { AggregateRoot } from '@nestjs/cqrs';
import { UserRegisteredEvent } from '../events/events/user-registered.event';

export class UserAggregate extends AggregateRoot {
  constructor(private readonly id: string) {
    super();
  }

  register(email: string, name: string, phoneNumber: string, isSeller: boolean = false) {
    const event = new UserRegisteredEvent(this.id, email, name, phoneNumber, isSeller, 1);
    this.apply(event);
    return [event];
  }
}