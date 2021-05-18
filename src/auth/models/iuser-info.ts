export interface IUserInfo {
  sub: string;
  email: string;
  fullName?: string;
  userName?: string;
  avatar?: string;
  verificationLevel: number;
  accessToken: string;
}
