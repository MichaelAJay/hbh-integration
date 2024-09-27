import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from 'src/internal-modules/auth/auth.module';
import { AdminController } from './admin.controller';
import { AdminAPIModule } from './admin.module';

describe('AdminController', () => {
  let controller: AdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), AuthModule, AdminAPIModule],
      controllers: [AdminController],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
