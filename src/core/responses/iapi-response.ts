import { Dictionary } from 'express-serve-static-core';

export interface IApiResponse {
  errorType?: 'error' | 'validation';
  errorMessage?: string;
  message?: string;
  statusCode: number;
  developMessage?: string;
  validationErrors?: Dictionary<string>;
}
