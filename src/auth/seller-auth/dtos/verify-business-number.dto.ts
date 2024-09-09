import { IsString } from "class-validator";

export class VerifyBusinessNumberDto {
  @IsString()
  businessNumber: string;
}
