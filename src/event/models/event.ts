export interface EventDTO {
  id: string;
  name: string;
  date: Date;
  image: string;
  address: string;
  description?: string;
  comments?: {
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
  }[];
  author: {
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
  going: boolean;
}
