import { PrismaClient } from '@prisma/client';
import seedUsers from './seeds/users';
import seedPublishers from './seeds/publishers';
import seedCategories from './seeds/categories';
import seedEvents from './seeds/events';
import seedFollowers from './seeds/followers';

const prisma = new PrismaClient();

async function main() {
  console.info('Starting seed');
  const users = await seedUsers(prisma);
  const publishers = await seedPublishers(prisma);
  const categories = await seedCategories(prisma);
  await seedEvents(prisma, publishers, users, categories);
  await seedFollowers(prisma, users, publishers);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
