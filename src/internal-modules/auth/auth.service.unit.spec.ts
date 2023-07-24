import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, JwtService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('createSalt', () => {});
  describe('generateRandomPassword', () => {});
  describe('hashValue', () => {});
  describe('hashedValueGate', () => {});
  describe('signAuthToken', () => {});
  describe('signRefreshToken', () => {});
  describe('signClaimAcctToken', () => {});
  describe('signToken', () => {});
  describe('verifyAuthToken', () => {});
  describe('verifyRefreshToken', () => {});
  describe('verifyAcctToken', () => {});
  describe('verifyToken', () => {});

  afterEach(() => jest.resetAllMocks());
});
