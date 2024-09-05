import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @Inject('NODEMAILER_TRANSPORTER') private transporter: nodemailer.Transporter,
    private configService: ConfigService
  ) {}

  async sendVerificationEmail(email: string, verificationCode: string): Promise<void> {
    
    try {
      await this.transporter.sendMail({
        from: this.configService.get('MAIL_FROM'),
        to: email,
        subject: '이메일 인증',
        html: `
          <p>아래 인증번호를 입력하여 이메일을 인증해 주세요:</p>
          <h1>인증 번호</h1>
          <h2>${verificationCode}</h2>
          <p>인증번호는 3분 동안 유효합니다.</p>
        `
      });
      this.logger.log(`인증 이메일 발송 성공: ${email}`);
    } catch (error) {
      this.logger.error(`인증 이메일 발송 실패: ${email}, ${error.message}`, error.stack);
      throw error;
    }
  }
}