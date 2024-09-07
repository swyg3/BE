import { LoginEmailDto } from "../../dtos/login-email.dto";
import { Request } from "express";

export class LoginEmailCommand {
  constructor(
    public readonly loginDto: LoginEmailDto,
    public readonly userType: "user" | "seller",
    public readonly loginMethod: "email",
    public readonly req: Request,
  ) {}
}
