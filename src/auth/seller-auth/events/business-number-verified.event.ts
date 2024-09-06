export class BusinessNumberVerifiedEvent {
    constructor(
      public readonly sellerId: string,
      public readonly businessNumber: string
    ) {}
  }