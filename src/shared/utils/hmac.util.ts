import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";

@Injectable()
export class HmacUtil {
  private readonly secret: string;

  constructor(private readonly configService: ConfigService) {
    this.secret = this.configService.get<string>("HMAC_SECRET");
  }

  sign(email: string, verificationCode: string, expirationTime: Date): string {
    const data = `${email}|${verificationCode}|${expirationTime.getTime()}`;
    return crypto.createHmac("sha256", this.secret).update(data).digest("hex");
  }

  verify(
    email: string,
    verificationCode: string,
    expirationTime: Date,
    signature: string,
  ): boolean {
    const expectedSignature = this.sign(
      email,
      verificationCode,
      expirationTime,
    );
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature),
    );
  }
}
