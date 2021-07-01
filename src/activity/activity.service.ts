import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryParams } from '../constants/queries';
import { PagedResponse } from '../core/responses/paged-response';
import { ActivityDTO } from './models/activity.dto';

@Injectable()
export class ActivityService {
  constructor(private prismaService: PrismaService) {}

  async listMyActivities(
    currentUser: string,
    queryParams: QueryParams,
  ): Promise<PagedResponse<ActivityDTO>> {
    const { page, limit } = queryParams;

    const activities = await this.prismaService.activity.findMany({
      where: {
        seen: false,
        receiverId: currentUser,
      },
      orderBy: {
        sentOn: 'desc',
      },
      skip: page ? (limit || 0) * (page - 1) : 0,
      take: limit,
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
      where: {
        seen: false,
        receiverId: currentUser,
      },
    });

    return { results: activities, page, count };
  }
}
