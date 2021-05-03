import { IApiResponse } from './iapi-response';
import { Dictionary } from 'express-serve-static-core';

export class ApiResponse {
  errorType: string;
  errorMessage: string;
  successMessage: string;
  statusCode: number;
  developMessage: string;
  validationErros: Dictionary<Array<string>>;

  constructor(apiResponse: IApiResponse) {
    this.errorType = apiResponse.errorType;
    this.errorMessage = apiResponse.errorMessage;
    this.successMessage = apiResponse.message;
    this.statusCode = apiResponse.statusCode;
    this.developMessage = apiResponse.developMessage;
    this.validationErros = apiResponse.validationErrors;
  }

  static Success(statusCode: number, successMessage: string): ApiResponse {
    return new ApiResponse({
      statusCode: statusCode,
      message: successMessage,
    });
  }

  static Fail(statusCode: number, errorMessage: string): ApiResponse {
    return new ApiResponse({
      errorType: 'error',
      statusCode: statusCode,
      errorMessage: errorMessage,
    });
  }

  static ValidationErrors(
    validationErrors: Dictionary<Array<string>>,
  ): ApiResponse {
    return new ApiResponse({
      errorType: 'validation',
      statusCode: 400,
      validationErrors: validationErrors,
    });
  }
}
