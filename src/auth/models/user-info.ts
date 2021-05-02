import { IUserInfo } from './iuser-info';

export class UserInfo {
  sub: string;
  email: string;
  userName: string;
  fullName: string;
  avatarUrl: string;
  isVerified: boolean;
  accessToken: string;

  constructor(userInfo: IUserInfo) {
    this.sub = userInfo.sub;
    this.email = userInfo.email;
    this.fullName = userInfo.fullName;
    this.userName = userInfo.userName;
    this.avatarUrl = userInfo.avatarUrl;
    this.isVerified = userInfo.isVerified;
    this.accessToken = userInfo.accessToken;
  }
}
