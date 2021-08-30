import { VerifyCallback } from 'passport-google-oauth20';
import { ProfileDto } from '../../auth/dto/profile.dto';

export interface SocialStrategy {
  validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<ProfileDto>;
}
