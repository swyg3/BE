export class UserLoggedInEvent {
  public readonly aggregateId: string;
  public readonly version: number;

  constructor(
    public readonly userId: string,
    public readonly userType: 'user' | 'seller',
    public readonly loginMethod: string,
    public readonly accessToken: string,
    version: number = 1
  ) {
    this.aggregateId = userId;
    this.version = version;
  }
}