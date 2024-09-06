import { IsEmail, IsString, MinLength } from 'class-validator';

export class CompleteSellerProfileDto {

  @IsString()
  storeName: string;

  @IsString()
  storeAddress: string;

  @IsString()
  storePhoneNumber: string;

}