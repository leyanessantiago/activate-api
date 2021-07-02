import { ActivityType } from '../../constants/activities';
import { UserDTO } from '../../user/models/user.dto';

export interface ActivityDTO {
  id: string;
  type: ActivityType;
  sentOn: Date;
  seen: boolean;
  creator: UserDTO;
  event?: {
    id: string;
    name: string;
  };
}
