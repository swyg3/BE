export class UserRegisteredEvent {
    constructor(
      public readonly userId: string,
      public readonly email: string,
      public readonly name: string,
      public readonly phoneNumber: string,
      public readonly isEmailVerified: boolean,
      public readonly version: number
    ) {}
  }