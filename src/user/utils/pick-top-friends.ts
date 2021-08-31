import buildAvatarUrl from '../../helpers/build-avatar-url';
import { SimpleConsumer } from '../models/simple-consumer';

export default function pickTopFriends(
  followers: SimpleConsumer[],
  currentUser: string,
) {
  const friends = [];

  for (let i = 0; i < followers.length && friends.length < 4; i++) {
    const {
      consumer: {
        user: { id, avatar },
      },
    } = followers[i];

    if (id !== currentUser) {
      friends.push({
        id: id,
        avatar: buildAvatarUrl(avatar),
      });
    }
  }

  return friends;
}
