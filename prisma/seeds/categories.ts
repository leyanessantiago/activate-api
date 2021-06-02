import { PrismaClient, Category } from '@prisma/client';

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

export default async function seedCategories(
  prisma: PrismaClient,
): Promise<Category[]> {
  console.log('Seeding categories');

  const entities = [];

  for (const cat of categories) {
    const dbEntity = await prisma.category.create({
      data: { name: cat },
    });

    entities.push(dbEntity);
  }

  return entities;
}
