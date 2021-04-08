import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { Dictionary } from 'express-serve-static-core';
import { ValidationException } from '../exceptions/validation-exception';

export abstract class AbstractValidator<T> implements PipeTransform<T> {
  private validationErrors: Dictionary<Array<string>> = {};

  async transform(value: T, metadata: ArgumentMetadata) {
    for (const key in Object.getOwnPropertyDescriptors(value)) {
      this.validationErrors[key] = [];
    }

    await this.validate(value);

    const validationResponse: Dictionary<Array<string>> = {};
    for (const key in this.validationErrors) {
      if (this.validationErrors[key].length > 0)
        validationResponse[key] = this.validationErrors[key];
    }

    if (Object.keys(validationResponse).length > 0)
      throw new ValidationException(validationResponse);

    return value;
  }

  protected setValidationError(propertyName: string, error: string): void {
    if (this.validationErrors[propertyName] !== undefined)
      this.validationErrors[propertyName].push(error);
  }

  abstract validate(value: T): Promise<void>;
}
