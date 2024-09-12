import { UpdateSellerProfileDto } from "src/sellers/dtos/update-seller-profile.dto";

export class SellerProfileUpdatedEvent {
  eventType = "SellerProfileUpdated";
  aggregateType = "Seller";

  constructor(
    public readonly aggregateId: string,
    public readonly data: UpdateSellerProfileDto,
    public readonly version: number,
  ) {}
}
