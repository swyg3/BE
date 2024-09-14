import { AggregateRoot } from "@nestjs/cqrs";
import { UserRegisteredEvent } from "../events/events/user-registered.event";

export class UserAggregate extends AggregateRoot {
  private version: number = 0;

  constructor(private readonly id: string) {
    super();
  }

  register(
    email: string,
    name: string,
    phoneNumber: string,
    isEmailVerified: boolean = false,
  ) {
    this.version++;
    const event = new UserRegisteredEvent(
      this.id,
      {
        email,
        name,
        phoneNumber,
        isEmailVerified,
      },
      this.version,
    );
    this.apply(event);
    return [event];
  }

  get currentVersion(): number {
    return this.version;
  }
}
