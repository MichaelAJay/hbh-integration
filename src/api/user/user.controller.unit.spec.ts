import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'src/internal-modules/auth/auth.service';
import { UserController } from './user.controller';
import { UserAPIService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserAPIService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserAPIService,
          useValue: {},
        },
        {
          provide: AuthService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserAPIService>(UserAPIService);
  });

  describe('existence and injection tests', () => {
    test('controller is defined', () => expect(controller).toBeDefined());
    test('UserService is injected into controller.userService', () =>
      expect(userService).toBeDefined());
  });
  describe('POST /login', () => {});
  describe('POST /refresh-auth', () => {});
  describe('PATCH /claim-account', () => {});
  afterEach(() => jest.restoreAllMocks());
});
