import { ICommand } from "@nestjs/cqrs";
import { OAuthCallbackDto } from "src/auth/dtos/oauth-callback.dto";

export class OAuthCallbackCommand implements ICommand {
  constructor(
    // public readonly oauthCallbackDto: oauthCallbackDto
    public readonly provider: string,
    public readonly code: string,
    public readonly userType: string,
  ) {}
}
