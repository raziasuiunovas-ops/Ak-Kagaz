import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('GOOGLE_CLIENT_ID') || '',
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET') || '',
      callbackURL:
        config.get<string>('GOOGLE_CALLBACK_URL') ||
        'http://localhost:4000/api/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ) {
    const email = profile.emails?.[0];
    if (!email?.value || !email.verified) {
      return null;
    }

    const [firstName, ...lastNameParts] = (profile.displayName || '').split(' ');
    return {
      providerAccountId: profile.id,
      email: email.value.toLowerCase(),
      emailVerified: true,
      firstName: firstName || '',
      lastName: lastNameParts.join(' '),
      avatarUrl: profile.photos?.[0]?.value,
    };
  }
}
