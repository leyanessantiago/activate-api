import { RelationshipStatus } from 'src/constants/user';
import { UserDTO } from './user.dto';

export interface ConsumerDTO extends UserDTO {
  following: number;
  friends: number;
  relationStatus: RelationshipStatus;
}
