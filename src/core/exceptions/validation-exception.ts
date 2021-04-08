import { Dictionary } from 'express-serve-static-core';

export class ValidationException extends Error {
  validationErrors: Dictionary<Array<string>>;

  constructor(validationErrors: Dictionary<Array<string>>) {
    super();

    this.validationErrors = validationErrors;
  }
}
