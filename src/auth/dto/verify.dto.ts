import { IsNotEmpty, IsNumber } from 'class-validator';

export class VerifyDto {
  @IsNumber()
  @IsNotEmpty()
  code: number;
}
