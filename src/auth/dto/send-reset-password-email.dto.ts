import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendResetPasswordEmailDto {
  @IsEmail({}, { message: 'This is not a valid email' })
  @IsNotEmpty()
  email: string;
}
