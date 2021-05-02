import { AbstractValidator } from '../../core/validators/abstract-validator';
import { Injectable } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { SignUpDto } from '../dto/sign-up.dto';
import * as util from '../../core/utils/utilities';

@Injectable()
export class SignUpValidationPipe extends AbstractValidator<SignUpDto> {
  constructor(private userServices: UserService) {
    super();
  }

  async validate(value: SignUpDto): Promise<void> {
    if (util.stringUndefinedOrNullOrEmpty(value.email))
      this.setValidationError('email', 'The email can not be empty.');

    if (!util.stringUndefinedOrNullOrEmpty(value.email)) {
      await this.checkUniqueEmail(value.email);
      this.validEmail(value.email);
    }
  }

  private async checkUniqueEmail(email: string): Promise<void> {
    const user = await this.userServices.findByEmail(email);

    if (user !== null)
      this.setValidationError('email', 'This email is currently in use.');
  }

  private async validEmail(email: string) {
    const notValid = !util.validEmail(email);

    if (notValid) this.setValidationError('email', 'This is not a valid email');
  }
}
