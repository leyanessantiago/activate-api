import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { Follower, Publisher } from '.prisma/client';
import { UserInfo } from '../auth/models/user-info';
import { CurrentUser } from '../core/jwt/current-user.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('friends')
  async getFriends(@CurrentUser() user: UserInfo): Promise<Follower[]> {
    return this.userService.findFriends(user.sub);
  }

  @Get('friends/:id')
  async getFriendsById(@Param('id') id: string): Promise<Follower[]> {
    return this.userService.findFriends(id);
  }

  @Get('publishers')
  async getPublishers(@CurrentUser() user: UserInfo): Promise<Publisher[]> {
    return this.userService.findPublishers(user.sub);
  }

  @Get('publishers/:id')
  async getPublishersById(@Param('id') id: string): Promise<Publisher[]> {
    return this.userService.findPublishers(id);
  }
}
