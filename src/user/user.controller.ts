import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '.prisma/client';
import { IUserInfo } from '../auth/models/iuser-info';
import { CurrentUser } from '../core/jwt/current-user.decorator';
import { PublisherDTO } from './models/publisher.dto';
import { ConsumerDTO } from './models/consumer.dto';
import { UserDTO } from './models/user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('friends')
  async getMyFriends(@CurrentUser() user: IUserInfo): Promise<UserDTO[]> {
    return this.userService.findFriendsOf(user.sub);
  }

  @Get(':id/friends')
  async getFriendsOf(@Param('id') userId: string): Promise<UserDTO[]> {
    return this.userService.findFriendsOf(userId);
  }

  @Get('publishers')
  async getPublishersIFollow(@CurrentUser() user: IUserInfo): Promise<User[]> {
    return this.userService.findPublishersFollowedBy(user.sub);
  }

  @Get(':id/publishers')
  async getPublishersFollowedBy(@Param('id') userId: string): Promise<User[]> {
    return this.userService.findPublishersFollowedBy(userId);
  }

  @Get('followers')
  async getMyFollowers(@CurrentUser() user: IUserInfo): Promise<UserDTO[]> {
    return this.userService.findMyFollowers(user.sub);
  }

  @Get(':id/followers')
  async getFolowersOf(
    @CurrentUser() user: IUserInfo,
    @Param('id') userId: string,
  ): Promise<ConsumerDTO[]> {
    return this.userService.findFollowersOf(userId, user.sub);
  }

  @Get('publisher/:id')
  async getPublisherById(
    @CurrentUser() user: IUserInfo,
    @Param('id') userId: string,
  ): Promise<PublisherDTO> {
    return this.userService.findPublisherById(userId, user.sub);
  }

  @Get('consumer/:id')
  async getFollowerById(
    @CurrentUser() user: IUserInfo,
    @Param('id') userId: string,
  ): Promise<ConsumerDTO> {
    return this.userService.findConsumerById(userId, user.sub);
  }

  @Get('follow/:id')
  async follow(
    @CurrentUser() user: IUserInfo,
    @Param('id') publisherId: string,
  ) {
    return this.userService.follow(user.sub, publisherId);
  }
}
