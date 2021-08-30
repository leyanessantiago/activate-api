import { IsNotEmpty, Matches } from 'class-validator';
import { passwordValidation } from '../../constants/validation-rules';

const { regex, message } = passwordValidation;

export class ChangePasswordDto {
  @Matches(regex, { message })
  @IsNotEmpty()
  current: string;

  @Matches(regex, { message })
  @IsNotEmpty()
  newPassword: string;
}
