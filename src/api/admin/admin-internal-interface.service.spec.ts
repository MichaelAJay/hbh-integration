import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AccountModule } from 'src/internal-modules/account/account.module';
import { AuthModule } from 'src/internal-modules/auth/auth.module';
import { CrmModule } from 'src/internal-modules/external-interface-handlers/crm/crm.module';
import { InternalDatabaseModule } from 'src/internal-modules/external-interface-handlers/database/database.module';
import { EzmanageApiHandlerModule } from 'src/internal-modules/external-interface-handlers/ezmanage-api/ezmanage-api-handler.module';
import { UserModule } from 'src/internal-modules/user/user.module';
import { AdminInternalInterfaceService } from './admin-internal-interface.service';

describe('AdminInternalInterfaceService', () => {
  let service: AdminInternalInterfaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        InternalDatabaseModule,
        AccountModule,
        AuthModule,
        UserModule,
        EzmanageApiHandlerModule,
        CrmModule,
      ],
      providers: [AdminInternalInterfaceService],
    }).compile();

    service = module.get<AdminInternalInterfaceService>(
      AdminInternalInterfaceService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
