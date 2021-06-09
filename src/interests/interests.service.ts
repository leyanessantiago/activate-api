import { Injectable } from '@nestjs/common';
import { Category, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InterestsService {
  constructor(private prismaService: PrismaService) {}

  private removeDeselectedUserInterest(userInterestsToDelete) {
    const deletes = userInterestsToDelete.map((currentUserInterest) => {
      return this.prismaService.userInterests.delete({
        where: {
          userId_categoryId: {
            userId: currentUserInterest.userId,
            categoryId: currentUserInterest.categoryId,
          },
        },
      });
    });

    return Promise.all(deletes);
  }

  async setUserInterests(userId: string, categoryIds: string[] = []) {
    const currentUserInterests = await this.prismaService.userInterests.findMany(
      {
        where: {
          userId,
        },
      },
    );

    for (const index in categoryIds) {
      const currentUserInterestsIndex = currentUserInterests.findIndex(
        (currentUserInterest) =>
          currentUserInterest.categoryId === categoryIds[index],
      );
      if (currentUserInterestsIndex) {
        categoryIds.splice(parseInt(index), 0);
        currentUserInterests.splice(currentUserInterestsIndex, 0);
      }
    }

    await this.removeDeselectedUserInterest(currentUserInterests);

    const newUserInterests: Prisma.UserInterestsUncheckedCreateInput[] = categoryIds.map(
      (categoryId) => ({
        userId,
        categoryId,
        relevance: 1,
      }),
    );

    return this.prismaService.userInterests.createMany({
      data: newUserInterests,
    });
  }

  async getUserInterests(userId: string): Promise<Category[]> {
    const interests = await this.prismaService.userInterests.findMany({
      where: {
        userId,
      },
      orderBy: {
        relevance: 'desc',
      },
      select: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
    });

    return interests.map((interest) => interest.category as Category);
  }
}
