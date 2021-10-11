import { Controller, Get, Param, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { IUserInfo } from '../auth/models/iuser-info';
import { CurrentUser } from '../core/jwt/current-user.decorator';
import { PagedResponse } from '../core/responses/paged-response';
import { PublisherDTO } from './models/publisher';
import { ConsumerDTO } from './models/consumer';
import { UserDTO } from './models/user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('stats')
  async getMyStats(@CurrentUser() user: IUserInfo) {
    return this.userService.findMyStats(user.sub);
  }

  @Get('friends')
  async getMyFriends(
    @CurrentUser() user: IUserInfo,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<PagedResponse<ConsumerDTO>> {
    return this.userService.findMyFriends(user.sub, { page, limit });
  }

  @Get('pending')
  async getMyPendingRequests(
    @CurrentUser() user: IUserInfo,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<PagedResponse<ConsumerDTO>> {
    return this.userService.findMyPendingRequests(user.sub, { page, limit });
  }

  @Get('publishers')
  async getMyPublishers(
    @CurrentUser() user: IUserInfo,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<PagedResponse<PublisherDTO>> {
    return this.userService.findMyPublishers(user.sub, { page, limit });
  }

  @Get('followers')
  async getMyFollowers(
    @CurrentUser() user: IUserInfo,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<PagedResponse<UserDTO>> {
    return this.userService.findMyFollowers(user.sub, { page, limit });
  }

  @Get('search/publishers/:term')
  async searchPublishers(
    @CurrentUser() user: IUserInfo,
    @Param('term') term: string,
  ): Promise<PublisherDTO[]> {
    return this.userService.searchPublishers(term, user.sub);
  }

  @Get('search/consumers/:term')
  async searchConsumers(
    @CurrentUser() user: IUserInfo,
    @Param('term') term: string,
  ): Promise<ConsumerDTO[]> {
    return this.userService.searchConsumers(term, user.sub);
  }

  @Get(':id/friends')
  async getFriendsOf(
    @CurrentUser() user: IUserInfo,
    @Param('id') userId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<PagedResponse<ConsumerDTO>> {
    return this.userService.findFriendsOf(userId, user.sub, { page, limit });
  }

  @Get(':id/publishers')
  async getPublishersFollowedBy(
    @CurrentUser() user: IUserInfo,
    @Param('id') userId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<PagedResponse<PublisherDTO>> {
    return this.userService.findPublishersFollowedBy(userId, user.sub, {
      page,
      limit,
    });
  }

  @Get(':id/followers')
  async getFollowersOf(
    @CurrentUser() user: IUserInfo,
    @Param('id') publisher: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<PagedResponse<ConsumerDTO>> {
    return this.userService.findFollowersOf(user.sub, publisher, {
      page,
      limit,
    });
  }

  @Get('publisher/:id')
  async getPublisherById(
    @CurrentUser() user: IUserInfo,
    @Param('id') userId: string,
  ): Promise<PublisherDTO> {
    return this.userService.findPublisherById(userId, user.sub);
  }

  @Get('consumer/:id')
  async getConsumerById(
    @CurrentUser() user: IUserInfo,
    @Param('id') userId: string,
  ): Promise<ConsumerDTO> {
    return this.userService.findConsumerById(userId, user.sub);
  }

  @Get('publisher/:id/follow')
  async follow(@CurrentUser() user: IUserInfo, @Param('id') publisher: string) {
    return this.userService.follow(user.sub, publisher);
  }

  @Get('publisher/:id/mute')
  async mutePublisher(
    @CurrentUser() user: IUserInfo,
    @Param('id') publisher: string,
  ) {
    return this.userService.mutePublisher(user.sub, publisher);
  }

  @Get('publisher/:id/unmute')
  async unmutePublisher(
    @CurrentUser() user: IUserInfo,
    @Param('id') publisher: string,
  ) {
    return this.userService.unMutePublisher(user.sub, publisher);
  }

  @Get('publisher/:id/block')
  async blockPublisher(
    @CurrentUser() user: IUserInfo,
    @Param('id') publisher: string,
  ) {
    return this.userService.blockPublisher(user.sub, publisher);
  }

  @Get('publisher/:id/unblock')
  async unblockPublisher(
    @CurrentUser() user: IUserInfo,
    @Param('id') publisher: string,
  ) {
    return this.userService.unBlockPublisher(user.sub, publisher);
  }

  @Get('publisher/:id/remove')
  async removePublisher(
    @CurrentUser() user: IUserInfo,
    @Param('id') publisher: string,
  ) {
    return this.userService.removePublisher(user.sub, publisher);
  }

  @Get('friend/:id/send')
  async sendFriendRequest(
    @CurrentUser() user: IUserInfo,
    @Param('id') consumer: string,
  ) {
    return this.userService.sendFriendRequest(user.sub, consumer);
  }

  @Get('friend/:id/accept')
  async acceptFriendRequest(
    @CurrentUser() user: IUserInfo,
    @Param('id') consumer: string,
  ) {
    return this.userService.acceptFriendRequest(user.sub, consumer);
  }

  @Get('friend/:id/decline')
  async declineFriendRequest(
    @CurrentUser() user: IUserInfo,
    @Param('id') consumer: string,
  ) {
    return this.userService.declineFriendRequest(user.sub, consumer);
  }

  @Get('friend/:id/mute')
  async muteFriend(
    @CurrentUser() user: IUserInfo,
    @Param('id') consumer: string,
  ) {
    return this.userService.muteFriend(user.sub, consumer);
  }

  @Get('friend/:id/unmute')
  async unMuteFriend(
    @CurrentUser() user: IUserInfo,
    @Param('id') consumer: string,
  ) {
    return this.userService.unMuteFriend(user.sub, consumer);
  }

  @Get('friend/:id/block')
  async blockFriend(
    @CurrentUser() user: IUserInfo,
    @Param('id') consumer: string,
  ) {
    return this.userService.blockFriend(user.sub, consumer);
  }

  @Get('friend/:id/unblock')
  async unBlockFriend(
    @CurrentUser() user: IUserInfo,
    @Param('id') consumer: string,
  ) {
    return this.userService.unBlockFriend(user.sub, consumer);
  }

  @Get('friend/:id/remove')
  async removeFriend(
    @CurrentUser() user: IUserInfo,
    @Param('id') consumer: string,
  ) {
    return this.userService.removeFriend(user.sub, consumer);
  }
}
