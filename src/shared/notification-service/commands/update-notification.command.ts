export class UpdateNotificationCommand {
  constructor(
    public readonly userId: string,
    public readonly messageId: string,
  ) {}
}
