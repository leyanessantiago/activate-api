import { Controller, Get, Param, UseGuards, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { Follower, Publisher } from '.prisma/client';
import { UserInfo } from 'src/auth/models/user-info';
import { SimpleResponse } from 'src/core/responses/simple-response';
import { response } from 'express';
import { CurrentUser } from 'src/core/jwt/current-user.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('friends')
  async getFriends(
    @CurrentUser() user: UserInfo,
  ): Promise<SimpleResponse<Follower[]>> {
    const friends = await this.userService.findFriends(user.sub);
    response.status(HttpStatus.OK);
    return new SimpleResponse<Follower[]>({ data: friends });
  }

  @Get('friends/:id')
  async getFriendsById(
    @Param('id') id: string,
  ): Promise<SimpleResponse<Follower[]>> {
    const friends = await this.userService.findFriends(id);
    response.status(HttpStatus.OK);
    return new SimpleResponse<Follower[]>({ data: friends });
  }

  @Get('publishers')
  async getPublishers(
    @CurrentUser() user: UserInfo,
  ): Promise<SimpleResponse<Publisher[]>> {
    const publishers = await this.userService.findPublishers(user.sub);
    response.status(HttpStatus.OK);
    return new SimpleResponse<Publisher[]>({ data: publishers });
  }

  @Get('publishers')
  async getPublishersById(
    @Param('id') id: string,
  ): Promise<SimpleResponse<Publisher[]>> {
    const publishers = await this.userService.findPublishers(id);
    response.status(HttpStatus.OK);
    return new SimpleResponse<Publisher[]>({ data: publishers });
  }
}
