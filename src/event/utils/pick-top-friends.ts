import { SimpleConsumer } from '../models/simple-consumer';

export default function pickTopFriends(
  followers: SimpleConsumer[],
  currentUser: string,
) {
  const friends = [];

  for (let i = 0; i < followers.length && friends.length < 4; i++) {
    const follower = followers[i];

    if (follower.consumer.user.id !== currentUser) {
      friends.push(follower);
    }
  }

  return friends;
}
