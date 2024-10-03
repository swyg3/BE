import { BaseEvent } from "src/shared/infrastructure/event-sourcing";

export class SellerLoggedInEvent implements BaseEvent {
  readonly eventType = "SellerLoggedIn";
  readonly aggregateType = "Seller";

  constructor(
    public readonly aggregateId: string,
    public readonly data: {
      provider: string;
      email: string;
      name: string;
      phoneNumber: string;
      isNewSeller: boolean;
      isEmailVerified: boolean;
      storeName: string;
      storeAddress: string;
      storePhoneNumber: string;
      isBusinessNumberVerified: boolean;
      agreeReceiveLocation: boolean;
      timestamp: Date;
    },
    public readonly version: number,
  ) {}
}
