import { IUserInfo } from './iuser-info';

export class UserInfo {
    id:         string;
    email:      string;
    accessToken: string;

    constructor(userInfo: IUserInfo) {
        this.id = userInfo.id;
        this.email = userInfo.email;
        this.accessToken = userInfo.accessToken;
    }
}