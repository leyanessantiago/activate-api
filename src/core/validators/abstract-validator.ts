import { PipeTransform } from '@nestjs/common';
import { ValidationResult } from 'src/helpers/form-validations';
import { ValidationException } from '../exceptions/validation-exception';

export abstract class AbstractValidator<T> implements PipeTransform<T> {
  async transform(value: T) {
    const { hasErrors, errors } = await this.validate(value);

    if (hasErrors) {
      throw new ValidationException(errors);
    }

    return value;
  }

  abstract validate(value: T): Promise<ValidationResult>;
}
