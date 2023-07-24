import { Test, TestingModule } from '@nestjs/testing';
import e from 'express';
import { AccountDbHandlerService } from '../external-interface-handlers/database/account-db-handler/account-db-handler.service';
import { CatererDbHandlerService } from '../external-interface-handlers/database/caterer-db-handler/caterer-db-handler.service';
import { AccountService } from './account.service';

describe('AccountService', () => {
  let service: AccountService;
  let accountDbService: AccountDbHandlerService;
  let catererDbService: CatererDbHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        { provide: AccountDbHandlerService, useValue: {} },
        { provide: CatererDbHandlerService, useValue: {} },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
    accountDbService = module.get<AccountDbHandlerService>(
      AccountDbHandlerService,
    );
    catererDbService = module.get<CatererDbHandlerService>(
      CatererDbHandlerService,
    );
  });

  describe('existence tests', () => {});
  describe('findAccountByCatererId', () => {});
  describe('getEnvironmentVariablePrefixByCatererId', () => {});

  afterEach(() => jest.resetAllMocks());
});
