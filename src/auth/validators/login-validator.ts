import { AbstractValidator } from '../../core/validators/abstract-validator';
import { LoginDto } from '../dto/login.dto';

import {
  commonRules,
  ValidationResult,
  validateEntity,
} from '../../helpers/form-validations';

const rules = {
  email: [commonRules.required, commonRules.email],
  password: [commonRules.required, commonRules.password],
};

export class LoginValidator extends AbstractValidator<LoginDto> {
  async validate(credentials: LoginDto): Promise<ValidationResult> {
    return validateEntity(credentials, rules);
  }
}
