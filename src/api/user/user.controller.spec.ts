import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from 'src/internal-modules/auth/auth.module';
import { UserController } from './user.controller';
import { UserApiModule } from './user.module';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, UserApiModule],
      controllers: [UserController],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
