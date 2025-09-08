import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserService,
    private readonly jwt: JwtService,
  ) {}

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.users.findByEmail(email);
    if (!user) return null;
    const ok = await argon2.verify(user.passwordHash, password);
    return ok ? user : null;
  }

  issueAccessToken(user: User) {
    // TODO: Read https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-token-claims
    return this.jwt.signAsync({ sub: user.id, email: user.email });
  }

  // TODO: Refresh tokens w/ Redis
  // async issueRefreshToken(user: User) { ... }
  // async rotateRefreshToken(oldToken: string) { ... }
}
