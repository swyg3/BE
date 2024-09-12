import { BaseEvent } from "src/shared/infrastructure/event-sourcing";

export class SellerRegisteredEvent implements BaseEvent {
  eventType = "SellerRegistered";
  aggregateType = "Seller";

  constructor(
    public readonly aggregateId: string,
    public readonly data: {
      email: string;
      name: string;
      phoneNumber: string;
      storeName: string;
      storeAddress: string;
      storePhoneNumber: string;
      isEmailVerified: boolean;
      isBusinessNumberVerified: boolean;
    },
    public readonly version: number,
  ) {}
}
