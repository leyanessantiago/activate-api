import { IUserInfo } from './iuser-info';

export class UserInfo {
  sub: string;
  email: string;
  accessToken: string;

  constructor(userInfo: IUserInfo) {
    this.sub = userInfo.sub;
    this.email = userInfo.email;
    this.accessToken = userInfo.accessToken;
  }
}
