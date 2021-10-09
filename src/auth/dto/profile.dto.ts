import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { userNameValidation } from '../../constants/validation-rules';

const { regex, message } = userNameValidation;

export class ProfileDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  lastName: string;

  @IsString()
  @IsOptional()
  @Matches(regex, { message })
  userName: string;

  @IsOptional()
  @IsEmail({}, { message: 'This is not a valid email' })
  email: string;

  @IsString()
  @IsOptional()
  avatar: string;

  @IsNumber()
  @IsOptional()
  verificationLevel: number;
}
