import { Dictionary } from 'express-serve-static-core';

export class ValidationException extends Error {
  validationErrors: Dictionary<string>;

  constructor(validationErrors: Dictionary<string>) {
    super();

    this.validationErrors = validationErrors;
  }
}
