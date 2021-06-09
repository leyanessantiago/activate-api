import { Controller, Post, Body, Get } from '@nestjs/common';
import { InterestsService } from './interests.service';
import { SetInterestsDto } from './dto/set-interests.dto';
import { CurrentUser } from '../core/jwt/current-user.decorator';
import { IUserInfo } from '../auth/models/iuser-info';

@Controller('interests')
export class InterestsController {
  constructor(private readonly interestService: InterestsService) {}

  @Post()
  async setInterests(
    @CurrentUser() currentUser: IUserInfo,
    @Body() setInterestsDto: SetInterestsDto,
  ) {
    return this.interestService.setUserInterests(
      currentUser.sub,
      setInterestsDto.categoryIds,
    );
  }

  @Get()
  async getUserInterests(@CurrentUser() currentUser: IUserInfo) {
    return this.interestService.getUserInterests(currentUser.sub);
  }
}
