import { SimpleConsumer } from '../models/simple-consumer';

export default function findIfImGoing(
  followers: SimpleConsumer[],
  currentUser: string,
) {
  return followers.some(
    (follower) => follower.consumer.user.id === currentUser,
  );
}
