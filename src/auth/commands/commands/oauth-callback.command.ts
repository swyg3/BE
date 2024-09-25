import { ICommand } from "@nestjs/cqrs";
import { UserType } from "src/auth/interfaces/user-type.type";

export class OAuthCallbackCommand implements ICommand {
  constructor(
    public readonly provider: string,
    public readonly code: string,
    public readonly userType: UserType,
  ) {}
}
