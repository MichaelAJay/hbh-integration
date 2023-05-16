import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CustomLoggerService } from 'src/support-modules/custom-logger/custom-logger.service';
import { VerifyJwtErrorMsg } from './enums';
import {
  AccessJWTPayload,
  AccountJwtPayload,
  RefreshJWTPayload,
} from './types';
import { pbkdf2, randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly logger: CustomLoggerService,
  ) {}

  createSalt() {
    return this.generateRandomBytes(16);
  }

  generateRandomPassword() {
    return this.generateRandomBytes(32);
  }

  async hashValue({
    value,
    salt,
  }: {
    value: string;
    salt: string;
  }): Promise<string> {
    return new Promise((resolve, reject) => {
      const iterations = 10000;
      const keylen = 64;
      const digest = 'sha512';

      pbkdf2(value, salt, iterations, keylen, digest, (err, derivedKey) => {
        if (err) reject(err);
        else resolve(derivedKey.toString('hex'));
      });
    });
  }

  async hashedValueGate({
    hashedValue,
    valueToHash: value,
    salt,
  }: {
    hashedValue: string;
    valueToHash: string;
    salt: string;
  }) {
    if (hashedValue !== (await this.hashValue({ value, salt })))
      throw new ForbiddenException();
  }

  async signAuthToken(payload: {
    userId: string;
    accountId: string;
    ref: string;
  }): Promise<string> {
    return this.signToken(payload, process.env.AT_JWT_SECRET, '30m');
  }

  async signRefreshToken(payload: { userId: string }): Promise<string> {
    return this.signToken(payload, process.env.RT_JWT_SECRET, '2d');
  }

  async signClaimAcctToken(payload: {
    userId: string;
    password: string;
  }): Promise<string> {
    return this.signToken(payload, process.env.ACCT_JWT_SECRET, '7d');
  }

  async signToken(
    payload: Omit<AccessJWTPayload, 'exp'> | Omit<RefreshJWTPayload, 'exp'>,
    secret: string | undefined,
    duration: string,
  ): Promise<string> {
    if (!secret) {
      const msg = 'Missing JWT secret';
      this.logger.error(msg, {});
      throw new InternalServerErrorException('Missing JWT secret');
    }

    return await this.jwtService.signAsync(payload, {
      secret,
      expiresIn: duration,
    });
  }

  async verifyAuthToken(token: string): Promise<Omit<AccessJWTPayload, 'exp'>> {
    const { accountId, userId, ref } = await this.verifyToken<AccessJWTPayload>(
      token,
      process.env.AT_JWT_SECRET,
    );

    if (!(typeof accountId === 'string' && typeof userId === 'string'))
      throw new UnprocessableEntityException({
        reason: VerifyJwtErrorMsg.INCORRECT_FORM,
      });

    return { accountId, userId, ref };
  }

  async verifyRefreshToken(
    token: string,
  ): Promise<Omit<RefreshJWTPayload, 'exp'>> {
    const { userId } = await this.verifyToken<RefreshJWTPayload>(
      token,
      process.env.RT_JWT_SECRET,
    );

    if (typeof userId !== 'string')
      throw new UnprocessableEntityException({
        reason: VerifyJwtErrorMsg.INCORRECT_FORM,
      });

    return { userId };
  }

  async verifyAcctToken(
    token: string,
  ): Promise<Omit<AccountJwtPayload, 'exp'>> {
    const { userId, password } = await this.verifyToken<AccountJwtPayload>(
      token,
      process.env.ACCT_JWT_SECRET,
    );

    if (!(typeof userId === 'string' && typeof password === 'string'))
      throw new UnprocessableEntityException({
        reason: VerifyJwtErrorMsg.INCORRECT_FORM,
      });
    return { userId, password };
  }

  async verifyToken<T>(token: string, secret: string | undefined): Promise<T> {
    if (!secret)
      throw new InternalServerErrorException({
        reason: VerifyJwtErrorMsg.MISSING_SECRET,
      });

    const payload = await this.jwtService.verifyAsync(token, { secret });

    if (!payload.exp)
      throw new ForbiddenException({ reason: VerifyJwtErrorMsg.MISSING_EXP });

    if (Date.now() / 1000 > payload.exp)
      throw new ForbiddenException({ reason: VerifyJwtErrorMsg.EXPIRED });

    return payload;
  }

  /**
   * Helpers
   */
  private generateRandomBytes(numBytes = 32) {
    return randomBytes(numBytes).toString('hex');
  }
}
