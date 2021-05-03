import { Injectable, HttpStatus } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { SignUpDto } from './dto/sign-up.dto';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { UserInfo } from './models/user-info';
import { JwtService } from '@nestjs/jwt';
import { ApiException } from '../core/exceptions/api-exception';
import { VerifyDto } from './dto/verify.dto';

@Injectable()
export class AuthService {
  private salt = 10;

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signUp(signUp: SignUpDto): Promise<User | null> {
    const passowrdHash = await bcrypt.hash(signUp.password, this.salt);
    const userInput: Prisma.UserCreateInput = {
      email: signUp.email,
      password: passowrdHash,
      verficationCode: Math.floor(100000 + Math.random() * 900000).toString(),
    };
    const user = await this.userService.create(userInput);

    return user;
  }

  async login(login: LoginDto): Promise<UserInfo | null> {
    const user = await this.userService.findByEmail(login.email);

    const userIsNotVerified = user !== null && !user.isVerified;
    if (userIsNotVerified)
      throw new ApiException(
        HttpStatus.UNAUTHORIZED,
        'The user is not verifed.',
      );

    if (user === null) return null;

    const isMatch = await bcrypt.compare(login.password, user.password);
    if (isMatch) return this.getUserInfo(user);

    return null;
  }

  async verifyUser(verify: VerifyDto): Promise<UserInfo> {
    const user = await this.userService.findById(verify.userId);

    if (user == null) throw new ApiException(404, 'User not found');

    if (user.verficationCode !== verify.code)
      throw new ApiException(400, 'The code provided is incorrect');

    const userVerified: Prisma.UserUpdateInput = {
      isVerified: true,
    };

    const userUpdated = await this.userService.update(
      verify.userId,
      userVerified,
    );

    return this.getUserInfo(userUpdated);
  }

  getUserInfo(user: User): UserInfo {
    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);

    return new UserInfo({
      sub: user.id,
      email: user.email,
      userName: user.userName,
      fullName: `${user.name} ${user.lastName}`,
      avatarUrl: user.avatarUrl,
      isVerified: user.isVerified,
      accessToken: token,
    });
  }
}
