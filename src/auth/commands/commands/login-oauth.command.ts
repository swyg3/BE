import { LoginOAuthDto } from "../../dtos/login-oauth.dto";

export class LoginOAuthCommand {
  constructor(
    public readonly loginOAuthDto: LoginOAuthDto
  ) {}
}

