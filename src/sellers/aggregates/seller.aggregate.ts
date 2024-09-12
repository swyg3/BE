import { AggregateRoot } from "@nestjs/cqrs";
import { SellerRegisteredEvent } from "../events/events/register-seller.event";

export class SellerAggregate extends AggregateRoot {
  private isBusinessNumberVerified: boolean = false;
  private version: number = 0;

  constructor(private readonly id: string) {
    super();
  }

  register(
    email: string,
    name: string,
    phoneNumber: string,
    storeName: string,
    storeAddress: string,
    storePhoneNumber: string,
    isEmailVerified: boolean = false,
    isBusinessNumberVerified: boolean = false,
  ) {
    this.version++;
    const event = new SellerRegisteredEvent(
      this.id,
      {
        email,
        name,
        phoneNumber,
        storeName,
        storeAddress,
        storePhoneNumber,
        isEmailVerified,
        isBusinessNumberVerified: isBusinessNumberVerified,
      },
      this.version,
    );
    this.apply(event);
    return event;
  }

  setBusinessNumberVerification(isVerified: boolean) {
    this.isBusinessNumberVerified = isVerified;
  }

  private onSellerRegisteredEvent(event: SellerRegisteredEvent) {
    this.isBusinessNumberVerified = event.data.isBusinessNumberVerified;
    this.version = event.version;
  }

  get businessNumberVerified(): boolean {
    return this.isBusinessNumberVerified;
  }

  get currentVersion(): number {
    return this.version;
  }
}
