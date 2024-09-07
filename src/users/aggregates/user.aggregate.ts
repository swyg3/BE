import { AggregateRoot } from "@nestjs/cqrs";
import { UserRegisteredEvent } from "../events/events/user-registered.event";

export class UserAggregate extends AggregateRoot {
  constructor(private readonly id: string) {
    super();
  }

  register(
    email: string,
    name: string,
    phoneNumber: string,
    isEmailVerified: boolean = false,
  ) {
    const event = new UserRegisteredEvent(
      this.id,
      email,
      name,
      phoneNumber,
      isEmailVerified,
      1,
    );
    this.apply(event);
    return [event];
  }
}
