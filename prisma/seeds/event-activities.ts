import { PrismaClient } from '.prisma/client';
import * as faker from 'faker';

export default async function seedEventActivities(prisma: PrismaClient) {
  console.log('Seeding event related activities');

  const events = await prisma.event.findMany({
    select: {
      id: true,
      authorId: true,
      followers: {
        select: {
          consumerId: true,
        },
      },
      comments: {
        select: {
          id: true,
          response: true,
          authorId: true,
        },
      },
    },
  });

  const eventActivities = [];

  events.forEach((event) => {
    const newEventFollower = event.followers.map((follower) => ({
      type: 7,
      creatorId: follower.consumerId,
      receiverId: event.authorId,
      eventId: event.id,
      sentOn: faker.date.past(0, new Date()),
      seen: faker.datatype.boolean(),
    }));

    const eventUpdated = event.followers.map((follower) => ({
      type: 1,
      creatorId: event.authorId,
      receiverId: follower.consumerId,
      eventId: event.id,
      sentOn: faker.date.past(0, new Date()),
      seen: faker.datatype.boolean(),
    }));

    const newComment = event.comments.map((comment) => ({
      type: 2,
      creatorId: comment.authorId,
      receiverId: event.authorId,
      eventId: event.id,
      commentId: comment.id,
      sentOn: faker.date.past(0, new Date()),
      seen: faker.datatype.boolean(),
    }));

    const commentResponded = event.comments
      .filter((com) => !!com.response)
      .map((comment) => ({
        type: 3,
        creatorId: event.authorId,
        receiverId: comment.authorId,
        eventId: event.id,
        commentId: comment.id,
        sentOn: faker.date.past(0, new Date()),
        seen: faker.datatype.boolean(),
      }));

    eventActivities.push(
      ...newEventFollower,
      ...eventUpdated,
      ...newComment,
      ...commentResponded,
    );
  });

  await prisma.activity.createMany({
    data: eventActivities,
  });
}
