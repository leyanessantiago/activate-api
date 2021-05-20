import { PipeTransform } from '@nestjs/common';
import { Dictionary } from 'express-serve-static-core';
import { ValidationException } from '../exceptions/validation-exception';

export abstract class AbstractValidator<T> implements PipeTransform<T> {
  private validationErrors: Dictionary<string> = {};

  async transform(value: T) {
    for (const key in Object.getOwnPropertyDescriptors(value)) {
      this.validationErrors[key] = '';
    }

    await this.validate(value);

    const validationResponse: Dictionary<string> = {};

    for (const key in this.validationErrors) {
      if (this.validationErrors[key])
        validationResponse[key] = this.validationErrors[key];
    }

    if (Object.keys(validationResponse).length > 0)
      throw new ValidationException(validationResponse);

    return value;
  }

  protected setValidationError(propertyName: string, error: string): void {
    if (this.validationErrors[propertyName] !== undefined)
      this.validationErrors[propertyName] = error;
  }

  abstract validate(value: T): Promise<void>;
}
