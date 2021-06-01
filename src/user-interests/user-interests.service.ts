import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SetUserInterestsDto } from './dto/set-user-interests.dto';

@Injectable()
export class UserInterestsService {
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

  async setUserInterests(setUserInterestsInput: SetUserInterestsDto) {
    const { userId, categoriesId } = setUserInterestsInput;

    const currentUserInterests = await this.prismaService.userInterests.findMany(
      {
        where: {
          userId,
        },
      },
    );

    for (const index in categoriesId) {
      const currentUserInterestsIndex = currentUserInterests.findIndex(
        (currentUserInterest) =>
          currentUserInterest.categoryId === categoriesId[index],
      );
      if (currentUserInterestsIndex) {
        categoriesId.splice(parseInt(index), 0);
        currentUserInterests.splice(currentUserInterestsIndex, 0);
      }
    }

    await this.removeDeselectedUserInterest(currentUserInterests);

    const newUserInterests: Prisma.UserInterestsUncheckedCreateInput[] = categoriesId.map(
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
}
