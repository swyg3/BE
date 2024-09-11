import { ICommand } from '@nestjs/cqrs';
import { OAuthCallbackDto } from 'src/auth/dtos/oauth-callback.dto';

export class OAuthCallbackCommand implements ICommand {
  constructor(
    public readonly oauthCallbackDto: OAuthCallbackDto
  ) {}
}
