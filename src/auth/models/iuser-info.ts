export interface IUserInfo {
  sub: string;
  email: string;
  name: string;
  lastName?: string;
  userName?: string;
  avatar?: string;
  theme?: string;
  useDarkStyle?: boolean;
  verificationLevel: number;
  accessToken: string;
}
