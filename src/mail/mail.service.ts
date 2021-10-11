import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { IUserInfo } from '../auth/models/iuser-info';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserVerificationCode(
    email: string,
    verificationCode: number,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to Activate',
      template: './verification_code',
      context: {
        verificationCode,
      },
    });
  }
}
