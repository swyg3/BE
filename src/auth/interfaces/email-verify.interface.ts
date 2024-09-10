export interface IEmailVerification {
  email: string;
  verificationCode: string;
  expirationTime: Date;
  signature: string;
}
