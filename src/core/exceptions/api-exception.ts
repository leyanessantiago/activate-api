import { HttpStatus } from '@nestjs/common';

export class ApiException extends Error {
  statusCode: number;
  message: string;

  constructor(statusCode: HttpStatus, message: string) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}
