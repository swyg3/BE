import { RegisterSellerDto } from "src/sellers/dtos/register-seller.dto";

export class RegisterSellerCommand {
  constructor(public readonly registerSellerDto: RegisterSellerDto) {}
}