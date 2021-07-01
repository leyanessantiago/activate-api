export interface UpcomingEventDto {
  id: string;
  name: string;
  date: Date;
  description: string;
  author: {
    id: string;
    avatar: string;
  };
  relativesFollowers: {
    id: string;
    avatar: string;
  }[];
  followersCount: number;
}
