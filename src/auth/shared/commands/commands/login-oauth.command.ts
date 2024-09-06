export class LoginOAuthCommand {
    constructor(
      public readonly user: any,
      public readonly provider: string,
      public readonly userType: 'user' | 'seller',
      public readonly providerType: 'google' | 'kakao',
      public readonly req: any
    ) {}
  }