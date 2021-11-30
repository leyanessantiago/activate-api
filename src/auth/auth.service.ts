import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ValidationException } from '../core/exceptions/validation-exception';
import { UserService } from '../user/user.service';
import { ApiException } from '../core/exceptions/api-exception';
import { SignUpDTO } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyDto } from './dto/verify.dto';
import { ProfileDto } from './dto/profile.dto';
import { IUserInfo } from './models/iuser-info';
import { ChangePasswordDto } from './dto/change-password.dto';
import { MailService } from '../mail/mail.service';
import buildAvatarUrl from '../helpers/build-avatar-url';
import { generateCode } from '../helpers/generators';
import { VerificationLevel } from '../constants/user';
import { SendResetPasswordEmailDto } from './dto/send-reset-password-email.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendSignupVerifyEmailDto } from './dto/resend-signup-verify-email.dto';

@Injectable()
export class AuthService {
  private salt = 10;

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async signUp(signUpDTO: SignUpDTO): Promise<IUserInfo | null> {
    const { email, password } = signUpDTO;

    await this.checkIsUniqueEmail(email);

    const passwordHash = await bcrypt.hash(password, this.salt);

    const verificationCode = generateCode();

    const userData: Prisma.UserCreateInput = {
      email,
      password: passwordHash,
      verificationCode,
    };

    const { user } = await this.userService.createConsumer(userData);

    await this.mailService.sendSignupVerifyEmail(email, verificationCode);

    return this.getUserInfo(user);
  }

  async updateVerificationCodeByEmail(email: string): Promise<User> {
    const foundUser = await this.userService.findByEmail(email);

    if (!foundUser) {
      throw new ValidationException({
        email: 'This email does not belongs to any account we have registered',
      });
    }

    const newVerificationCode = generateCode();
    const updates: Prisma.UserUpdateInput = {
      verificationCode: newVerificationCode,
    };

    return this.userService.update(foundUser.id, updates);
  }

  async resendSignupVerifyEmail(
    sendSignupVerifyEmailDto: ResendSignupVerifyEmailDto,
  ): Promise<void> {
    const { email } = sendSignupVerifyEmailDto;
    const { verificationCode } = await this.updateVerificationCodeByEmail(
      email,
    );

    await this.mailService.sendSignupVerifyEmail(email, verificationCode);
  }

  async login(login: LoginDto): Promise<IUserInfo | null> {
    const user = await this.userService.findByEmail(login.email);

    if (!user) {
      throw new ValidationException({
        email: 'This email does not belongs to any account we have registered',
      });
    }

    const isMatch = await bcrypt.compare(login.password, user.password);

    if (!isMatch) {
      throw new ValidationException({
        password: 'This password does not belongs to this account',
      });
    }

    return this.getUserInfo(user);
  }

  async loginPublisher(login: LoginDto): Promise<IUserInfo | null> {
    const publisher = await this.userService.findPublisherByEmail(login.email);

    if (!publisher) {
      throw new ValidationException({
        email: 'This email does not belongs to any account we have registered',
      });
    }

    const isMatch = await bcrypt.compare(
      login.password,
      publisher.user.password,
    );

    if (!isMatch) {
      throw new ValidationException({
        password: 'This password does not belongs to this account',
      });
    }

    return this.getUserInfo(publisher.user as User);
  }

  async verifyUser(sub: string, verifyDto: VerifyDto): Promise<IUserInfo> {
    const user = await this.userService.findById(sub);

    if (!user) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'User not found');
    }

    if (user.verificationCode !== verifyDto.code) {
      throw new ValidationException({
        code: 'This is not the code we sent you',
      });
    }

    const updates: Prisma.UserUpdateInput = {
      verificationLevel: VerificationLevel.CODE_VERIFIED,
    };

    const updatedUser = await this.userService.update(sub, updates);
    return this.getUserInfo(updatedUser);
  }

  async updateProfile(sub: string, profile: ProfileDto): Promise<IUserInfo> {
    const user = await this.userService.findById(sub);

    if (!user) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'User not found');
    }

    if (profile.userName) {
      await this.verifyUserName(user.id, profile.userName);
    }

    const userProfile: Prisma.UserUpdateInput = profile;
    const updatedUser = await this.userService.update(sub, userProfile);
    return this.getUserInfo(updatedUser);
  }

  async changePassword(
    sub: string,
    credentials: ChangePasswordDto,
  ): Promise<IUserInfo> {
    const user = await this.userService.findById(sub);

    if (!user) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'User not found');
    }

    const { current, newPassword } = credentials;

    const passwordsMatch = await bcrypt.compare(current, user.password);

    if (!passwordsMatch) {
      throw new ValidationException({
        current: 'This password does not match the one we have in store',
      });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, this.salt);
    const updates: Prisma.UserUpdateInput = {
      password: newPasswordHash,
    };

    const updatedUser = await this.userService.update(sub, updates);
    return this.getUserInfo(updatedUser);
  }

  async updateAvatar(sub: string, fileName: string): Promise<IUserInfo> {
    const user = await this.userService.findById(sub);

    if (!user) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'User not found');
    }

    const userProfile: Prisma.UserUpdateInput = {
      avatar: fileName,
    };

    const updatedUser = await this.userService.update(sub, userProfile);
    return this.getUserInfo(updatedUser);
  }

  async verifyUserName(id: string, userName: string) {
    const userByUserName = await this.userService.findByUserName(userName);

    if (!!userByUserName && id !== userByUserName.id) {
      throw new ValidationException({
        userName: 'The username is already taken',
      });
    }
  }

  async socialLogin(socialProfileDTO: ProfileDto): Promise<IUserInfo> {
    const { email } = socialProfileDTO;

    const foundUser = await this.userService.findByEmail(email);

    if (foundUser) {
      const shouldBuildAvatarUrl =
        foundUser.verificationLevel >= VerificationLevel.USER_INFO_ADDED;
      return this.getUserInfo(foundUser, shouldBuildAvatarUrl);
    }

    const { user } = await this.userService.createConsumer(socialProfileDTO);

    return this.getUserInfo(user, false);
  }

  async sendResetPasswordEmail(
    sendResetPasswordEmailDto: SendResetPasswordEmailDto,
  ): Promise<void> {
    const { email } = sendResetPasswordEmailDto;
    const { verificationCode } = await this.updateVerificationCodeByEmail(
      email,
    );

    await this.mailService.sendPasswordResetEmail(email, verificationCode);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<IUserInfo> {
    const { email, verificationCode, newPassword } = resetPasswordDto;

    const foundUser = await this.userService.findByEmail(email);

    if (!foundUser) {
      throw new ValidationException({
        email: 'This email does not belongs to any account we have registered',
      });
    }

    if (foundUser.verificationCode !== verificationCode) {
      throw new ValidationException({
        code: 'This is not the code we sent you',
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, this.salt);

    const updates: Prisma.UserUpdateInput = {
      password: passwordHash,
    };

    const updatedUser = await this.userService.update(foundUser.id, updates);
    return this.getUserInfo(updatedUser);
  }

  getUserInfo(user: User, shouldBuildAvatarUrl = true): IUserInfo {
    const {
      id,
      email,
      userName,
      name,
      lastName,
      avatar,
      theme,
      useDarkStyle,
      verificationLevel,
    } = user;

    const payload = { email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    return {
      sub: id,
      email,
      userName,
      name,
      lastName,
      avatar: shouldBuildAvatarUrl ? buildAvatarUrl(avatar) : avatar,
      theme,
      useDarkStyle,
      verificationLevel,
      accessToken,
    };
  }

  private async checkIsUniqueEmail(email: string): Promise<void> {
    const foundUser = await this.userService.findByEmail(email);

    if (foundUser) {
      throw new ValidationException({
        email: 'This email is currently in use.',
      });
    }
  }
}
