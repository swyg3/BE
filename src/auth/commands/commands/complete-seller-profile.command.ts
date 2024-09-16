import { CompleteSellerProfileDto } from "../../dtos/complete-seller-profile.dto";

export class CompleteSellerProfileCommand {
  constructor(public readonly profileData: CompleteSellerProfileDto) {}
}
