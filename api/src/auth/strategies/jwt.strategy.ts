import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { type Request } from 'express';

function fromCookie(req: Request): string | null {
  if (!req) return null;
  const rawCookie: string | undefined = req.cookies?.access_token as
    | string
    | undefined;
  return typeof rawCookie === 'string' ? rawCookie : null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(cfg: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([fromCookie]),
      ignoreExpiration: false,
      secretOrKey: cfg.get<string>('JWT_SECRET', 'dev-insecure'),
    });
  }

  validate(payload: { sub: string; email: string }): {
    userId: string;
    email: string;
  } {
    return { userId: payload.sub, email: payload.email };
  }
}
