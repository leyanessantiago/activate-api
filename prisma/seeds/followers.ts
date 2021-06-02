import { PrismaClient, Follower, Publisher } from '@prisma/client';
import * as faker from 'faker';

export default async function seedFollowers(
  prisma: PrismaClient,
  users: Follower[],
  publishers: Publisher[],
) {
  console.log('Seeding followers relationships');

  const friendsPool = [...users];
  let follower = friendsPool.shift();

  while (friendsPool.length > 0) {
    const startAtFront = faker.datatype.boolean();
    const friendsCount = faker.datatype.number({
      min: 0,
      max: friendsPool.length - 1,
    });

    let friendsSlice = [];
    let requestsSlice = [];

    if (friendsCount > 0) {
      friendsSlice = startAtFront
        ? friendsPool.slice(0, friendsCount)
        : friendsPool.slice(friendsCount);

      requestsSlice = startAtFront
        ? friendsPool.slice(friendsCount)
        : friendsPool.slice(0, friendsCount);
    }

    const friends = friendsSlice.map((fr) => ({ userId: fr.userId }));

    const requests = requestsSlice.map((fr) => ({
      requestorId: follower.userId,
      requestedToId: fr.userId,
      dateSent: faker.date.past(0, new Date()),
    }));

    const following = faker.random
      .arrayElements(publishers)
      .map((pub) => ({ userId: pub.userId }));

    await prisma.follower.update({
      where: {
        userId: follower.userId,
      },
      data: {
        friends: {
          connect: friends,
        },
        following: {
          connect: following,
        },
      },
    });

    await prisma.friendRequest.createMany({
      data: requests,
      skipDuplicates: true,
    });

    follower = friendsPool.shift();
  }
}
