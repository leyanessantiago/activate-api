export interface QueryEvent {
  categoryId: string;
  id: string;
  name: string;
  date: Date;
  image: string;
  address: string;
  description: string;
  author: {
    user: {
      id: string;
      name: string;
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
  _count: {
    followers: number;
  };
}
