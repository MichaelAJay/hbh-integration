import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AdminAPIModule } from './admin.module';
import { AdminAPIService } from './admin.service';

describe('AdminService', () => {
  let service: AdminAPIService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), AdminAPIModule],
    }).compile();

    service = module.get<AdminAPIService>(AdminAPIService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
