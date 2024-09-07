export class BusinessNumberVerifiedEvent {
  public readonly aggregateId: string;
  public readonly version: number;

  constructor(sellerId: string, version: number) {
    this.aggregateId = sellerId;
    this.version = version;
  }
}
