import buildAvatarUrl from './build-avatar-url';

export interface SimpleConsumer {
  consumer: {
    user: {
      id: string;
      avatar: string;
    };
  };
}

export function findIfImGoing(
  followers: SimpleConsumer[],
  currentUser: string,
) {
  return followers.some(
    (follower) => follower.consumer.user.id === currentUser,
  );
}

export function pickTopFriends(
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
