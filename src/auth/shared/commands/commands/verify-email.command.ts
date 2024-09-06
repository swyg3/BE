export class VerifyEmailCommand {
    constructor(
      public readonly email: string,
      public readonly verificationCode: string
    ) {}
  }