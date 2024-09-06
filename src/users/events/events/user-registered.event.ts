export class UserRegisteredEvent {
  public readonly aggregateId: string;
  public readonly version: number;

  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly phoneNumber: string,
    public readonly isEmailVerified: boolean,
    version: number = 1
  ) {
    this.aggregateId = userId;
    this.version = version;
  }
}