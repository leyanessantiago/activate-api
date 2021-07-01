import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivityService {
  constructor(private prismaService: PrismaService) {}

  async listMyActivities(currentUser: string) {
    return await this.prismaService.activity.findMany({
      where: {
        seen: false,
        receiverId: currentUser,
      },
      select: {
        id: true,
        sentOn: true,
        seen: true,
        type: true,
        creator: {
          select: {
            id: true,
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
  }
}
