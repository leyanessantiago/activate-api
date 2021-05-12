import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { Follower, Publisher } from '.prisma/client';
import { UserInfo } from '../auth/models/user-info';
import { SimpleResponse } from '../core/responses/simple-response';
import { CurrentUser } from '../core/jwt/current-user.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('friends')
  async getFriends(
    @CurrentUser() user: UserInfo,
  ): Promise<SimpleResponse<Follower[]>> {
    const friends = await this.userService.findFriends(user.sub);
    return new SimpleResponse<Follower[]>({ data: friends });
  }

  @Get('friends/:id')
  async getFriendsById(
    @Param('id') id: string,
  ): Promise<SimpleResponse<Follower[]>> {
    const friends = await this.userService.findFriends(id);
    return new SimpleResponse<Follower[]>({ data: friends });
  }

  @Get('publishers')
  async getPublishers(
    @CurrentUser() user: UserInfo,
  ): Promise<SimpleResponse<Publisher[]>> {
    const publishers = await this.userService.findPublishers(user.sub);
    return new SimpleResponse<Publisher[]>({ data: publishers });
  }

  @Get('publishers/:id')
  async getPublishersById(
    @Param('id') id: string,
  ): Promise<SimpleResponse<Publisher[]>> {
    const publishers = await this.userService.findPublishers(id);
    return new SimpleResponse<Publisher[]>({ data: publishers });
  }
}
