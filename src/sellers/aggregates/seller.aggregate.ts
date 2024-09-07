import { AggregateRoot } from "@nestjs/cqrs";
import { BusinessNumberVerifiedEvent } from "src/auth/seller-auth/events/business-number-verified.event";
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
  ) {
    this.version++;
    const event = new SellerRegisteredEvent(
      this.id,
      email,
      name,
      phoneNumber,
      storeName,
      storeAddress,
      storePhoneNumber,
      isEmailVerified,
      this.version,
    );
    this.apply(event);
    return [event];
  }

  verifyBusinessNumber() {
    if (this.isBusinessNumberVerified) {
      throw new Error("사업자 등록번호가 이미 인증되었습니다.");
    }
    this.version++;
    const event = new BusinessNumberVerifiedEvent(this.id, this.version);
    this.apply(event);
    return [event];
  }

  onBusinessNumberVerifiedEvent(event: BusinessNumberVerifiedEvent) {
    this.isBusinessNumberVerified = true;
    this.version = event.version;
  }

  get businessNumberVerified(): boolean {
    return this.isBusinessNumberVerified;
  }

  get currentVersion(): number {
    return this.version;
  }
}
