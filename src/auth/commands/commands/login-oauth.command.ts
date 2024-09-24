import { LoginOAuthDto } from "../../dtos/login-oauth.dto";

export class LoginOAuthCommand {
  constructor(
    public readonly provider: string,
    public readonly oneTimeToken: string,
    public readonly userType: string,
  ) {}
}
