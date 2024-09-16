import { BaseEvent } from "src/shared/infrastructure/event-sourcing";

export class SellerLoggedInEvent implements BaseEvent {
  readonly eventType = "SellerLoggedIn";
  readonly aggregateType = "Seller";

  constructor(
    public readonly aggregateId: string,
    public readonly data: {
      email: string;
      provider: string;
      isNewSeller: boolean;
      isEmailVerified: boolean;
      isBusinessNumberVerified: boolean;
      timestamp: Date;
    },
    public readonly version: number,
  ) {}
}
