import { EventDTO } from '../models/event';
import buildAvatarUrl from '../../helpers/build-avatar-url';
import buildImageUrl from '../../helpers/build-image-url';
import { QueryEvent } from '../models/query-event';
import { findIfImGoing, pickTopFriends } from '../../helpers/consumers';

export function buildEventDto(event: QueryEvent, user: string): EventDTO {
  const { author, image, followers, _count, ...rest } = event;
  const amIGoing = findIfImGoing(followers, user);
  const friends = pickTopFriends(followers, user);

  return {
    ...rest,
    image: buildImageUrl(`events/image/${image}`),
    author: {
      ...author.user,
      avatar: buildAvatarUrl(author.user.avatar),
    },
    friends,
    followersCount: _count.followers,
    going: amIGoing,
  };
}