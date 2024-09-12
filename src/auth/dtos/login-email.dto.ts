import { IsEmail, IsIn, IsString } from "class-validator";

export class LoginEmailDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsIn(["user", "seller"])
  userType: "user" | "seller";
}
