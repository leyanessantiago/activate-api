export interface IUserInfo {
  sub: string;
  email: string;
  fullName?: string;
  userName?: string;
  avatar?: string;
  usePhoto: boolean;
  verificationLevel: number;
  accessToken: string;
}
