export class CreateNotificationCommand {
    constructor(
      public readonly userId: string,
      public readonly message: string,
    ) {}
  }