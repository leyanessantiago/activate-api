import {
  Controller,
  Post,
  Body,
  UsePipes,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { response } from 'express';
import { SignUpValidationPipe } from './validators/sign-up-validator';
import { UserInfo } from './models/user-info';
import { ApiException } from '../core/exceptions/api-exception';
import { LoginDto } from './dto/login.dto';
import { LoginValidator } from './validators/login-validator';
import { Public } from '../core/jwt/public.decorator';
import { VerifyDto } from './dto/verify.dto';
import { CurrentUser } from 'src/core/jwt/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @UsePipes(SignUpValidationPipe)
  @Public()
  async signUp(@Body() signUp: SignUpDto): Promise<UserInfo> {
    const user = await this.authService.signUp(signUp);

    if (user !== null) {
      return user;
    }

    throw new ApiException(
      HttpStatus.BAD_REQUEST,
      'Error creating the account, please try later.',
    );
  }

  @Post('login')
  @UsePipes(LoginValidator)
  @Public()
  async login(@Body() login: LoginDto): Promise<UserInfo> {
    const userInfo = await this.authService.login(login);

    if (userInfo !== null) return userInfo;

    throw new ApiException(
      HttpStatus.BAD_REQUEST,
      'Email or password are incorrect, please try again.',
    );
  }

  @Patch('verify')
  async verify(
    @CurrentUser() currentUser: UserInfo,
    @Body() verify: VerifyDto,
  ): Promise<UserInfo> {
    const user = await this.authService.verifyUser(currentUser.sub, verify);

    if (user) return user;

    throw new ApiException(HttpStatus.BAD_REQUEST, 'User can not be verified.');
  }

  @Patch('profile')
  async updateProfile(
    @CurrentUser() currentUser: UserInfo,
    @Body() profileData,
  ): Promise<UserInfo> {
    const user = await this.authService.updateProfile(
      currentUser.sub,
      profileData,
    );

    if (user) return user;

    throw new ApiException(
      HttpStatus.BAD_REQUEST,
      'User profile can not be updated.',
    );
  }
}
