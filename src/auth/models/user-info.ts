import { IUserInfo } from './iuser-info';

export class UserInfo {
  sub: string;
  email: string;
  userName: string;
  fullName: string;
  avatar: string;
  verificationLevel: number;
  accessToken: string;

  constructor(userInfo: IUserInfo) {
    this.sub = userInfo.sub;
    this.email = userInfo.email;
    this.fullName = userInfo.fullName;
    this.userName = userInfo.userName;
    this.avatar = userInfo.avatar;
    this.verificationLevel = userInfo.verificationLevel;
    this.accessToken = userInfo.accessToken;
  }
}
