import { Test, TestingModule } from '@nestjs/testing';
import { CrmError } from 'src/common/classes';
import { IEzManageOrder } from 'src/external-modules/ezmanage-api/interfaces/gql/responses';
import { NutshellApiModule } from 'src/external-modules/nutshell-api/nutshell-api.module';
import { AccountRecordWithId } from '../database/account-db-handler/types';
import { CrmHandlerService } from './crm-handler.service';
import { CrmModule } from './crm.module';
import { NutshellApiHandlerService } from './nutshell-api-handler.service';
import { GeneratePrimaryNutshellEntityReturn } from './types/returns';

describe('NutshellApiHandlerService unit tests', () => {
  let service: NutshellApiHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CrmModule, NutshellApiModule],
      providers: [NutshellApiHandlerService],
    }).compile();

    service = module.get<NutshellApiHandlerService>(NutshellApiHandlerService);
  });

  /**
   * complete
   */
  describe('existence & dependency injection tests', () => {
    test('service exists', () => expect(service).toBeDefined());
    test('nutshell api service is injected into service', () =>
      expect(service.nutshellApiService).toBeDefined());
  });
  describe('generatePrimaryEntity', () => {
    it('rejects with CrmError if account.crmPrimaryType is undefined', async () => {});
    it('rejects with CrmError if account.crmPrimaryType is not supported by switch', async () => {});
    describe('switch case "LEAD"', () => {
      it('rejects with OrderManagerError if order argument does not pass validation', async () => {});
      it('calls createLead once', async () => {});
      it('calls createLead with the correct arguments', async () => {});
      it('returns result from createLead', async () => {});
      it('propagates any error thrown by createLead', async () => {});
    });
  });
  describe('updatePrimaryEntityWithOrder', () => {
    it('rejects with CrmError if account.crmPrimaryType is undefined', async () => {});
    it('rejects with CrmError if account.crmPrimaryType is not supported by switch', async () => {});
    describe('switch case "LEAD"', () => {
      it('rejects with OrderManagerError if order argument does not pass validation', async () => {});
      it('calls updateLeadWithOrder once', async () => {});
      it('calls updateLeadWithOrder with the correct arguments', async () => {});
      it('returns result from updateLeadWithOrder', async () => {});
      it('propagates any error thrown by updateLeadWithOrder', async () => {});
    });
  });
  describe('getProducts', () => {
    it('calls nutshellApiService.getProducts once', async () => {});
    it('calls nutshellApiService.getProducts with the correct arguments', async () => {});
    it('returns result from nutshellApiService.getProducts directly', async () => {});
    it('propagates any error thrown by nutshellApiService.getProducts', async () => {});
  });
});
