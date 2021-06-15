import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '.prisma/client';
import { IUserInfo } from '../auth/models/iuser-info';
import { CurrentUser } from '../core/jwt/current-user.decorator';
import { PublisherDTO } from './models/publisher.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('friends')
  async getMyFriends(@CurrentUser() user: IUserInfo): Promise<User[]> {
    return this.userService.findFriendsOf(user.sub);
  }

  @Get('friends/:id')
  async getFriendsOf(@Param('id') userId: string): Promise<User[]> {
    return this.userService.findFriendsOf(userId);
  }

  @Get('publishers')
  async getMyPublishers(@CurrentUser() user: IUserInfo): Promise<User[]> {
    return this.userService.findPublishersOf(user.sub);
  }

  @Get('publishers/:id')
  async getPublishersOf(@Param('id') userId: string): Promise<User[]> {
    return this.userService.findPublishersOf(userId);
  }

  @Get('followers')
  async getMyFollowers(@CurrentUser() user: IUserInfo): Promise<User[]> {
    return this.userService.findFollowersOf(user.sub);
  }

  @Get('followers/:id')
  async getFolowersOf(@Param('id') userId: string): Promise<User[]> {
    return this.userService.findFollowersOf(userId);
  }

  @Get('/publisher/:id')
  async getPublisherById(@Param('id') userId: string): Promise<PublisherDTO> {
    return this.userService.findPublisherById(userId);
  }
}
