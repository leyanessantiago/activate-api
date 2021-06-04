import { PrismaClient } from '.prisma/client';
import * as faker from 'faker';

export default async function seedFollowerActivities(prisma: PrismaClient) {
  console.log('Sedding follower related activities');

  const loginUser = await prisma.user.findUnique({
    where: {
      email: 'ale@gmail.com',
    },
    select: {
      id: true,
      follower: {
        select: {
          friends: {
            select: {
              userId: true,
              eventsFollowed: true,
            },
          },
          receivedRequests: {
            select: {
              creatorId: true,
            },
          },
        },
      },
    },
  });

  const inviters = faker.random.arrayElements(loginUser.follower.friends);
  const invitationsActivities = inviters.map((friend) => ({
    type: 0,
    creatorId: friend.userId,
    receiverId: loginUser.id,
    eventId: faker.random.arrayElement(friend.eventsFollowed).id,
    dateSent: faker.date.past(0, new Date()),
    seen: faker.datatype.boolean(),
  }));

  prisma.activity.createMany({
    data: [...invitationsActivities],
    skipDuplicates: true,
  });
}
