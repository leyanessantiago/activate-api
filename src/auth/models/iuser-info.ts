export interface IUserInfo {
  sub: string;
  email: string;
  fullName?: string;
  userName?: string;
  avatarUrl?: string;
  verificationLevel: number;
  accessToken: string;
}
