import { Controller, Post, Body } from '@nestjs/common';
import { UserInterestsService } from './user-interests.service';
import { SetUserInterestsDto } from './dto/set-user-interests.dto';

@Controller('user_interests')
export class UserInterestsController {
  constructor(private readonly categoryService: UserInterestsService) {}

  @Post()
  setUserInterests(@Body() setUserInterestsInput: SetUserInterestsDto) {
    return this.categoryService.setUserInterests(setUserInterestsInput);
  }
}
