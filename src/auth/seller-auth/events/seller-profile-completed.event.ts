export class SellerProfileCompletedEvent {
  public readonly aggregateId: string;
  public readonly version: number = 1;

  constructor(
    public readonly sellerId: string,
    public readonly profileData: any,
  ) {
    this.aggregateId = sellerId;
  }
}
