import { Test, TestingModule } from '@nestjs/testing';
import { UserInternalInterfaceService } from './user-internal-interface.service';
import { UserApiModule } from './user.module';
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
          useValue: {},
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
  describe('login', () => {});
  describe('refreshAuth', () => {});
  describe('claimAccount', () => {});
  afterEach(() => jest.restoreAllMocks());
});
