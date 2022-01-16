export interface EventDTO {
  id: string;
  image: string;
  name?: string;
  date?: Date;
  address?: string;
  description?: string;
  comments?: Comment[];
  author?: {
    id: string;
    name: string;
    userName?: string;
    avatar: string;
  };
  friends?: {
    id: string;
    avatar: string;
  }[];
  followersCount?: number;
  going?: boolean;
}

interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    userName: string;
    avatar: string;
  };
  content: string;
  response: string;
  createdOn: Date;
  respondedOn: Date;
}

export interface SimpleEventDTO {
  category: string;
  name: string;
  date: Date;
  endDate?: Date;
  isRanged?: boolean;
  address: string;
  isOnline?: boolean;
}
