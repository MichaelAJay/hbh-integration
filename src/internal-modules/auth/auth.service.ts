import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CustomLoggerService } from 'src/support-modules/custom-logger/custom-logger.service';
import { VerifyJwtErrorMsg } from './enums';
import { AccessJWTPayload, RefreshJWTPayload } from './types';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly logger: CustomLoggerService,
  ) {}

  async createSalt() {}

  async hashValue({ value, salt }: { value: string; salt: string }) {
    return '';
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
  }): Promise<string> {
    return this.signToken(payload, process.env.AT_JWT_SECRET, '30m');
  }

  async signRefreshToken(payload: { userId: string }): Promise<string> {
    return this.signToken(payload, process.env.RT_JWT_SECRET, '2d');
  }

  async signToken(
    payload: Record<string, any>,
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
    const { accountId, userId } = await this.verifyToken<AccessJWTPayload>(
      token,
      process.env.AT_JWT_SECRET,
    );

    if (!(typeof accountId === 'string' && typeof userId === 'string'))
      throw new UnprocessableEntityException({
        reason: VerifyJwtErrorMsg.INCORRECT_FORM,
      });

    return { accountId, userId };
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
}
