import { AbstractValidator } from '../../core/validators/abstract-validator';
import { Injectable } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { SignUpDto } from '../dto/sign-up.dto';
import {
  commonRules,
  ValidationResult,
  validateEntity,
} from '../../helpers/form-validations';

const rules = {
  email: [commonRules.required, commonRules.email],
  password: [commonRules.required, commonRules.password],
};

@Injectable()
export class SignUpValidationPipe extends AbstractValidator<SignUpDto> {
  constructor(private userServices: UserService) {
    super();
  }

  async validate(credentials: SignUpDto): Promise<ValidationResult> {
    const { hasErrors, errors } = validateEntity(credentials, rules);

    if (hasErrors) {
      return { hasErrors, errors };
    }

    const isUniqueEmail = await this.checkIsUniqueEmail(credentials.email);

    if (!isUniqueEmail) {
      return {
        hasErrors: true,
        errors: {
          email: 'This email is currently in use.',
        },
      };
    }

    return { hasErrors: false, errors: undefined };
  }

  private async checkIsUniqueEmail(email: string): Promise<boolean> {
    const user = await this.userServices.findByEmail(email);
    return !user;
  }
}
