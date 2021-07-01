import { PrismaClient } from '@prisma/client';
import seedUsers from './seeds/users';
import seedPublishers from './seeds/publishers';
import seedCategories from './seeds/categories';
import seedEvents from './seeds/events';
import seedConsumerRelations from './seeds/consumer-relations';
import seedEventActivities from './seeds/event-activities';
import seedConsumerActivities from './seeds/consumer-activities';
import seedEventFollowers from './seeds/event-followers';

const prisma = new PrismaClient();

async function main() {
  console.info('Starting seed');
  await seedUsers(prisma);
  await seedPublishers(prisma);
  await seedCategories(prisma);
  await seedEvents(prisma);
  await seedConsumerRelations(prisma);
  await seedEventFollowers(prisma);
  await seedConsumerActivities(prisma);
  await seedEventActivities(prisma);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
