import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { Injectable } from '@nestjs/common';
import { ProfileDto } from '../dto/profile.dto';
import { SocialStrategy } from './social.startegy';

@Injectable()
export class FacebookStrategy
  extends PassportStrategy(Strategy, 'facebook')
  implements SocialStrategy {
  constructor() {
    super({
      clientID: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      scope: 'email',
      profileFields: ['emails', 'name', 'photos', 'profileUrl'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (err: any, user: any, info?: any) => void,
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
