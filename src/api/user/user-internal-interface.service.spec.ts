import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from 'src/internal-modules/auth/auth.module';
import { InternalDatabaseModule } from 'src/internal-modules/external-interface-handlers/database/database.module';
import { UserInternalInterfaceService } from './user-internal-interface.service';

describe('UserInternalInterfaceService', () => {
  let service: UserInternalInterfaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [InternalDatabaseModule, AuthModule],
      providers: [UserInternalInterfaceService],
    }).compile();

    service = module.get<UserInternalInterfaceService>(
      UserInternalInterfaceService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
