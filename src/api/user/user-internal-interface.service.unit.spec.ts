import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'src/internal-modules/auth/auth.service';
import { AccountDbHandlerService } from 'src/internal-modules/external-interface-handlers/database/account-db-handler/account-db-handler.service';
import { UserDbHandlerService } from 'src/internal-modules/external-interface-handlers/database/user-db-handler/user-db-handler.service';
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
          useValue: {},
        },
        {
          provide: AccountDbHandlerService,
          useValue: {},
        },
        {
          provide: AuthService,
          useValue: {},
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
  describe('login', () => {});
  describe('refreshAuth', () => {});
  describe('resetPassword', () => {});
  afterEach(() => jest.restoreAllMocks());
});
