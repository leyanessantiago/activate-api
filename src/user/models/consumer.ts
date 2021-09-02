import { RelationshipStatus } from 'src/constants/user';
import { UserDTO } from './user.dto';

export interface ConsumerDTO extends UserDTO {
  count?: {
    following?: number;
    friends?: number;
  };
  friends?: { id: string; avatar: string }[];
  relationStatus: RelationshipStatus;
}
