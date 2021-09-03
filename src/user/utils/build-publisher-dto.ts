import { FollowerStatus } from '../../constants/user';
import { pickTopFriends } from '../../helpers/consumers';
import { PublisherDTO, PublisherQuery } from '../models/publisher';
import buildAvatarUrl from '../../helpers/build-avatar-url';

interface Params {
  publisher: PublisherQuery;
  currentUser: string;
  status?: FollowerStatus;
  pickFriends?: boolean;
}

export default function buildPublisherDto(params: Params): PublisherDTO {
  const { publisher, currentUser, status, pickFriends } = params;
  const { user, followers, _count } = publisher;
  const me = followers?.find(
    (follower) => follower.consumer.user.id === currentUser,
  );
  const friends = pickFriends
    ? pickTopFriends(followers as any, currentUser)
    : undefined;

  return {
    ...user,
    avatar: buildAvatarUrl(user.avatar),
    friends,
    count: {
      events: _count?.events,
      followers: _count?.followers,
    },
    followerStatus: status || me?.status || FollowerStatus.UNRELATED,
  };
}
