import {
  PrismaClient,
  Publisher,
  Event,
  Comment,
  Consumer,
  Category,
} from '@prisma/client';
import * as faker from 'faker';

function generateComments(eventDate: string | Date, users: Consumer[]) {
  return new Array(faker.datatype.number({ min: 5, max: 15 }))
    .fill(1)
    .map(() => {
      const author = users[faker.datatype.number({ min: 0, max: 29 })];
      const hasResponse = faker.datatype.boolean();
      const response = hasResponse ? faker.lorem.lines(4) : undefined;
      const respondedOn = hasResponse
        ? faker.date.past(0, eventDate)
        : undefined;

      return {
        authorId: author.userId,
        content: faker.lorem.lines(4),
        createdOn: faker.date.past(0, eventDate),
        response,
        respondedOn,
      } as Comment;
    });
}

const images: string[] = [
  'baking-event.jpeg',
  'comedy-show.jpeg',
  'feminist-event.jpeg',
  'virtual-tour.jpeg',
];

export default async function seedEvents(prisma: PrismaClient) {
  console.log('Seeding events');

  const publishers: Publisher[] = await prisma.publisher.findMany({
    include: { user: true },
  });
  const users: Consumer[] = await prisma.consumer.findMany({
    include: { user: true },
  });
  const categories: Category[] = await prisma.category.findMany();

  const events = new Array(20).fill(1).map(() => {
    const { DOMAIN_NAME, API_PREFIX } = process.env;
    const domain = `${DOMAIN_NAME}/${API_PREFIX}`;
    const imageName = faker.random.arrayElement(images);
    const image = `${domain}/events/image/${imageName}`;
    const authorId = faker.random.arrayElement(publishers).userId;
    const categoryId = faker.random.arrayElement(categories).id;

    return {
      image,
      authorId,
      categoryId,
      name: faker.lorem.words(6),
      address: faker.address.streetAddress(true),
      date: faker.date.future(),
      description: faker.lorem.lines(8),
    } as Event;
  });

  for (const event of events) {
    const comments = generateComments(event.date, users);

    await prisma.event.create({
      data: {
        ...event,
        comments: {
          create: comments,
        },
      },
    });
  }
}
