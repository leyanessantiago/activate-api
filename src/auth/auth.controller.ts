import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { imageFilter, renameImageFile } from '../helpers/file-upload';
import { Public } from '../core/jwt/public.decorator';
import { CurrentUser } from '../core/jwt/current-user.decorator';
import { ApiException } from '../core/exceptions/api-exception';
import { SignUpDTO } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyDto } from './dto/verify.dto';
import { AuthService } from './auth.service';
import { ProfileDto } from './dto/profile.dto';
import { IUserInfo } from './models/iuser-info';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @Public()
  async signUp(@Body() signUp: SignUpDTO): Promise<IUserInfo> {
    const user = await this.authService.signUp(signUp);

    if (user) {
      return user;
    }

    throw new ApiException(
      HttpStatus.BAD_REQUEST,
      'Error creating the account, please try later.',
    );
  }

  @Post('login')
  @Public()
  async login(@Body() login: LoginDto): Promise<IUserInfo> {
    return this.authService.login(login);
  }

  @Get('social/:provider')
  @Public()
  @UseGuards(AuthGuard('google'))
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  googleAuth() {}

  @Get('social/:provider/fallback')
  @Public()
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req): Promise<any> {
    return await this.authService.socialLogin(req.user);
  }

  @Patch('verify')
  async verify(
    @CurrentUser() currentUser: IUserInfo,
    @Body() verify: VerifyDto,
  ): Promise<IUserInfo> {
    return this.authService.verifyUser(currentUser.sub, verify);
  }

  @Patch('profile')
  async updateProfile(
    @CurrentUser() currentUser: IUserInfo,
    @Body() profileData: ProfileDto,
  ): Promise<IUserInfo> {
    return this.authService.updateProfile(currentUser.sub, profileData);
  }

  @Patch('password')
  async updatePassword(
    @CurrentUser() currentUser: IUserInfo,
    @Body() credentials: ChangePasswordDto,
  ): Promise<IUserInfo> {
    return this.authService.changePassword(currentUser.sub, credentials);
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
    return this.authService.updateAvatar(currentUser.sub, file.filename);
  }

  @Public()
  @Get('avatar/:avatarImg')
  getAvatar(@Param('avatarImg') avatarImg, @Res() res) {
    return res.sendFile(avatarImg, { root: './images/avatars' });
  }
}
