import { FollowerStatus } from 'src/constants/user';
import { UserDTO } from './user.dto';

export interface PublisherDTO extends UserDTO {
  count?: {
    events?: number;
    followers?: number;
  };
  friends?: { id: string; avatar: string }[];
  followerStatus: FollowerStatus;
}

export interface PublisherQuery {
  user: {
    id: string;
    userName: string;
    name: string;
    avatar: string;
  };
  followers?: {
    status: FollowerStatus;
    consumer?: {
      user: {
        id: string;
        avatar?: string;
      };
    };
  }[];
  _count?: {
    followers: number;
    events: number;
  };
}
