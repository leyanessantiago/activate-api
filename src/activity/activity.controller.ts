import { Controller, Get } from '@nestjs/common';
import { IUserInfo } from '../auth/models/iuser-info';
import { CurrentUser } from '../core/jwt/current-user.decorator';
import { ActivityService } from './activity.service';

@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  async listMyActivities(@CurrentUser() user: IUserInfo) {
    return this.activityService.listMyActivities(user.sub);
  }
}
