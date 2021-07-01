import { Controller, Get, Query } from '@nestjs/common';
import { IUserInfo } from '../auth/models/iuser-info';
import { CurrentUser } from '../core/jwt/current-user.decorator';
import { PagedResponse } from '../core/responses/paged-response';
import { ActivityService } from './activity.service';
import { ActivityDTO } from './models/activity.dto';

@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  async listMyActivities(
    @CurrentUser() user: IUserInfo,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<PagedResponse<ActivityDTO>> {
    return this.activityService.listMyActivities(user.sub, { page, limit });
  }
}
