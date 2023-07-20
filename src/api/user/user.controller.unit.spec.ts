import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { AuthService } from 'src/internal-modules/auth/auth.service';
import { LoginBodyDto } from './dtos/body';
import { UserController } from './user.controller';
import { UserAPIService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserAPIService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserAPIService,
          useValue: {
            login: jest.fn(),
            refreshAuth: jest.fn(),
            claimAccount: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            verifyRefreshToken: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserAPIService>(UserAPIService);
    authService = module.get<AuthService>(AuthService);
  });

  describe('existence and injection tests', () => {
    test('controller is defined', () => expect(controller).toBeDefined());
    test('UserService is injected into controller.userService', () =>
      expect(userService).toBeDefined());
    test('AuthService is defined', () => expect(authService).toBeDefined());
  });
  describe('POST /login', () => {
    it('calls userService.login with the correct arguments', async () => {
      const mockBody: LoginBodyDto = {
        username: 'MOCK USER NAME',
        password: 'MOCK PASSWORD',
      };

      const mockResponse = {
        cookie: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;

      const mockResolvedValues = {
        at: 'MOCK AT',
        rt: 'MOCK RT',
      };

      jest.spyOn(userService, 'login').mockResolvedValue(mockResolvedValues);
      await controller.login(mockBody, mockResponse);
      expect(userService.login).toHaveBeenCalledWith(mockBody);
    });
    it('calls Response method cookie (2) on successful userService.login Promise resolution', async () => {
      const mockBody: LoginBodyDto = {
        username: 'MOCK USER NAME',
        password: 'MOCK PASSWORD',
      };

      const mockResponse = {
        cookie: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;

      const mockResolvedValue = {
        at: 'MOCK AT',
        rt: 'MOCK RT',
      };

      jest.spyOn(userService, 'login').mockResolvedValue(mockResolvedValue);
      jest.spyOn(mockResponse, 'cookie');
      await controller.login(mockBody, mockResponse);
      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'accessToken',
        mockResolvedValue.at,
        {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
        },
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        mockResolvedValue.rt,
        {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
        },
      );
    });
    it('propagates any error thrown by userService.login', async () => {
      const mockBody: LoginBodyDto = {
        username: 'MOCK USER NAME',
        password: 'MOCK PASSWORD',
      };

      const mockResponse = {
        cookie: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;

      const mockError = new Error('ERROR UNDER TEST');

      jest.spyOn(userService, 'login').mockRejectedValue(mockError);
      await expect(controller.login(mockBody, mockResponse)).rejects.toThrow(
        mockError,
      );
    });
    it('returns res.send with an object containing the results from userService.login', async () => {
      const mockBody: LoginBodyDto = {
        username: 'MOCK USER NAME',
        password: 'MOCK PASSWORD',
      };

      const mockResolvedUserServiceLogin = {
        at: 'MOCK AT',
        rt: 'MOCK RT',
      };

      const mockResolvedValue = JSON.stringify(mockResolvedUserServiceLogin);

      const mockResponse = {
        cookie: jest.fn(),
        send: jest.fn().mockResolvedValue(mockResolvedValue),
      } as unknown as Response;

      jest
        .spyOn(userService, 'login')
        .mockResolvedValue(mockResolvedUserServiceLogin);
      const result = await controller.login(mockBody, mockResponse);
      expect(mockResponse.send).toHaveBeenCalledWith(
        mockResolvedUserServiceLogin,
      );
      expect(result).toEqual(mockResolvedValue);
    });
  });
  describe('POST /refresh-auth', () => {});
  describe('PATCH /claim-account', () => {});
  afterEach(() => jest.restoreAllMocks());
});
