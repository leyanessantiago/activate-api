import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiResponse } from '../responses/api-response';
import { ValidationException } from '../exceptions/validation-exception';
import { ApiException } from '../exceptions/api-exception';

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception instanceof ValidationException) {
      response
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponse.ValidationErrors(exception.validationErrors));
    } else if (exception instanceof ApiException) {
      response
        .status(exception.statusCode)
        .json(ApiResponse.Fail(exception.statusCode, exception.message));
    } else {
      const status =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;

      const errorMessage =
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Oops something went wrong, please try later.'
          : exception.response.message || exception.message;

      response.status(status).json(ApiResponse.Fail(status, errorMessage));
    }
  }
}
