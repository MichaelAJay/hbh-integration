import { Test, TestingModule } from '@nestjs/testing';
import { NutshellApiService } from 'src/external-modules/nutshell-api/nutshell-api.service';
import { NutshellApiHandlerService } from './nutshell-api-handler.service';

describe('NutshellApiHandlerService unit tests', () => {
  let service: NutshellApiHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NutshellApiHandlerService,
        {
          provide: NutshellApiService,
          useValue: {
            createLead: jest.fn(),
            updateLead: jest.fn(),
            getProducts: jest.fn(),
          },
        },
      ],
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
    describe('switch case "LEAD"', () => {
      it('throws OrderManagerError if input order fails validateEzManageOrder validator', async () => {});
      it('calls service createLead with the correct arguments', async () => {});
      it('propagates any error thrown by service createLead', async () => {});
      it('returns the result of service createLead on success', async () => {});
    });
    describe('switch case default', () => {
      it('throws CrmError if account.crmPrimaryEntity is undefined', async () => {});
      it('throws CrmError if accountcrmPrimaryEntity is valid value but has no switch case', async () => {});
    });
  });
  describe('updatePrimaryEntityWithOrder', () => {
    describe('switch case "LEAD"', () => {
      describe('incoming order fails validateEzManageOrder validation', () => {
        it('throws OrderManagerError', async () => {});
      });
      describe('incoming order passes validateEzManageOrder validation', () => {
        it('calls service updateLeadWithOrder with the correct arguments', async () => {});
        it('propagates any error thrown by service updateLeadWithOrder', async () => {});
        it('returns the result of service updateLeadWithOrder on success', async () => {});
      });
    });
    describe('switch case default', () => {
      it('throws CrmError', async () => {});
    });
  });
  describe('getProducts', () => {
    it('calls nutshellApiService.getProducts with the correct arguments', async () => {});
    it('propagates any error thrown by nutshellApiService.getProducts', async () => {});
    it('returns the result of nutshellApiService.getProducts on success', async () => {});
  });
});
