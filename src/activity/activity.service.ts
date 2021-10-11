import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryParams } from '../constants/queries';
import { PagedResponse } from '../core/responses/paged-response';
import { ActivityDTO } from './models/activity.dto';
import buildAvatarUrl from '../helpers/build-avatar-url';

@Injectable()
export class ActivityService {
  constructor(private prismaService: PrismaService) {}

  async listMyActivities(
    currentUser: string,
    queryParams: QueryParams,
  ): Promise<PagedResponse<ActivityDTO>> {
    const { page, limit } = queryParams;
    const filter = {
      seen: false,
      receiverId: currentUser,
    };

    const activities = await this.prismaService.activity.findMany({
      where: filter,
      orderBy: {
        sentOn: 'desc',
      },
      skip: page ? (limit || 0) * (page - 1) : 0,
      take: limit || undefined,
      select: {
        id: true,
        sentOn: true,
        seen: true,
        type: true,
        creator: {
          select: {
            id: true,
            userName: true,
            avatar: true,
            name: true,
          },
        },
        event: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (activities.length === 0) {
      return { results: [], page, count: 0 };
    }

    const count = await this.prismaService.activity.count({
      where: filter,
    });

    return {
      results: activities.map((act) => ({
        ...act,
        creator: {
          ...act.creator,
          avatar: buildAvatarUrl(act.creator.avatar),
        },
      })),
      page,
      count,
    };
  }
}
