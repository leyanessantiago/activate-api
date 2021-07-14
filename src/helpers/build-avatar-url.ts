import buildImageUrl from './build-image-url';

const users = ['user1', 'user2', 'user3', 'user4'];

export default function buildAvatarUrl(avatar: string) {
  if (users.some((user) => user === avatar)) {
    return avatar;
  }

  return buildImageUrl(`auth/avatar/${avatar}`);
}
