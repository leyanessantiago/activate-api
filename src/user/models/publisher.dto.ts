import { FollowerStatus } from 'src/constants/user';
import { UserDTO } from './user.dto';

export interface PublisherDTO extends UserDTO {
  events: number;
  followers: number;
  followerStatus: FollowerStatus;
}
