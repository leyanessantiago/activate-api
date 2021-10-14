import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendSignupVerifyEmail(
    email: string,
    verificationCode: number,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to Activate',
      template: './signup_verify_email',
      context: {
        verificationCode,
      },
    });
  }

  async sendPasswordResetEmail(
    email: string,
    verificationCode: number,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Your verification code',
      template: './password_reset_email',
      context: {
        verificationCode,
      },
    });
  }
}
