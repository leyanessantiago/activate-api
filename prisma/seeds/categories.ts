import { PrismaClient } from '@prisma/client';

const categories = [
  'Music',
  'Movies',
  'Photos',
  'Art',
  'Science',
  'Health',
  'Reading',
  'Cooking',
  'Pets',
  'Fashion',
  'Sports',
  'Night Out',
];

export default async function seedCategories(prisma: PrismaClient) {
  console.log('Seeding categories');

  for (const cat of categories) {
    await prisma.category.create({
      data: { name: cat },
    });
  }
}
