import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  IAccountModelWithId,
  ICatererModelWithId,
} from 'src/external-modules/database/models';
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
        {
          provide: AccountDbHandlerService,
          useValue: {
            getAccount: jest.fn(),
          },
        },
        {
          provide: CatererDbHandlerService,
          useValue: { getCaterer: jest.fn() },
        },
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

  describe('existence tests', () => {
    test('service exists', () => expect(service).toBeDefined());
    test('accountDbService exists', () =>
      expect(accountDbService).toBeDefined());
    test('catererDbService', () => expect(catererDbService).toBeDefined());
  });
  describe('findAccountByCatererId', () => {
    it('calls catererDbService.getCaterer with the correct arguments', async () => {
      const mockCatererId = 'MOCK CATERER ID';
      const mockCaterer: ICatererModelWithId = {
        id: mockCatererId,
        accountId: 'MOCK ACCOUNT ID',
        name: 'MOCK CATERER NAME',
        storeNumber: 'MOCK STORE NUMBER',
      };
      const mockAccount: IAccountModelWithId = {
        id: mockCaterer.accountId,
        ref: 'ADMIN',
        name: 'MOCK ACCOUNT NAME',
        contactEmail: 'MOCK ACCOUNT CONTACT EMAIL',
        isActive: true,
      };
      jest.spyOn(catererDbService, 'getCaterer').mockResolvedValue(mockCaterer);
      jest.spyOn(accountDbService, 'getAccount').mockResolvedValue(mockAccount);
      await service.findAccountByCatererId(mockCatererId);
      expect(catererDbService.getCaterer).toHaveBeenCalledWith(mockCatererId);
    });
    it('propagates any error thrown by catererDbService.getCaterer', async () => {
      const mockCatererId = 'MOCK CATERER ID';
      const mockError = new Error('ERROR UNDER TEST');
      jest.spyOn(catererDbService, 'getCaterer').mockRejectedValue(mockError);
      await expect(
        service.findAccountByCatererId(mockCatererId),
      ).rejects.toThrow(mockError);
    });
    it('throws NotFoundException if catererDbService.getCaterer returns null', async () => {
      const mockCatererId = 'MOCK CATERER ID';
      const mockCaterer = null;
      jest.spyOn(catererDbService, 'getCaterer').mockResolvedValue(mockCaterer);
      await expect(
        service.findAccountByCatererId(mockCatererId),
      ).rejects.toThrow(
        new NotFoundException(`Caterer not found with id ${mockCatererId}`),
      );
    });
    it('calls accountDbService.getAccount with the correct arguments', async () => {
      const mockCatererId = 'MOCK CATERER ID';
      const mockCaterer: ICatererModelWithId = {
        id: mockCatererId,
        accountId: 'MOCK ACCOUNT ID',
        name: 'MOCK CATERER NAME',
        storeNumber: 'MOCK STORE NUMBER',
      };
      const mockAccount: IAccountModelWithId = {
        id: mockCaterer.accountId,
        ref: 'ADMIN',
        name: 'MOCK ACCOUNT NAME',
        contactEmail: 'MOCK ACCOUNT CONTACT EMAIL',
        isActive: true,
      };
      jest.spyOn(catererDbService, 'getCaterer').mockResolvedValue(mockCaterer);
      jest.spyOn(accountDbService, 'getAccount').mockResolvedValue(mockAccount);
      await service.findAccountByCatererId(mockCatererId);
      expect(accountDbService.getAccount).toHaveBeenCalledWith(
        mockCaterer.accountId,
      );
    });
    it('propagates any error thrown by accountDbService.getAccount', async () => {
      const mockCatererId = 'MOCK CATERER ID';
      const mockCaterer: ICatererModelWithId = {
        id: mockCatererId,
        accountId: 'MOCK ACCOUNT ID',
        name: 'MOCK CATERER NAME',
        storeNumber: 'MOCK STORE NUMBER',
      };
      const mockError = new Error('ERROR UNDER TEST');
      jest.spyOn(catererDbService, 'getCaterer').mockResolvedValue(mockCaterer);
      jest.spyOn(accountDbService, 'getAccount').mockRejectedValue(mockError);
      await expect(
        service.findAccountByCatererId(mockCatererId),
      ).rejects.toThrow(mockError);
    });
    it('throws NotFoundException if accountDbService.getAccount returns null', async () => {
      const mockCatererId = 'MOCK CATERER ID';
      const mockCaterer: ICatererModelWithId = {
        id: mockCatererId,
        accountId: 'MOCK ACCOUNT ID',
        name: 'MOCK CATERER NAME',
        storeNumber: 'MOCK STORE NUMBER',
      };
      const mockAccount = null;
      jest.spyOn(catererDbService, 'getCaterer').mockResolvedValue(mockCaterer);
      jest.spyOn(accountDbService, 'getAccount').mockResolvedValue(mockAccount);
      await expect(
        service.findAccountByCatererId(mockCatererId),
      ).rejects.toThrow(
        new NotFoundException(
          `Caterer with id ${mockCatererId} found, but associated account not found`,
        ),
      );
    });
    /**
     * todo
     */
    it('returns object with caterer and account on success', async () => {
      const mockCatererId = 'MOCK CATERER ID';
      const mockCaterer: ICatererModelWithId = {
        id: mockCatererId,
        accountId: 'MOCK ACCOUNT ID',
        name: 'MOCK CATERER NAME',
        storeNumber: 'MOCK STORE NUMBER',
      };
      const mockAccount: IAccountModelWithId = {
        id: mockCaterer.accountId,
        ref: 'ADMIN',
        name: 'MOCK ACCOUNT NAME',
        contactEmail: 'MOCK ACCOUNT CONTACT EMAIL',
        isActive: true,
      };
      jest.spyOn(catererDbService, 'getCaterer').mockResolvedValue(mockCaterer);
      jest.spyOn(accountDbService, 'getAccount').mockResolvedValue(mockAccount);
      const result = await service.findAccountByCatererId(mockCatererId);
      expect(result).toBeInstanceOf(Object);
      expect(Object.keys(result)).toEqual(['caterer', 'account']);
      expect(result.account).toEqual(mockAccount);
      expect(result.caterer).toEqual(mockCaterer);
    });
  });
  describe('getEnvironmentVariablePrefixByCatererId', () => {
    it('calls accountService(service).findAccountByCatererId with the correct arguments', async () => {
      const mockCatererId = 'MOCK CATERER ID';
      const mockCaterer: ICatererModelWithId = {
        id: mockCatererId,
        accountId: 'MOCK ACCOUNT ID',
        name: 'MOCK CATERER NAME',
        storeNumber: 'MOCK STORE NUMBER',
      };
      const mockAccount: IAccountModelWithId = {
        id: mockCaterer.accountId,
        ref: 'ADMIN',
        name: 'MOCK ACCOUNT NAME',
        contactEmail: 'MOCK ACCOUNT CONTACT EMAIL',
        isActive: true,
      };
      const mockAccountAndCatererObject = {
        caterer: mockCaterer,
        account: mockAccount,
      };
      jest
        .spyOn(service, 'findAccountByCatererId')
        .mockResolvedValue(mockAccountAndCatererObject);

      await service.getEnvironmentVariablePrefixByCatererId(mockCatererId);
      expect(service.findAccountByCatererId).toHaveBeenCalledWith(
        mockCatererId,
      );
    });
    it('propagates any error thrown by accountService(service).findAccountByCatererId', async () => {
      const mockCatererId = 'MOCK CATERER ID';
      const mockError = new Error('ERROR UNDER TESTE');
      jest
        .spyOn(service, 'findAccountByCatererId')
        .mockRejectedValue(mockError);

      await expect(
        service.getEnvironmentVariablePrefixByCatererId(mockCatererId),
      ).rejects.toThrow(mockError);
    });
    it('returns account ref (ACCOUNT_REF) on success', async () => {
      const mockCatererId = 'MOCK CATERER ID';
      const mockCaterer: ICatererModelWithId = {
        id: mockCatererId,
        accountId: 'MOCK ACCOUNT ID',
        name: 'MOCK CATERER NAME',
        storeNumber: 'MOCK STORE NUMBER',
      };
      const mockAccount: IAccountModelWithId = {
        id: mockCaterer.accountId,
        ref: 'ADMIN',
        name: 'MOCK ACCOUNT NAME',
        contactEmail: 'MOCK ACCOUNT CONTACT EMAIL',
        isActive: true,
      };
      const mockAccountAndCatererObject = {
        caterer: mockCaterer,
        account: mockAccount,
      };
      jest
        .spyOn(service, 'findAccountByCatererId')
        .mockResolvedValue(mockAccountAndCatererObject);

      const result = await service.getEnvironmentVariablePrefixByCatererId(
        mockCatererId,
      );
      expect(result).toEqual(mockAccountAndCatererObject.account.ref);
    });
  });

  afterEach(() => jest.resetAllMocks());
});
