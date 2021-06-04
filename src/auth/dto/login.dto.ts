import { IsEmail, Matches, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'This is not a valid email' })
  @IsNotEmpty()
  email: string;

  @Matches(
    /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\^$*.\[\]{}()?\-“!@#%&\/,><’:;|_~`])\S/,
    {
      message:
        'The password must have an upper case and a lower case letter, a number and a special character.',
    },
  )
  @IsNotEmpty()
  password: string;
}
