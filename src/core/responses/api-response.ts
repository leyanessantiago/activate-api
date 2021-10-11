import { IApiResponse } from './iapi-response';
import { Dictionary } from 'express-serve-static-core';

export class ApiResponse {
  errorType: string;
  errorMessage: string;
  successMessage: string;
  statusCode: number;
  developMessage: string;
  validationErrors: Dictionary<string>;

  constructor(apiResponse: IApiResponse) {
    this.errorType = apiResponse.errorType;
    this.errorMessage = apiResponse.errorMessage;
    this.successMessage = apiResponse.message;
    this.statusCode = apiResponse.statusCode;
    this.developMessage = apiResponse.developMessage;
    this.validationErrors = apiResponse.validationErrors;
  }

  static Success(statusCode: number, successMessage: string): ApiResponse {
    return new ApiResponse({
      statusCode: statusCode,
      message: successMessage,
    });
  }

  static Fail(
    statusCode: number,
    errorMessage: string,
    error?: any,
  ): ApiResponse {
    return new ApiResponse({
      errorType: 'error',
      statusCode: statusCode,
      errorMessage: errorMessage,
      developMessage: error,
    });
  }

  static ValidationErrors(validationErrors: Dictionary<string>): ApiResponse {
    return new ApiResponse({
      errorType: 'validation',
      statusCode: 400,
      validationErrors: validationErrors,
    });
  }
}
