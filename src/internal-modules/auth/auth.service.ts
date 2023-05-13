import { ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
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

  async signAuthToken(): Promise<string> {
    return '';
  }

  async signRefreshToken(): Promise<string> {
    return '';
  }
}
