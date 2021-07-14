import { QueryEvent } from '../models/query-event';

export default function compareEvents(
  a: QueryEvent,
  b: QueryEvent,
  relevanceMap: { [categoryId: string]: number },
) {
  const aDate = a.date.getTime();
  const bDate = b.date.getTime();

  const aRelevance = relevanceMap[a.categoryId];
  const bRelevance = relevanceMap[b.categoryId];

  const aFriendsCount = a.followers.length;
  const bFriendsCount = b.followers.length;

  const aFollowersCount = a._count.followers;
  const bFollowersCount = b._count.followers;

  return (
    aRelevance - bRelevance ||
    aFriendsCount - bFriendsCount ||
    aFollowersCount - bFollowersCount ||
    aDate - bDate
  );
}
