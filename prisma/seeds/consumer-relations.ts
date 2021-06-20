import {
  PrismaClient,
  Consumer,
  Publisher,
  Relationship,
} from '@prisma/client';
import * as faker from 'faker';
import { RelationshipStatus } from '../../src/constants/user';

export default async function seedConsumerRelations(prisma: PrismaClient) {
  console.log('Seeding consumer relationships');

  const publishers: Publisher[] = await prisma.publisher.findMany({
    include: { user: true },
  });
  const consumersPool: Consumer[] = await prisma.consumer.findMany({
    include: { user: true },
  });
  let consumer = consumersPool.shift();

  while (consumersPool.length > 0) {
    const following = faker.random
      .arrayElements(publishers)
      .map((pub) => ({ userId: pub.userId }));

    await prisma.consumer.update({
      where: {
        userId: consumer.userId,
      },
      data: {
        following: {
          connect: following,
        },
      },
    });

    const startAtFront = faker.datatype.boolean();
    const friendsCount = faker.datatype.number({
      min: 0,
      max: consumersPool.length - 1,
    });

    let friendsSlice = [];
    let requestsSlice = [];

    if (friendsCount > 0) {
      friendsSlice = startAtFront
        ? consumersPool.slice(0, friendsCount)
        : consumersPool.slice(friendsCount);

      requestsSlice = startAtFront
        ? consumersPool.slice(friendsCount)
        : consumersPool.slice(0, friendsCount);

      const friendRelations: Relationship[] = friendsSlice.map((friend) => ({
        userAId: consumer.userId,
        userBId: friend.userId,
        updatedBy: consumer.userId,
        updateDate: new Date(),
        status: RelationshipStatus.ACCEPTED,
      }));

      const friendRequests: Relationship[] = requestsSlice.map((fr) => ({
        userAId: fr.userId,
        userBId: consumer.userId,
        updatedBy: fr.userId,
        updateDate: new Date(),
        status: RelationshipStatus.PENDING,
      }));

      await prisma.relationship.createMany({
        data: [...friendRequests, ...friendRelations],
      });
    }

    consumer = consumersPool.shift();
  }
}
