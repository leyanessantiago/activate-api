import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { imageFilter, renameImageFile } from '../helpers/file-upload';
import { Public } from '../core/jwt/public.decorator';
import { CurrentUser } from '../core/jwt/current-user.decorator';
import { ApiException } from '../core/exceptions/api-exception';
import { SignUpDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyDto } from './dto/verify.dto';
import { AuthService } from './auth.service';
import { SignUpValidationPipe } from './validators/sign-up-validator';
import { LoginValidator } from './validators/login-validator';
import { ProfileDto } from './dto/profile.dto';
import { IUserInfo } from './models/iuser-info';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @UsePipes(SignUpValidationPipe)
  @Public()
  async signUp(@Body() signUp: SignUpDto): Promise<IUserInfo> {
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
  async login(@Body() login: LoginDto): Promise<IUserInfo> {
    const userInfo = await this.authService.login(login);

    if (userInfo !== null) return userInfo;

    throw new ApiException(
      HttpStatus.BAD_REQUEST,
      'Email or password are incorrect, please try again.',
    );
  }

  @Patch('verify')
  async verify(
    @CurrentUser() currentUser: IUserInfo,
    @Body() verify: VerifyDto,
  ): Promise<IUserInfo> {
    const user = await this.authService.verifyUser(currentUser.sub, verify);

    if (user) return user;

    throw new ApiException(HttpStatus.BAD_REQUEST, 'User can not be verified.');
  }

  @Patch('profile')
  async updateProfile(
    @CurrentUser() currentUser: IUserInfo,
    @Body() profileData: ProfileDto,
  ): Promise<IUserInfo> {
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

  @Patch('avatar')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './images/avatars',
        filename: renameImageFile,
      }),
      fileFilter: imageFilter,
    }),
  )
  async updateAvatar(
    @CurrentUser() currentUser: IUserInfo,
    @UploadedFile() file,
  ): Promise<IUserInfo> {
    const user = await this.authService.updateAvatar(
      currentUser.sub,
      file.filename,
    );

    if (user) return user;

    throw new ApiException(
      HttpStatus.BAD_REQUEST,
      'User profile can not be updated.',
    );
  }

  @Public()
  @Get('avatar/:avatarImg')
  getAvatar(@Param('avatarImg') avatarImg, @Res() res) {
    return res.sendFile(avatarImg, { root: './images/avatars' });
  }
}
