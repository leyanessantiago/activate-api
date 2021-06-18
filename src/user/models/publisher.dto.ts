import { UserDTO } from './user.dto';

export interface PublisherDTO extends UserDTO {
  events: number;
  followers: number;
  followedByMe: boolean;
}
