export class UpdateNotificationCommand {
    constructor(
      public readonly id: string,
      public readonly message?: string,
      public readonly isRead?: boolean
    ) {}
  }