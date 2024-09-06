import { AggregateRoot } from '@nestjs/cqrs';
import { BusinessNumberVerifiedEvent } from 'src/auth/seller-auth/events/business-number-verified.event';

export class SellerAggregate extends AggregateRoot {
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
    isEmailVerified: boolean = false
  ) {
    const event = new SellerRegisteredEvent(
      this.id, 
      email, 
      name, 
      phoneNumber, 
      storeName, 
      storeAddress, 
      storePhoneNumber, 
      isEmailVerified, 
      1
    );
    this.apply(event);
    return [event];
  }

  verifyBusinessNumber(businessNumber: string) {
    const event = new BusinessNumberVerifiedEvent(this.id, businessNumber, 1);
    this.apply(event);
    return [event];
  }
}