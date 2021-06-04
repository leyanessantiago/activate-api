import { Controller, Post, Body } from '@nestjs/common';
import { InterestsService } from './interests.service';
import { SetInterestsDto } from './dto/set-interests.dto';
import { CurrentUser } from '../core/jwt/current-user.decorator';
import { IUserInfo } from '../auth/models/iuser-info';

@Controller('interests')
export class InterestsController {
  constructor(private readonly categoryService: InterestsService) {}

  @Post()
  setInterests(
    @CurrentUser() currentUser: IUserInfo,
    @Body() setInterestsDto: SetInterestsDto,
  ) {
    return this.categoryService.setUserInterests(
      currentUser.sub,
      setInterestsDto.categoryIds,
    );
  }
}
