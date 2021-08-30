import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class ProfileDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  lastName: string;

  @IsString()
  @IsOptional()
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
