import { Test, TestingModule } from '@nestjs/testing';
import { CrmError } from 'src/common/classes';
import { IEzManageOrder } from 'src/external-modules/ezmanage-api/interfaces/gql/responses';
import { AccountRecordWithId } from '../database/account-db-handler/types';
import { CrmHandlerService } from './crm-handler.service';
import { NutshellApiHandlerService } from './nutshell-api-handler.service';
import { GeneratePrimaryNutshellEntityReturn } from './types/returns';

describe('CrmHandlerService', () => {
  let service: CrmHandlerService;
  let nutshellApiHandler: NutshellApiHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrmHandlerService,
        {
          provide: NutshellApiHandlerService,
          useValue: {
            generatePrimaryEntity: jest.fn(),
            updatePrimaryEntityWithOrder: jest.fn(),
            getProducts: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CrmHandlerService>(CrmHandlerService);
    nutshellApiHandler = module.get<NutshellApiHandlerService>(
      NutshellApiHandlerService,
    );
  });

  /**
   * complete
   */
  describe('existence & dependency injection tests', () => {
    test('service exists', () => expect(service).toBeDefined());
    test('nutshell api handler is injected into service', () =>
      expect(service.nutshellApiHandler).toBeDefined());
  });
  /**
   * complete
   */
  describe('generateCRMEntity', () => {
    describe('switch case "NUTSHELL"', () => {
      it('calls nutshellApiHandler with the correct arguments', async () => {});
      it('propagates any error thrown by nutshellApiHandler.generatePrimaryEntity', async () => {});
      it('returns the result of nutshellApiHandler.generatePrimaryEntity on success', async () => {});
    });
    describe('switch case default', () => {
      it('throws CrmError', async () => {});
    });
  });
  /**
   * complete
   */
  describe('updateCRMEntityWithOrder', () => {
    describe('switch case "NUTSHELL"', () => {
      it('calls nutshellApihandler.updatePrimaryEntityWithOrder with the correct arguments', async () => {});
      it('propagates any error thrown by nutshellApiHandler.updatePrimaryEntityWithOrder', async () => {});
      it('returns an object with { crmDescription: string } on success', async () => {});
    });
    describe('switch case default', () => {
      it('throws CrmError', async () => {});
    });
  });
  /**
   * todo
   */
  describe('getProducts', () => {
    describe('switch case "NUTSHELL"', () => {
      it('calls nutshellApiHandler.getProducts with the correct arguments', async () => {});
      it('propagates any error thrown by nutshellApiHandler.getProducts', async () => {});
      it('returns the result of nutshellApihandler.getProducts on success', async () => {});
    });
    describe('switch case default', () => {
      it('throws CrmError', async () => {});
    });
  });
});
