export interface UpcomingEventsDto {
  name: string;
  date: Date;
  address: string;
  description?: string;
  image?: string;
  category: string;
  author: {
    username: string;
    name: string;
    eventCount: number;
    followersCount: number;
  };
  attendance: number;
  friends: any;
}
