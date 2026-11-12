import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    const nodeEnv = config.get<string>('NODE_ENV');
    const isProduction = nodeEnv === 'production';
    
    // Determine base URL based on environment
    const baseUrl = isProduction
      ? config.get<string>('NEXT_PUBLIC_SITE_URL') || 'https://ak-kagaz.vercel.app'
      : config.get<string>('NEXT_PUBLIC_APP_URL') || 'http://localhost:4000';
    
    // Construct callback URL: baseUrl + /api/auth/google/callback
    const callbackURL = config.get<string>('GOOGLE_CALLBACK_URL') 
      || `${baseUrl}/api/auth/google/callback`;

    super({
      clientID: config.get<string>('GOOGLE_CLIENT_ID') || '',
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET') || '',
      callbackURL,
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
