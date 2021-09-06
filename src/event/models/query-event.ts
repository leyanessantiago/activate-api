export interface QueryEvent {
  categoryId?: string;
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
    user: {
      id: string;
      name: string;
      userName?: string;
      avatar: string;
    };
  };
  followers: {
    consumer: {
      user: {
        id: string;
        avatar: string;
      };
    };
  }[];
  _count?: {
    followers: number;
  };
}
