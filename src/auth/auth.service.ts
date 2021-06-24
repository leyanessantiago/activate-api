import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ValidationException } from '../core/exceptions/validation-exception';
import { UserService } from '../user/user.service';
import { ApiException } from '../core/exceptions/api-exception';
import { SignUpDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyDto } from './dto/verify.dto';
import { ProfileDto } from './dto/profile.dto';
import { IUserInfo } from './models/iuser-info';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  private salt = 10;

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signUp(signUp: SignUpDto): Promise<IUserInfo | null> {
    const passwordHash = await bcrypt.hash(signUp.password, this.salt);

    const userData: Prisma.UserCreateInput = {
      email: signUp.email,
      password: passwordHash,
      verificationCode: Math.floor(100000 + Math.random() * 900000),
    };

    const { user } = await this.userService.createConsumer(userData);
    return this.getUserInfo(user);
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
      verificationLevel: 1,
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

    const { DOMAIN_NAME, API_PREFIX } = process.env;
    const domain = `${DOMAIN_NAME}/${API_PREFIX}`;

    const userProfile: Prisma.UserUpdateInput = {
      avatar: `${domain}/auth/avatar/${fileName}`,
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

  getUserInfo(user: User): IUserInfo {
    const {
      id,
      email,
      userName,
      name,
      avatar,
      theme,
      useDarkStyle,
      verificationLevel,
    } = user;

    const payload = { email, sub: user.id };
    const token = this.jwtService.sign(payload);

    return {
      sub: id,
      email,
      userName,
      name,
      avatar,
      theme,
      useDarkStyle,
      verificationLevel,
      accessToken: token,
    };
  }
}
