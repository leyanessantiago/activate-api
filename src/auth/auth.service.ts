import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { SignUpDto } from './dto/sign-up.dto';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { UserInfo } from './models/user-info';
import { JwtService } from '@nestjs/jwt';

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
      name: signUp.name,
      lastName: signUp.lastName,
      password: passowrdHash,
      userName: signUp.userName,
    };

    return await this.userService.create(userInput);
  }

  async login(login: LoginDto): Promise<UserInfo | null> {
    const user = await this.userService.findByEmail(login.email);

    if (user === null) return null;

    const isMatch = await bcrypt.compare(login.password, user.password);
    if (isMatch) return this.getUserInfo(user);

    return null;
  }

  getUserInfo(user: User): UserInfo {
    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);

    return new UserInfo({
      id: user.id,
      email: user.email,
      accessToken: token,
    });
  }
}
