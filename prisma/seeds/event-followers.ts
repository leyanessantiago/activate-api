import { PrismaClient, Consumer, Event, EventFollower } from '@prisma/client';
import * as faker from 'faker';

export default async function seedEventFollowers(prisma: PrismaClient) {
  console.log('Seeding event followers');

  const events: Event[] = await prisma.event.findMany();
  const consumers: Consumer[] = await prisma.consumer.findMany();

  for (const event of events) {
    const eventFollowers: EventFollower[] = faker.random
      .arrayElements(consumers)
      .map((consumer) => ({
        consumerId: consumer.userId,
        eventId: event.id,
      }));

    await prisma.eventFollower.createMany({
      data: eventFollowers,
    });
  }
}
