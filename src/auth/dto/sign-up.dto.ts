import { IsEmail, Matches, IsNotEmpty } from 'class-validator';
import { passwordValidation } from '../../constants/validation-rules';

const { regex, message } = passwordValidation;

export class SignUpDTO {
  @IsEmail({}, { message: 'This is not a valid email' })
  @IsNotEmpty()
  email: string;

  @Matches(regex, { message })
  @IsNotEmpty()
  password: string;
}
