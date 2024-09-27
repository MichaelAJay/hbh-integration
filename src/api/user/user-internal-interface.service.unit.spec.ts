import {
  BadRequestException,
  ForbiddenException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  IAccountModelWithId,
  IUserModelWithId,
} from 'src/external-modules/database/models';
import { AuthService } from 'src/internal-modules/auth/auth.service';
import { AccountDbHandlerService } from 'src/internal-modules/external-interface-handlers/database/account-db-handler/account-db-handler.service';
import { UserDbHandlerService } from 'src/internal-modules/external-interface-handlers/database/user-db-handler/user-db-handler.service';
import { ILogin, IResetPassword } from './interfaces';
import { UserInternalInterfaceService } from './user-internal-interface.service';

describe('UserInternalInterfaceService', () => {
  let service: UserInternalInterfaceService;
  let userDbHandler: UserDbHandlerService;
  let accountDbHandler: AccountDbHandlerService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserInternalInterfaceService,
        {
          provide: UserDbHandlerService,
          useValue: {
            getOneByEmail: jest.fn(),
            getOne: jest.fn(),
            updateOne: jest.fn(),
          },
        },
        {
          provide: AccountDbHandlerService,
          useValue: {
            getAccount: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            signAuthToken: jest.fn(),
            signRefreshToken: jest.fn(),
            hashValue: jest.fn(),
            hashedValueGate: jest.fn(),
            verifyAcctToken: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserInternalInterfaceService>(
      UserInternalInterfaceService,
    );
    userDbHandler = module.get<UserDbHandlerService>(UserDbHandlerService);
    accountDbHandler = module.get<AccountDbHandlerService>(
      AccountDbHandlerService,
    );
    authService = module.get<AuthService>(AuthService);
  });
  describe('existence & injection tests', () => {
    test('service to be defined', () => expect(service).toBeDefined());
    test('UserDbHandlerService to be injected into service.userDbHandler', () =>
      expect(userDbHandler).toBeDefined());
    test('AccountDbHandler to be injected into service.accountDbHandler', () =>
      expect(accountDbHandler).toBeDefined());
    test('AuthService to be injected into service.authService', () =>
      expect(authService).toBeDefined());
  });
  describe('login', () => {
    it('calls userDbhandler.getOneByEmail with the correct arguments', async () => {
      const mockArguments: ILogin = {
        username: 'MOCK USERNAME (EMAIL)',
        password: 'MOCK PASSWORD',
      };
      const mockUser: IUserModelWithId = {
        id: 'MOCK USER ID',
        accountId: 'MOCK ACCOUNT ID',
        firstName: 'MOCK FIRST NAME',
        lastName: 'MOCK LAST NAME',
        email: mockArguments.username,
        hashedPassword: 'MOCK HASHED PASSWORD',
        salt: 'MOCK SALT',
      };
      const mockAccount: IAccountModelWithId = {
        id: mockUser.accountId,
        ref: 'ADMIN',
        name: 'MOCK ACCOUNT',
        contactEmail: 'MOCK CONTACT EMAIL',
        isActive: true,
      };

      jest.spyOn(userDbHandler, 'getOneByEmail').mockResolvedValue(mockUser);
      jest.spyOn(accountDbHandler, 'getAccount').mockResolvedValue(mockAccount);
      jest.spyOn(authService, 'hashedValueGate').mockResolvedValue(undefined);
      await service.login(mockArguments);
      expect(userDbHandler.getOneByEmail).toHaveBeenCalledWith(
        mockArguments.username,
      );
    });
    it('calls accountDbHandler.getAccount with the correct arguments', async () => {
      const mockArguments: ILogin = {
        username: 'MOCK USERNAME (EMAIL)',
        password: 'MOCK PASSWORD',
      };
      const mockUser: IUserModelWithId = {
        id: 'MOCK USER ID',
        accountId: 'MOCK ACCOUNT ID',
        firstName: 'MOCK FIRST NAME',
        lastName: 'MOCK LAST NAME',
        email: mockArguments.username,
        hashedPassword: 'MOCK HASHED PASSWORD',
        salt: 'MOCK SALT',
      };
      const mockAccount: IAccountModelWithId = {
        id: mockUser.accountId,
        ref: 'ADMIN',
        name: 'MOCK ACCOUNT',
        contactEmail: 'MOCK CONTACT EMAIL',
        isActive: true,
      };

      jest.spyOn(userDbHandler, 'getOneByEmail').mockResolvedValue(mockUser);
      jest.spyOn(accountDbHandler, 'getAccount').mockResolvedValue(mockAccount);
      jest.spyOn(authService, 'hashedValueGate').mockResolvedValue(undefined);
      await service.login(mockArguments);
      expect(accountDbHandler.getAccount).toHaveBeenCalledWith(
        mockUser.accountId,
      );
    });
    it('throws UnprocessableEntityException if accountDbhandler.getAccount returns null', async () => {
      const mockArguments: ILogin = {
        username: 'MOCK USERNAME (EMAIL)',
        password: 'MOCK PASSWORD',
      };
      const mockUser: IUserModelWithId = {
        id: 'MOCK USER ID',
        accountId: 'MOCK ACCOUNT ID',
        firstName: 'MOCK FIRST NAME',
        lastName: 'MOCK LAST NAME',
        email: mockArguments.username,
        hashedPassword: 'MOCK HASHED PASSWORD',
        salt: 'MOCK SALT',
      };
      const mockAccount = null;

      jest.spyOn(userDbHandler, 'getOneByEmail').mockResolvedValue(mockUser);
      jest.spyOn(accountDbHandler, 'getAccount').mockResolvedValue(mockAccount);
      jest.spyOn(authService, 'hashedValueGate').mockResolvedValue(undefined);
      await expect(service.login(mockArguments)).rejects.toThrow(
        new UnprocessableEntityException('Could not find account'),
      );
    });
    it('throws BadRequestException if userDbHandler.getOneByEmail returns a record without hashedPassword', async () => {
      const mockArguments: ILogin = {
        username: 'MOCK USERNAME (EMAIL)',
        password: 'MOCK PASSWORD',
      };
      const mockUser: Omit<IUserModelWithId, 'hashedPassword'> = {
        id: 'MOCK USER ID',
        accountId: 'MOCK ACCOUNT ID',
        firstName: 'MOCK FIRST NAME',
        lastName: 'MOCK LAST NAME',
        email: mockArguments.username,
        salt: 'MOCK SALT',
      };
      const mockAccount: IAccountModelWithId = {
        id: mockUser.accountId,
        ref: 'ADMIN',
        name: 'MOCK ACCOUNT',
        contactEmail: 'MOCK CONTACT EMAIL',
        isActive: true,
      };

      jest
        .spyOn(userDbHandler, 'getOneByEmail')
        .mockResolvedValue(mockUser as IUserModelWithId);
      jest.spyOn(accountDbHandler, 'getAccount').mockResolvedValue(mockAccount);
      jest.spyOn(authService, 'hashedValueGate').mockResolvedValue(undefined);
      await expect(service.login(mockArguments)).rejects.toThrow(
        new BadRequestException('No match'),
      );
    });
    it('calls authService.hashedValueGate with the correct arguments and then returns tokens object if hashedValueGate does not error', async () => {
      const mockArguments: ILogin = {
        username: 'MOCK USERNAME (EMAIL)',
        password: 'MOCK PASSWORD',
      };
      const mockUser: IUserModelWithId = {
        id: 'MOCK USER ID',
        accountId: 'MOCK ACCOUNT ID',
        firstName: 'MOCK FIRST NAME',
        lastName: 'MOCK LAST NAME',
        email: mockArguments.username,
        hashedPassword: 'MOCK HASHED PASSWORD',
        salt: 'MOCK SALT',
      };
      const mockAccount: IAccountModelWithId = {
        id: mockUser.accountId,
        ref: 'ADMIN',
        name: 'MOCK ACCOUNT',
        contactEmail: 'MOCK CONTACT EMAIL',
        isActive: true,
      };

      jest.spyOn(userDbHandler, 'getOneByEmail').mockResolvedValue(mockUser);
      jest.spyOn(accountDbHandler, 'getAccount').mockResolvedValue(mockAccount);
      jest.spyOn(authService, 'hashedValueGate').mockResolvedValue(undefined);

      const result = await service.login(mockArguments);
      expect(authService.hashedValueGate).toHaveBeenCalledWith({
        hashedValue: mockUser.hashedPassword,
        valueToHash: mockArguments.password,
        salt: mockUser.salt,
      });

      /**
       * Testing shape of return because getAuthTokens is private
       */
      expect(result).toBeInstanceOf(Object);
      expect(Object.keys(result)).toEqual(['at', 'rt']);
    });
    it("propagates ForbiddenException from authService.hashedValueGate if incoming password and stored password hashes don't match", async () => {
      const mockArguments: ILogin = {
        username: 'MOCK USERNAME (EMAIL)',
        password: 'MOCK PASSWORD',
      };
      const mockUser: IUserModelWithId = {
        id: 'MOCK USER ID',
        accountId: 'MOCK ACCOUNT ID',
        firstName: 'MOCK FIRST NAME',
        lastName: 'MOCK LAST NAME',
        email: mockArguments.username,
        hashedPassword: 'MOCK HASHED PASSWORD',
        salt: 'MOCK SALT',
      };
      const mockAccount: IAccountModelWithId = {
        id: mockUser.accountId,
        ref: 'ADMIN',
        name: 'MOCK ACCOUNT',
        contactEmail: 'MOCK CONTACT EMAIL',
        isActive: true,
      };

      jest.spyOn(userDbHandler, 'getOneByEmail').mockResolvedValue(mockUser);
      jest.spyOn(accountDbHandler, 'getAccount').mockResolvedValue(mockAccount);

      const nonMatchingPasswords = new ForbiddenException();
      jest
        .spyOn(authService, 'hashedValueGate')
        .mockRejectedValue(nonMatchingPasswords);
      await expect(service.login(mockArguments)).rejects.toThrow(
        nonMatchingPasswords,
      );
    });
  });
  describe('refreshAuth', () => {
    it('calls userDbHandler.getOne with the correct arguments', async () => {
      const mockArguments = {
        userId: 'MOCK USER ID',
        rt: 'MOCK REFRESH TOKEN',
      };
      const mockUser: IUserModelWithId = {
        id: mockArguments.userId,
        accountId: 'MOCK ACCOUNT ID',
        firstName: 'MOCK FIRST NAME',
        lastName: 'MOCK LAST NAME',
        email: 'MOCK USER EMAIL',
        hashedPassword: 'MOCK HASHED PASSWORD',
        salt: 'MOCK SALT',
        hashedRt: 'MOCK HASHED REFRESH TOKEN',
      };
      const mockAccount: IAccountModelWithId = {
        id: mockUser.accountId,
        ref: 'ADMIN',
        name: 'MOCK ACCOUNT',
        contactEmail: 'MOCK CONTACT EMAIL',
        isActive: true,
      };
      jest.spyOn(userDbHandler, 'getOne').mockResolvedValue(mockUser);
      jest.spyOn(accountDbHandler, 'getAccount').mockResolvedValue(mockAccount);
      jest.spyOn(authService, 'hashedValueGate').mockResolvedValue(undefined);

      await service.refreshAuth(mockArguments);
      expect(userDbHandler.getOne).toHaveBeenCalledWith(mockArguments.userId);
    });
    it('throw ForbiddenException if userdbHandler.getOne returns user without hashedRt', async () => {
      const mockArguments = {
        userId: 'MOCK USER ID',
        rt: 'MOCK REFRESH TOKEN',
      };
      const mockUser: IUserModelWithId = {
        id: mockArguments.userId,
        accountId: 'MOCK ACCOUNT ID',
        firstName: 'MOCK FIRST NAME',
        lastName: 'MOCK LAST NAME',
        email: 'MOCK USER EMAIL',
        hashedPassword: 'MOCK HASHED PASSWORD',
        salt: 'MOCK SALT',
      };
      const mockAccount: IAccountModelWithId = {
        id: mockUser.accountId,
        ref: 'ADMIN',
        name: 'MOCK ACCOUNT',
        contactEmail: 'MOCK CONTACT EMAIL',
        isActive: true,
      };
      jest.spyOn(userDbHandler, 'getOne').mockResolvedValue(mockUser);
      jest.spyOn(accountDbHandler, 'getAccount').mockResolvedValue(mockAccount);
      jest.spyOn(authService, 'hashedValueGate').mockResolvedValue(undefined);

      const expectedError = new ForbiddenException({ reason: 'NO_RT' });
      await expect(service.refreshAuth(mockArguments)).rejects.toThrow(
        expectedError,
      );
    });
    it('calls authService.hashedValueGate with the correct arguments', async () => {
      const mockArguments = {
        userId: 'MOCK USER ID',
        rt: 'MOCK REFRESH TOKEN',
      };
      const mockUser: IUserModelWithId = {
        id: mockArguments.userId,
        accountId: 'MOCK ACCOUNT ID',
        firstName: 'MOCK FIRST NAME',
        lastName: 'MOCK LAST NAME',
        email: 'MOCK USER EMAIL',
        hashedPassword: 'MOCK HASHED PASSWORD',
        salt: 'MOCK SALT',
        hashedRt: 'MOCK HASHED REFRESH TOKEN',
      };
      const mockAccount: IAccountModelWithId = {
        id: mockUser.accountId,
        ref: 'ADMIN',
        name: 'MOCK ACCOUNT',
        contactEmail: 'MOCK CONTACT EMAIL',
        isActive: true,
      };
      jest.spyOn(userDbHandler, 'getOne').mockResolvedValue(mockUser);
      jest.spyOn(accountDbHandler, 'getAccount').mockResolvedValue(mockAccount);
      jest.spyOn(authService, 'hashedValueGate').mockResolvedValue(undefined);
      await service.refreshAuth(mockArguments);
      expect(authService.hashedValueGate).toHaveBeenCalledWith({
        hashedValue: mockUser.hashedRt,
        valueToHash: mockArguments.rt,
        salt: mockUser.salt,
      });
    });
    it("propagates ForbiddenException from authService.hashedValueGate if hashed incoming rt doesn't match stored hashed rt", async () => {
      const mockArguments = {
        userId: 'MOCK USER ID',
        rt: 'MOCK REFRESH TOKEN',
      };
      const mockUser: IUserModelWithId = {
        id: mockArguments.userId,
        accountId: 'MOCK ACCOUNT ID',
        firstName: 'MOCK FIRST NAME',
        lastName: 'MOCK LAST NAME',
        email: 'MOCK USER EMAIL',
        hashedPassword: 'MOCK HASHED PASSWORD',
        salt: 'MOCK SALT',
        hashedRt: 'MOCK HASHED REFRESH TOKEN',
      };

      const expectedError = new ForbiddenException();

      jest.spyOn(userDbHandler, 'getOne').mockResolvedValue(mockUser);
      jest
        .spyOn(authService, 'hashedValueGate')
        .mockRejectedValue(expectedError);
      await expect(service.refreshAuth(mockArguments)).rejects.toThrow(
        expectedError,
      );
    });
    it('calls accountDbHandler.getAccount with the correct arguments', async () => {
      const mockArguments = {
        userId: 'MOCK USER ID',
        rt: 'MOCK REFRESH TOKEN',
      };
      const mockUser: IUserModelWithId = {
        id: mockArguments.userId,
        accountId: 'MOCK ACCOUNT ID',
        firstName: 'MOCK FIRST NAME',
        lastName: 'MOCK LAST NAME',
        email: 'MOCK USER EMAIL',
        hashedPassword: 'MOCK HASHED PASSWORD',
        salt: 'MOCK SALT',
        hashedRt: 'MOCK HASHED REFRESH TOKEN',
      };
      const mockAccount: IAccountModelWithId = {
        id: mockUser.accountId,
        ref: 'ADMIN',
        name: 'MOCK ACCOUNT',
        contactEmail: 'MOCK CONTACT EMAIL',
        isActive: true,
      };
      jest.spyOn(userDbHandler, 'getOne').mockResolvedValue(mockUser);
      jest.spyOn(accountDbHandler, 'getAccount').mockResolvedValue(mockAccount);
      jest.spyOn(authService, 'hashedValueGate').mockResolvedValue(undefined);

      await service.refreshAuth(mockArguments);
      expect(accountDbHandler.getAccount).toHaveBeenCalledWith(
        mockUser.accountId,
      );
    });
    it('throws UnprocessableEntityException if accountDbhandler.getAccount returns null', async () => {
      const mockArguments = {
        userId: 'MOCK USER ID',
        rt: 'MOCK REFRESH TOKEN',
      };
      const mockUser: IUserModelWithId = {
        id: mockArguments.userId,
        accountId: 'MOCK ACCOUNT ID',
        firstName: 'MOCK FIRST NAME',
        lastName: 'MOCK LAST NAME',
        email: 'MOCK USER EMAIL',
        hashedPassword: 'MOCK HASHED PASSWORD',
        salt: 'MOCK SALT',
        hashedRt: 'MOCK HASHED REFRESH TOKEN',
      };
      const mockAccount = null;
      jest.spyOn(userDbHandler, 'getOne').mockResolvedValue(mockUser);
      jest.spyOn(accountDbHandler, 'getAccount').mockResolvedValue(mockAccount);
      jest.spyOn(authService, 'hashedValueGate').mockResolvedValue(undefined);

      const expectedError = new UnprocessableEntityException(
        'Account not found for user',
      );
      await expect(service.refreshAuth(mockArguments)).rejects.toThrow(
        expectedError,
      );
    });
    it('returns an object with at and rt properties on success', async () => {
      const mockArguments = {
        userId: 'MOCK USER ID',
        rt: 'MOCK REFRESH TOKEN',
      };
      const mockUser: IUserModelWithId = {
        id: mockArguments.userId,
        accountId: 'MOCK ACCOUNT ID',
        firstName: 'MOCK FIRST NAME',
        lastName: 'MOCK LAST NAME',
        email: 'MOCK USER EMAIL',
        hashedPassword: 'MOCK HASHED PASSWORD',
        salt: 'MOCK SALT',
        hashedRt: 'MOCK HASHED REFRESH TOKEN',
      };
      const mockAccount: IAccountModelWithId = {
        id: mockUser.accountId,
        ref: 'ADMIN',
        name: 'MOCK ACCOUNT',
        contactEmail: 'MOCK CONTACT EMAIL',
        isActive: true,
      };
      jest.spyOn(userDbHandler, 'getOne').mockResolvedValue(mockUser);
      jest.spyOn(accountDbHandler, 'getAccount').mockResolvedValue(mockAccount);
      jest.spyOn(authService, 'hashedValueGate').mockResolvedValue(undefined);

      const result = await service.refreshAuth(mockArguments);

      /**
       * Testing shape of return because getAuthTokens is private
       */
      expect(result).toBeInstanceOf(Object);
      expect(Object.keys(result)).toEqual(['at', 'rt']);
    });
  });

  /**
   * TODO
   */
  describe('resetPassword', () => {
    /**
     * @TODO
     */
    it('calls authService.verifyAcctToken with the correct arguments', async () => {
      const mockArguments: IResetPassword = {
        token: 'MOCK TOKEN',
        newPassword: 'MOCK PASSWORD',
      };

      const mockVerifyAcctTokenResolvedValue = {
        userId: 'MOCK USER ID',
        password: 'MOCK PASSWORD',
      };

      const mockUser: IUserModelWithId = {
        id: mockVerifyAcctTokenResolvedValue.userId,
        accountId: 'MOCK ACCOUNT ID',
        firstName: 'MOCK FIRST NAME',
        lastName: 'MOCK LAST NAME',
        email: 'MOCK USER EMAIL',
        hashedPassword: 'MOCK HASHED PASSWORD',
        salt: 'MOCK SALT',
        hashedRt: 'MOCK HASHED REFRESH TOKEN',
      };

      const mockHashValueResolvedValue = 'MOCK NEW HASHED PASSWORD';

      jest
        .spyOn(authService, 'verifyAcctToken')
        .mockResolvedValue(mockVerifyAcctTokenResolvedValue);
      jest.spyOn(userDbHandler, 'getOne').mockResolvedValue(mockUser);
      jest.spyOn(authService, 'hashedValueGate').mockResolvedValue(undefined);
      jest
        .spyOn(authService, 'hashValue')
        .mockResolvedValue(mockHashValueResolvedValue);
      jest.spyOn(userDbHandler, 'updateOne').mockResolvedValue(undefined);

      await service.resetPassword(mockArguments);
      expect(authService.verifyAcctToken).toHaveBeenCalledWith(
        mockArguments.token,
      );
    });
    it('propagates any error thrown by authService.verifyAcctToken', async () => {
      const mockArguments: IResetPassword = {
        token: 'MOCK TOKEN',
        newPassword: 'MOCK PASSWORD',
      };

      const mockError = new Error('ERROR UNDER TEST');
      jest.spyOn(authService, 'verifyAcctToken').mockRejectedValue(mockError);
      await expect(service.resetPassword(mockArguments)).rejects.toThrow(
        mockError,
      );
    });
    it('calls userDbHandler.getOne with the correct arguments', async () => {
      const mockArguments: IResetPassword = {
        token: 'MOCK TOKEN',
        newPassword: 'MOCK PASSWORD',
      };

      const mockVerifyAcctTokenResolvedValue = {
        userId: 'MOCK USER ID',
        password: 'MOCK PASSWORD',
      };

      const mockUser: IUserModelWithId = {
        id: mockVerifyAcctTokenResolvedValue.userId,
        accountId: 'MOCK ACCOUNT ID',
        firstName: 'MOCK FIRST NAME',
        lastName: 'MOCK LAST NAME',
        email: 'MOCK USER EMAIL',
        hashedPassword: 'MOCK HASHED PASSWORD',
        salt: 'MOCK SALT',
        hashedRt: 'MOCK HASHED REFRESH TOKEN',
      };

      const mockHashValueResolvedValue = 'MOCK NEW HASHED PASSWORD';

      jest
        .spyOn(authService, 'verifyAcctToken')
        .mockResolvedValue(mockVerifyAcctTokenResolvedValue);
      jest.spyOn(userDbHandler, 'getOne').mockResolvedValue(mockUser);
      jest.spyOn(authService, 'hashedValueGate').mockResolvedValue(undefined);
      jest
        .spyOn(authService, 'hashValue')
        .mockResolvedValue(mockHashValueResolvedValue);
      jest.spyOn(userDbHandler, 'updateOne').mockResolvedValue(undefined);
      await service.resetPassword(mockArguments);
      expect(userDbHandler.getOne).toHaveBeenCalledWith(
        mockVerifyAcctTokenResolvedValue.userId,
      );
    });
    it('propagates any error thrown by userDbHandler.getOne', async () => {
      const mockArguments: IResetPassword = {
        token: 'MOCK TOKEN',
        newPassword: 'MOCK PASSWORD',
      };

      const mockVerifyAcctTokenResolvedValue = {
        userId: 'MOCK USER ID',
        password: 'MOCK PASSWORD',
      };

      const mockError = new Error('ERROR UNDER TEST');

      jest
        .spyOn(authService, 'verifyAcctToken')
        .mockResolvedValue(mockVerifyAcctTokenResolvedValue);
      jest.spyOn(userDbHandler, 'getOne').mockRejectedValue(mockError);

      await expect(service.resetPassword(mockArguments)).rejects.toThrow(
        mockError,
      );
    });
    it('calls authService.hashedValueGate with the correct arguments', async () => {
      const mockArguments: IResetPassword = {
        token: 'MOCK TOKEN',
        newPassword: 'MOCK PASSWORD',
      };

      const mockVerifyAcctTokenResolvedValue = {
        userId: 'MOCK USER ID',
        password: 'MOCK PASSWORD',
      };

      const mockUser: IUserModelWithId = {
        id: mockVerifyAcctTokenResolvedValue.userId,
        accountId: 'MOCK ACCOUNT ID',
        firstName: 'MOCK FIRST NAME',
        lastName: 'MOCK LAST NAME',
        email: 'MOCK USER EMAIL',
        hashedPassword: 'MOCK HASHED PASSWORD',
        salt: 'MOCK SALT',
        hashedRt: 'MOCK HASHED REFRESH TOKEN',
      };

      const mockHashValueResolvedValue = 'MOCK NEW HASHED PASSWORD';

      jest
        .spyOn(authService, 'verifyAcctToken')
        .mockResolvedValue(mockVerifyAcctTokenResolvedValue);
      jest.spyOn(userDbHandler, 'getOne').mockResolvedValue(mockUser);
      jest.spyOn(authService, 'hashedValueGate').mockResolvedValue(undefined);
      jest
        .spyOn(authService, 'hashValue')
        .mockResolvedValue(mockHashValueResolvedValue);
      jest.spyOn(userDbHandler, 'updateOne').mockResolvedValue(undefined);

      await service.resetPassword(mockArguments);
      expect(authService.hashedValueGate).toHaveBeenCalledWith({
        hashedValue: mockUser.hashedPassword,
        valueToHash: mockVerifyAcctTokenResolvedValue.password,
        salt: mockUser.salt,
      });
    });
    it('propagates any error thrown by authService.hashedValueGate', async () => {
      const mockArguments: IResetPassword = {
        token: 'MOCK TOKEN',
        newPassword: 'MOCK PASSWORD',
      };

      const mockVerifyAcctTokenResolvedValue = {
        userId: 'MOCK USER ID',
        password: 'MOCK PASSWORD',
      };

      const mockUser: IUserModelWithId = {
        id: mockVerifyAcctTokenResolvedValue.userId,
        accountId: 'MOCK ACCOUNT ID',
        firstName: 'MOCK FIRST NAME',
        lastName: 'MOCK LAST NAME',
        email: 'MOCK USER EMAIL',
        hashedPassword: 'MOCK HASHED PASSWORD',
        salt: 'MOCK SALT',
        hashedRt: 'MOCK HASHED REFRESH TOKEN',
      };

      const mockError = new Error('ERROR UNDER TEST');

      jest
        .spyOn(authService, 'verifyAcctToken')
        .mockResolvedValue(mockVerifyAcctTokenResolvedValue);
      jest.spyOn(userDbHandler, 'getOne').mockResolvedValue(mockUser);
      jest.spyOn(authService, 'hashedValueGate').mockRejectedValue(mockError);

      await expect(service.resetPassword(mockArguments)).rejects.toThrow(
        mockError,
      );
    });
    it('calls authService.hashValue with the correct arguments', async () => {
      const mockArguments: IResetPassword = {
        token: 'MOCK TOKEN',
        newPassword: 'MOCK PASSWORD',
      };

      const mockVerifyAcctTokenResolvedValue = {
        userId: 'MOCK USER ID',
        password: 'MOCK PASSWORD',
      };

      const mockUser: IUserModelWithId = {
        id: mockVerifyAcctTokenResolvedValue.userId,
        accountId: 'MOCK ACCOUNT ID',
        firstName: 'MOCK FIRST NAME',
        lastName: 'MOCK LAST NAME',
        email: 'MOCK USER EMAIL',
        hashedPassword: 'MOCK HASHED PASSWORD',
        salt: 'MOCK SALT',
        hashedRt: 'MOCK HASHED REFRESH TOKEN',
      };

      const mockHashValueResolvedValue = 'MOCK NEW HASHED PASSWORD';

      jest
        .spyOn(authService, 'verifyAcctToken')
        .mockResolvedValue(mockVerifyAcctTokenResolvedValue);
      jest.spyOn(userDbHandler, 'getOne').mockResolvedValue(mockUser);
      jest.spyOn(authService, 'hashedValueGate').mockResolvedValue(undefined);
      jest
        .spyOn(authService, 'hashValue')
        .mockResolvedValue(mockHashValueResolvedValue);
      jest.spyOn(userDbHandler, 'updateOne').mockResolvedValue(undefined);

      await service.resetPassword(mockArguments);
      expect(authService.hashValue).toHaveBeenCalledWith({
        value: mockArguments.newPassword,
        salt: mockUser.salt,
      });
    });
    it('propagates any error thrown by authService.hashValue', async () => {
      const mockArguments: IResetPassword = {
        token: 'MOCK TOKEN',
        newPassword: 'MOCK PASSWORD',
      };

      const mockVerifyAcctTokenResolvedValue = {
        userId: 'MOCK USER ID',
        password: 'MOCK PASSWORD',
      };

      const mockUser: IUserModelWithId = {
        id: mockVerifyAcctTokenResolvedValue.userId,
        accountId: 'MOCK ACCOUNT ID',
        firstName: 'MOCK FIRST NAME',
        lastName: 'MOCK LAST NAME',
        email: 'MOCK USER EMAIL',
        hashedPassword: 'MOCK HASHED PASSWORD',
        salt: 'MOCK SALT',
        hashedRt: 'MOCK HASHED REFRESH TOKEN',
      };

      const mockError = new Error('ERROR UNDER TEST');

      jest
        .spyOn(authService, 'verifyAcctToken')
        .mockResolvedValue(mockVerifyAcctTokenResolvedValue);
      jest.spyOn(userDbHandler, 'getOne').mockResolvedValue(mockUser);
      jest.spyOn(authService, 'hashedValueGate').mockResolvedValue(undefined);
      jest.spyOn(authService, 'hashValue').mockRejectedValue(mockError);

      await expect(service.resetPassword(mockArguments)).rejects.toThrow(
        mockError,
      );
    });
    it('calls userDbHandler.updateOne with the correct arguments', async () => {
      const mockArguments: IResetPassword = {
        token: 'MOCK TOKEN',
        newPassword: 'MOCK PASSWORD',
      };

      const mockVerifyAcctTokenResolvedValue = {
        userId: 'MOCK USER ID',
        password: 'MOCK PASSWORD',
      };

      const mockUser: IUserModelWithId = {
        id: mockVerifyAcctTokenResolvedValue.userId,
        accountId: 'MOCK ACCOUNT ID',
        firstName: 'MOCK FIRST NAME',
        lastName: 'MOCK LAST NAME',
        email: 'MOCK USER EMAIL',
        hashedPassword: 'MOCK HASHED PASSWORD',
        salt: 'MOCK SALT',
        hashedRt: 'MOCK HASHED REFRESH TOKEN',
      };

      const mockHashValueResolvedValue = 'MOCK NEW HASHED PASSWORD';

      jest
        .spyOn(authService, 'verifyAcctToken')
        .mockResolvedValue(mockVerifyAcctTokenResolvedValue);
      jest.spyOn(userDbHandler, 'getOne').mockResolvedValue(mockUser);
      jest.spyOn(authService, 'hashedValueGate').mockResolvedValue(undefined);
      jest
        .spyOn(authService, 'hashValue')
        .mockResolvedValue(mockHashValueResolvedValue);
      jest.spyOn(userDbHandler, 'updateOne').mockResolvedValue(undefined);

      await service.resetPassword(mockArguments);
      expect(userDbHandler.updateOne).toHaveBeenCalledWith({
        userId: mockVerifyAcctTokenResolvedValue.userId,
        updates: {
          hashedPassword: mockHashValueResolvedValue,
        },
      });
    });
    it('propagates any error thrown by userDbHandler.updateOne', async () => {
      const mockArguments: IResetPassword = {
        token: 'MOCK TOKEN',
        newPassword: 'MOCK PASSWORD',
      };

      const mockVerifyAcctTokenResolvedValue = {
        userId: 'MOCK USER ID',
        password: 'MOCK PASSWORD',
      };

      const mockUser: IUserModelWithId = {
        id: mockVerifyAcctTokenResolvedValue.userId,
        accountId: 'MOCK ACCOUNT ID',
        firstName: 'MOCK FIRST NAME',
        lastName: 'MOCK LAST NAME',
        email: 'MOCK USER EMAIL',
        hashedPassword: 'MOCK HASHED PASSWORD',
        salt: 'MOCK SALT',
        hashedRt: 'MOCK HASHED REFRESH TOKEN',
      };

      const mockHashValueResolvedValue = 'MOCK NEW HASHED PASSWORD';

      jest
        .spyOn(authService, 'verifyAcctToken')
        .mockResolvedValue(mockVerifyAcctTokenResolvedValue);
      jest.spyOn(userDbHandler, 'getOne').mockResolvedValue(mockUser);
      jest.spyOn(authService, 'hashedValueGate').mockResolvedValue(undefined);
      jest
        .spyOn(authService, 'hashValue')
        .mockResolvedValue(mockHashValueResolvedValue);

      const mockError = new Error('ERROR UNDER TEST');
      jest.spyOn(userDbHandler, 'updateOne').mockRejectedValue(mockError);

      await expect(service.resetPassword(mockArguments)).rejects.toThrow(
        mockError,
      );
    });
    /**
     * TODO
     */
    it('has void return', async () => {
      const mockArguments: IResetPassword = {
        token: 'MOCK TOKEN',
        newPassword: 'MOCK PASSWORD',
      };

      const mockVerifyAcctTokenResolvedValue = {
        userId: 'MOCK USER ID',
        password: 'MOCK PASSWORD',
      };

      const mockUser: IUserModelWithId = {
        id: mockVerifyAcctTokenResolvedValue.userId,
        accountId: 'MOCK ACCOUNT ID',
        firstName: 'MOCK FIRST NAME',
        lastName: 'MOCK LAST NAME',
        email: 'MOCK USER EMAIL',
        hashedPassword: 'MOCK HASHED PASSWORD',
        salt: 'MOCK SALT',
        hashedRt: 'MOCK HASHED REFRESH TOKEN',
      };

      const mockHashValueResolvedValue = 'MOCK NEW HASHED PASSWORD';

      jest
        .spyOn(authService, 'verifyAcctToken')
        .mockResolvedValue(mockVerifyAcctTokenResolvedValue);
      jest.spyOn(userDbHandler, 'getOne').mockResolvedValue(mockUser);
      jest.spyOn(authService, 'hashedValueGate').mockResolvedValue(undefined);
      jest
        .spyOn(authService, 'hashValue')
        .mockResolvedValue(mockHashValueResolvedValue);
      jest.spyOn(userDbHandler, 'updateOne').mockResolvedValue(undefined);

      const result = await service.resetPassword(mockArguments);
      expect(result).toBeUndefined();
    });
  });
  afterEach(() => jest.restoreAllMocks());
});
