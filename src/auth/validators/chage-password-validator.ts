import { AbstractValidator } from '../../core/validators/abstract-validator';
import {
  commonRules,
  ValidationResult,
  validateEntity,
} from '../../helpers/form-validations';
import { ChangePasswordDto } from '../dto/change-password.dto';

const rules = {
  current: [commonRules.required, commonRules.password],
  newPassword: [commonRules.required, commonRules.password],
};

export class ChangePasswordValidator extends AbstractValidator<ChangePasswordDto> {
  async validate(credentials: ChangePasswordDto): Promise<ValidationResult> {
    return validateEntity(credentials, rules);
  }
}
