import { Controller, Post, Body, UsePipes, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { response } from 'express';
import { SignUpValidationPipe } from './validators/sign-up-validator';
import { UserInfo } from './models/user-info';
import { SimpleResponse } from '../core/responses/simple-response';
import { ApiException } from '../core/exceptions/api-exception';
import { LoginDto } from './dto/login.dto';
import { LoginValidator } from './validators/login-validator';
import { Public } from '../core/jwt/public.decorator';
import { VerifyDto } from './dto/verify.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @UsePipes(SignUpValidationPipe)
  @Public()
  async signUp(@Body() signUp: SignUpDto): Promise<SimpleResponse<UserInfo>> {
    const user = await this.authService.signUp(signUp);

    if (user !== null) {
      response.status(HttpStatus.OK);

      return new SimpleResponse<UserInfo>({
        data: this.authService.getUserInfo(user),
      });
    }

    throw new ApiException(
      HttpStatus.BAD_REQUEST,
      'Error creating the account, please try later.',
    );
  }

  @Post('login')
  @UsePipes(LoginValidator)
  @Public()
  async login(@Body() login: LoginDto): Promise<SimpleResponse<UserInfo>> {
    const userInfo = await this.authService.login(login);

    if (userInfo !== null)
      return new SimpleResponse<UserInfo>({ data: userInfo });

    throw new ApiException(
      HttpStatus.BAD_REQUEST,
      'Email or password incorrect, please try again.',
    );
  }

  @Post('verify')
  @Public()
  async verify(@Body() verify: VerifyDto): Promise<SimpleResponse<UserInfo>> {
    const user = await this.authService.verifyUser(verify);

    if (user !== null) return new SimpleResponse<UserInfo>({ data: user });

    throw new ApiException(HttpStatus.BAD_REQUEST, 'User can not be verified.');
  }
}
