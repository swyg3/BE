export class UserLoggedOutEvent {
  public readonly aggregateId: string;
  public readonly version: number = 1;

  constructor(public readonly userId: string) {
    this.aggregateId = userId;
  }
}
