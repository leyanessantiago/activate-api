import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ProfileDto } from '../../auth/dto/profile.dto';
import { SocialStrategy } from './social.startegy';

@Injectable()
export class GoogleStrategy
  extends PassportStrategy(Strategy, 'google')
  implements SocialStrategy {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user: ProfileDto = {
      email: emails[0].value,
      name: name.givenName,
      lastName: name.familyName,
      avatar: photos[0].value,
      userName: '',
      verificationLevel: 1,
    };

    done(null, user);
  }
}
