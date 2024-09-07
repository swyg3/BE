export class SellerRegisteredEvent {
  public readonly aggregateId: string;
  public readonly version: number;

  constructor(
    public readonly sellerId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly phoneNumber: string,
    public readonly storeName: string,
    public readonly storeAddress: string,
    public readonly storePhoneNumber: string,
    public readonly isEmailVerified: boolean,
    version: number = 1,
  ) {
    this.aggregateId = sellerId;
    this.version = version;
  }
}
