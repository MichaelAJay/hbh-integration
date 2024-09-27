import { Test, TestingModule } from '@nestjs/testing';
import { NutshellApiService } from 'src/external-modules/nutshell-api/nutshell-api.service';
import { NutshellApiHandlerHelperService } from './nutshell-api-handler.helper.service';

describe('NutshellApiHandlerHelperService', () => {
  let service: NutshellApiHandlerHelperService;
  let nutshellApiService: NutshellApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NutshellApiHandlerHelperService,
        { provide: NutshellApiService, useValue: {} },
      ],
    }).compile();

    service = module.get<NutshellApiHandlerHelperService>(
      NutshellApiHandlerHelperService,
    );
    nutshellApiService = module.get<NutshellApiService>(NutshellApiService);
  });

  describe('existence tests', () => {
    test('service is defined', () => expect(service).toBeDefined());
    test('nutshellApiService is defined', () =>
      expect(nutshellApiService).toBeDefined());
  });
  describe('createLead', () => {
    describe('switch case "H4H"', () => {
      it('calls outputH4HOrderToCrm with the correct arguments', async () => {});
      it('propagates any error thrown by outputH4HOrderToCrm', async () => {});
      it('calls nutshellApiService.createLead with the correct arguments', async () => {});
      it('propagates any error thrown by nutshellApiService.createLead', async () => {});
      it('calls compareEzManageSubtotalToCrmSubtotal with the correct arguments', async () => {});
      it('propagates any error thrown by compareEzManageSubtotalToCrmSubtotal', async () => {});
      it('returns an object { crmId: string, description, string, isSubtotalMatch: boolean, tags: string[] } on success', async () => {});
    });
    describe('switch case "ADMIN"', () => {
      it('throws CrmError', async () => {});
    });
    describe('switch case default', () => {
      it('throws CrmError if ref is undefined', async () => {});
      it('throws CrmError if ref is defined but no matching switch case', async () => {});
    });
  });
  describe('updateLeadWithOrder', () => {
    describe('switch case "H4H"', () => {
      it('calls outputH4HOrderToCrm with the correct arguments', async () => {});
      describe('NOTE lots of internal stuff going on here - handle it', () => {});
    });
    describe('switch case "ADMIN"', () => {
      it('throws CrmError', async () => {});
    });
    describe('switch case default', () => {
      it('throws CrmError if ref is undefined', async () => {});
      it('throws CrmError if ref is defined but no matching switch case', async () => {});
    });
  });
  afterEach(() => jest.resetAllMocks());
});
