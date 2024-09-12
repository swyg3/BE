import { Injectable } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { RequestEmailVerificationCommand } from "../commands/commands/request-email-verification.command";
import { VerifyEmailCommand } from "../commands/commands/verify-email.command";

@Injectable()
export class EmailVerificationService {
  constructor(private readonly commandBus: CommandBus) {}

  async requestVerification(email: string): Promise<void> {
    await this.commandBus.execute(new RequestEmailVerificationCommand(email));
  }

  async verifyEmail(email: string, verificationCode: string): Promise<boolean> {
    return await this.commandBus.execute(
      new VerifyEmailCommand(email, verificationCode),
    );
  }
}
