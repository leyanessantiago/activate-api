import { ProfileDto } from '../dto/profile.dto';

export interface SocialStrategy {
  validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<ProfileDto>;
}
