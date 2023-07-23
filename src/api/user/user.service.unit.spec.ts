import { Test, TestingModule } from '@nestjs/testing';
import { ILogin, IResetPassword } from './interfaces';
import { UserInternalInterfaceService } from './user-internal-interface.service';
import { UserAPIService } from './user.service';

describe('UserService', () => {
  let service: UserAPIService;
  let userInternalInterface: UserInternalInterfaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAPIService,
        {
          provide: UserInternalInterfaceService,
          useValue: {
            login: jest.fn(),
            refreshAuth: jest.fn(),
            resetPassword: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserAPIService>(UserAPIService);
    userInternalInterface = module.get<UserInternalInterfaceService>(
      UserInternalInterfaceService,
    );
  });

  describe('existence & injection tests', () => {
    test('service is defined', () => expect(service).toBeDefined());
    test('UserInternalInterfaceService is injected into service.userInternalInterface', () =>
      expect(userInternalInterface).toBeDefined());
  });
  describe('login', () => {
    it('calls userInternalInterface.login with the correct arguments', async () => {
      const mockArguments: ILogin = {
        username: 'MOCK USER NAME',
        password: 'MOCK PASSWORD',
      };
      const mockResolvedValue = {
        at: 'MOCK ACCESS TOKEN',
        rt: 'MOCK REFRESH TOKEN',
      };

      jest.spyOn(userInternalInterface, 'login');
      await service.login(mockArguments);
      expect(userInternalInterface.login).toHaveBeenCalledWith(mockArguments);
    });
    it('passes through the result from userInternalInterface.login on success', async () => {
      const mockArguments: ILogin = {
        username: 'MOCK USER NAME',
        password: 'MOCK PASSWORD',
      };
      const mockError = new Error('ERROR UNDER TEST');

      jest.spyOn(userInternalInterface, 'login').mockRejectedValue(mockError);
      await expect(service.login(mockArguments)).rejects.toThrow(mockError);
    });
    it('propagates any error thrown by userInternalInterface.login', async () => {
      const mockArguments: ILogin = {
        username: 'MOCK USER NAME',
        password: 'MOCK PASSWORD',
      };
      const mockResolvedValue = {
        at: 'MOCK ACCESS TOKEN',
        rt: 'MOCK REFRESH TOKEN',
      };

      jest
        .spyOn(userInternalInterface, 'login')
        .mockResolvedValue(mockResolvedValue);
      const result = await service.login(mockArguments);
      expect(result).toEqual(mockResolvedValue);
    });
  });
  describe('refreshAuth', () => {
    it('calls userInternalInterface.refreshAuth with the correct arguments', async () => {
      const mockArguments = {
        userId: 'MOCK USER ID',
        rt: 'MOCK REFRESH TOKEN',
      };
      const mockResolvedValue = {
        at: 'MOCK ACCESS TOKEN',
        rt: 'MOCK REFRESH TOKEN',
      };
      jest
        .spyOn(userInternalInterface, 'refreshAuth')
        .mockResolvedValue(mockResolvedValue);

      await service.refreshAuth(mockArguments);
      expect(userInternalInterface.refreshAuth).toHaveBeenCalledWith(
        mockArguments,
      );
    });
    it('passes through the result from userInternalInterface.refreshAuth on success', async () => {
      const mockArguments = {
        userId: 'MOCK USER ID',
        rt: 'MOCK REFRESH TOKEN',
      };
      const mockResolvedValue = {
        at: 'MOCK ACCESS TOKEN',
        rt: 'MOCK REFRESH TOKEN',
      };
      jest
        .spyOn(userInternalInterface, 'refreshAuth')
        .mockResolvedValue(mockResolvedValue);

      const result = await service.refreshAuth(mockArguments);
      expect(result).toEqual(mockResolvedValue);
    });
    it('propagates any error thrown by userInternalInterface.refreshAuth', async () => {
      const mockArguments = {
        userId: 'MOCK USER ID',
        rt: 'MOCK REFRESH TOKEN',
      };
      const mockError = new Error('ERROR UNDER TEST');
      jest
        .spyOn(userInternalInterface, 'refreshAuth')
        .mockRejectedValue(mockError);

      await expect(service.refreshAuth(mockArguments)).rejects.toThrow(
        mockError,
      );
    });
  });
  describe('claimAccount', () => {
    it('calls userInternalInterface.resetPassword with the correct arguments', async () => {
      const mockArguments: IResetPassword = {
        token: 'MOCK RESET PASSWORD TOKEN',
        newPassword: 'MOCK NEW PASSWORD',
      };
      const mockResolvedValue = undefined;
      jest
        .spyOn(userInternalInterface, 'resetPassword')
        .mockResolvedValue(mockResolvedValue);
      await service.claimAccount(mockArguments);
      expect(userInternalInterface.resetPassword).toHaveBeenCalledWith(
        mockArguments,
      );
    });
    it('sends success message object if userInternalInterface.resetPassword successfully resolved', async () => {
      const mockSuccessMessageObject = {
        msg: 'Account claimed.  You may log in with your new password',
      };

      const mockArguments: IResetPassword = {
        token: 'MOCK RESET PASSWORD TOKEN',
        newPassword: 'MOCK NEW PASSWORD',
      };
      const mockResolvedValue = undefined;
      jest
        .spyOn(userInternalInterface, 'resetPassword')
        .mockResolvedValue(mockResolvedValue);
      const result = await service.claimAccount(mockArguments);
      expect(result).toEqual(mockSuccessMessageObject);
    });
    it('propagates any error thrown by userInternalInterface.resetPassword', async () => {
      const mockArguments: IResetPassword = {
        token: 'MOCK RESET PASSWORD TOKEN',
        newPassword: 'MOCK NEW PASSWORD',
      };
      const mockError = new Error('ERROR UNDER TEST');
      jest
        .spyOn(userInternalInterface, 'resetPassword')
        .mockRejectedValue(mockError);
      await expect(service.claimAccount(mockArguments)).rejects.toThrow(
        mockError,
      );
    });
  });
  afterEach(() => jest.restoreAllMocks());
});
