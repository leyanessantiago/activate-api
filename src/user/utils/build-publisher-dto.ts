import { FollowerStatus } from '../../constants/user';
import { PublisherDTO, PublisherQuery } from '../models/publisher';
import pickTopFriends from './pick-top-friends';

interface Params {
  publisher: PublisherQuery;
  currentUser: string;
  pickFriends?: boolean;
}

export default function buildPublisherDto(params: Params): PublisherDTO {
  const { publisher, currentUser, pickFriends } = params;
  const { status, user, followers, _count } = publisher;
  const me = followers?.find(
    (follower) => follower.consumer.user.id === currentUser,
  );
  const friends = pickFriends
    ? pickTopFriends(followers as any, currentUser)
    : undefined;

  return {
    ...user,
    friends,
    count: {
      events: _count?.events,
      followers: _count?.followers,
    },
    followerStatus: status || me?.status || FollowerStatus.UNRELATED,
  };
}
