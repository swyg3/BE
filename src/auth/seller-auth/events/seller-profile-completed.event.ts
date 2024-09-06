export class SellerProfileCompletedEvent {
    constructor(
      public readonly sellerId: string,
      public readonly profileData: any
    ) {}
  }