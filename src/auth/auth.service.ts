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

    const userData: Prisma.UserCreateInput = {
      email,
      password: passwordHash,
      verificationCode: Math.floor(100000 + Math.random() * 900000),
    };

    const { user } = await this.userService.createConsumer(userData);

    await this.mailService.sendUserVerificationCode(
      user.email,
      user.verificationCode,
    );

    return await this.getUserInfo(user, false);
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

    return await this.getUserInfo(user);
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
    return await this.getUserInfo(updatedUser);
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
    return await this.getUserInfo(updatedUser);
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
    return await this.getUserInfo(updatedUser);
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
    return await this.getUserInfo(updatedUser);
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
      return await this.getUserInfo(foundUser);
    }

    const { user } = await this.userService.createConsumer(socialProfileDTO);

    return await this.getUserInfo(user, false);
  }

  async getUserInfo(
    user: User,
    shouldBuildAvatarUrl = true,
  ): Promise<IUserInfo> {
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
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      sub: id,
      email,
      userName: userName || (await this.createUserName(user)),
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

  private async createUserName(user: User): Promise<string> {
    const { email } = user;
    let userName = email.split('@')[0];

    const foundUsers = await this.userService.findUsersContainingUserName(
      userName,
    );

    const isAlreadyUsed =
      foundUsers.length &&
      foundUsers.some((user) => user.userName === userName);

    if (isAlreadyUsed) {
      userName = this.generateUserName(foundUsers, user);
    }

    return userName;
  }

  private generateUserName(users: User[], user: User): string {
    const { email, name, lastName } = user;
    let newUserName = `${name
      .split(' ')
      .join('')
      .toLocaleLowerCase()}${lastName.split(' ').join('').toLocaleLowerCase()}`;

    if (users.some((user) => user.userName === newUserName)) {
      let i = 1;
      newUserName = `${email}${i}`;
      while (users.some((user) => user.userName === newUserName)) {
        i++;
        newUserName = `${email}${i}`;
      }
    }

    return newUserName;
  }
}
