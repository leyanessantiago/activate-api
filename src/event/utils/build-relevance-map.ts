import { UserInterests } from '.prisma/client';

export default function buildRelevanceMap(interests: UserInterests[]) {
  return interests.reduce((map, interest) => {
    const { categoryId, relevance } = interest;

    return {
      ...map,
      [categoryId]: relevance,
    };
  }, {});
}
