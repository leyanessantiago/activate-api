import { Injectable } from '@nestjs/common';
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

@Injectable()
export class AuthService {
  private salt = 10;

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signUp(signUp: SignUpDto): Promise<IUserInfo | null> {
    const passwordHash = await bcrypt.hash(signUp.password, this.salt);
    const userInput: Prisma.UserCreateInput = {
      email: signUp.email,
      password: passwordHash,
      verificationCode: Math.floor(100000 + Math.random() * 900000),
    };
    const user = await this.userService.create(userInput);
    return this.getUserInfo(user);
  }

  async login(login: LoginDto): Promise<IUserInfo | null> {
    const user = await this.userService.findByEmail(login.email);

    if (!user) return null;

    const isMatch = await bcrypt.compare(login.password, user.password);
    if (isMatch) return this.getUserInfo(user);

    return null;
  }

  async verifyUser(sub: string, verifyDto: VerifyDto): Promise<IUserInfo> {
    const user = await this.userService.findById(sub);

    if (user == null) throw new ApiException(404, 'User not found');

    if (user.verificationCode !== verifyDto.code) {
      throw new ApiException(400, 'The code provided is incorrect');
    }

    const userVerified: Prisma.UserUpdateInput = {
      verificationLevel: 1,
    };
    const userUpdated = await this.userService.update(sub, userVerified);

    return this.getUserInfo(userUpdated);
  }

  async updateProfile(sub: string, profile: ProfileDto): Promise<IUserInfo> {
    const user = await this.userService.findById(sub);

    if (user == null) throw new ApiException(404, 'User not found');

    if (profile.userName) {
      const userByUserName = await this.userService.findByUserName(
        profile.userName,
      );

      if (!!userByUserName && user.id !== userByUserName.id) {
        throw new ValidationException({
          userName: 'The username is already taken.',
        });
      }
    }

    const userProfile: Prisma.UserUpdateInput = profile;
    const userUpdated = await this.userService.update(sub, userProfile);

    return this.getUserInfo(userUpdated);
  }

  async updateAvatar(sub: string, fileName: string): Promise<IUserInfo> {
    const user = await this.userService.findById(sub);

    if (user == null) throw new ApiException(404, 'User not found');

    const domain =
      process.env.NODE_ENV === 'production'
        ? 'https://prod-domain:5000/v1/api'
        : 'http://localhost:5000/v1/api';

    const userProfile: Prisma.UserUpdateInput = {
      avatar: `${domain}/auth/avatar/${fileName}`,
    };
    const userUpdated = await this.userService.update(sub, userProfile);

    return this.getUserInfo(userUpdated);
  }

  getUserInfo(user: User): IUserInfo {
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
    const token = this.jwtService.sign(payload);

    return {
      sub: id,
      email,
      userName,
      name,
      lastName,
      avatar,
      theme,
      useDarkStyle,
      verificationLevel,
      accessToken: token,
    };
  }
}
