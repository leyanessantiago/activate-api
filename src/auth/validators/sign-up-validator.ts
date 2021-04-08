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

    await this.checkUniqueEmail(value.email);
    this.validEmail(value.email);

    if (util.stringUndefinedOrNullOrEmpty(value.userName))
      this.setValidationError('userName', 'The user name can not be empty.');

    await this.checkUniqueUserName(value.userName);
  }

  private async checkUniqueEmail(email: string): Promise<void> {
    const user = await this.userServices.findByEmail(email);

    if (user !== null)
      this.setValidationError('email', 'This email is currently in use.');
  }

  private async checkUniqueUserName(userName: string) {
    const user = await this.userServices.findByUserName(userName);

    if (user !== null)
      this.setValidationError(
        'userName',
        'This user name is currently in use.',
      );
  }

  private async validEmail(email: string) {
    const notValid = !util.validEmail(email);

    if (notValid) this.setValidationError('email', 'This is not a valid email');
  }
}
