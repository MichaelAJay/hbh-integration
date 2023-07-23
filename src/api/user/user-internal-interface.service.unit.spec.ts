import {
  BadRequestException,
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
import { ILogin } from './interfaces';
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
    it('calls authService.hashedValueGate and then returns tokens object if hashedValueGate does not error', async () => {
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
      expect(authService.hashedValueGate).toHaveBeenCalledWith({
        hashedValue: mockUser.hashedPassword,
        valueToHash: mockArguments.password,
        salt: mockUser.salt,
      });
    });

    /**
     * TODO
     */ it("propagates ForbiddenException from authService.hashedValueGate if incoming password and stored password hashes don't match", async () => {
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
  });
  /**
   * TODO
   */
  describe('refreshAuth', () => {});

  /**
   * TODO
   */ describe('resetPassword', () => {});
  afterEach(() => jest.restoreAllMocks());
});
