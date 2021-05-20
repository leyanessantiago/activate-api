import { AbstractValidator } from '../../core/validators/abstract-validator';
import { validEmail } from '../../core/utils/utilities';
import { LoginDto } from '../dto/login.dto';

export class LoginValidator extends AbstractValidator<LoginDto> {
  async validate(value: LoginDto): Promise<void> {
    if (!validEmail(value.email))
      this.setValidationError('email', 'This is not a valid email');
  }
}
