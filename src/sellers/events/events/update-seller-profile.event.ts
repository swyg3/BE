import { UpdateSellerProfileDto } from "../../dtos/update-seller-profile.dto";

export class SellerProfileUpdatedEvent {
    constructor(
      public readonly sellerId: string,
      public readonly updateData: UpdateSellerProfileDto
    ) {}
  }