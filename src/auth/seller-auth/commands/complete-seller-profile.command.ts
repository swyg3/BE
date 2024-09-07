import { CompleteSellerProfileDto } from "../dtos/complete-seller-profile.dto";

export class CompleteSellerProfileCommand {
  constructor(
    public readonly sellerId: string,
    public readonly profileData: CompleteSellerProfileDto,
  ) {}
}
