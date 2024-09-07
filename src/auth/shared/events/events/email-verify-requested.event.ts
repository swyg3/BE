export class EmailVerificationRequestedEvent {
  constructor(
    public readonly email: string,
    public readonly verificationCode: string,
    public readonly expirationTime: Date,
  ) {}
}
