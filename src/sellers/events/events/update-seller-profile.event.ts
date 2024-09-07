import { UpdateSellerProfileDto } from "src/sellers/dtos/update-seller-profile.dto";

export class SellerProfileUpdatedEvent {
  constructor(
    public readonly sellerId: string,
    public readonly updateData: UpdateSellerProfileDto,
  ) {}
}
