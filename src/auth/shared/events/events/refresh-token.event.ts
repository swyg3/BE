export class TokenRefreshedEvent {
  public readonly aggregateId: string;
  public readonly version: number = 1;

  constructor(public readonly userId: string, public readonly newAccessToken: string) {
    this.aggregateId = userId;
  }
}