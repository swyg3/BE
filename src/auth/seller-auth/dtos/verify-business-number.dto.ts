import { IsEmail, IsString, MinLength } from 'class-validator';

export class VerifyBusinessNumberDto {

  @IsString()
  businessNumber: string;

}