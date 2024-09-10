import { LoginEmailDto } from "../../dtos/login-email.dto";
import { Request } from "express";

export class LoginEmailCommand {
  constructor(
    public readonly loginDto: LoginEmailDto,
    public readonly req: Request,
  ) {}
}
