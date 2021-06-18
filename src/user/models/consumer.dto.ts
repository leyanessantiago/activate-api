import { UserDTO } from './user.dto';

export interface ConsumerDTO extends UserDTO {
  following: number;
  friends: number;
  myFriend: boolean;
}
