import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendSignupVerifyEmailDto {
  @IsEmail({}, { message: 'This is not a valid email' })
  @IsNotEmpty()
  email: string;
}
