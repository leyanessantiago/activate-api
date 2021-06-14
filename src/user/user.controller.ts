import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '.prisma/client';
import { IUserInfo } from '../auth/models/iuser-info';
import { CurrentUser } from '../core/jwt/current-user.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('friends')
  async getFriends(@CurrentUser() user: IUserInfo): Promise<User[]> {
    return this.userService.findFriends(user.sub);
  }

  @Get('friends/:id')
  async getFriendsById(@Param('id') id: string): Promise<User[]> {
    return this.userService.findFriends(id);
  }

  @Get('publishers')
  async getPublishers(@CurrentUser() user: IUserInfo): Promise<User[]> {
    return this.userService.findPublishers(user.sub);
  }

  @Get('publishers/:id')
  async getPublishersById(@Param('id') id: string): Promise<User[]> {
    return this.userService.findPublishers(id);
  }
}
