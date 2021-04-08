import { Dictionary } from 'express-serve-static-core';

export interface IApiResponse {
  success: boolean;
  errorMessage?: string;
  message?: string;
  statusCode: number;
  developMessage?: string;
  validationErrors?: Dictionary<Array<string>>;
}
