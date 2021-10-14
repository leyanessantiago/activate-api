import { IsEmail, IsNotEmpty, IsNumber, Matches } from 'class-validator';
import { passwordValidation } from '../../constants/validation-rules';

const { regex, message } = passwordValidation;

export class ResetPasswordDto {
  @IsEmail({}, { message: 'This is not a valid email' })
  @IsNotEmpty()
  email: string;

  @IsNumber()
  @IsNotEmpty()
  verificationCode: number;

  @Matches(regex, { message })
  @IsNotEmpty()
  newPassword: string;
}
