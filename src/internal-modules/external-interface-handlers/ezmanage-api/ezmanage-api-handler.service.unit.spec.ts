import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { EzmanageApiService } from 'src/external-modules/ezmanage-api/ezmanage-api.service';
import { EzmanageApiHandlerService } from './ezmanage-api-handler.service';

describe('EzmanageApiHandlerService', () => {
  let service: EzmanageApiHandlerService;
  let ezManageApiService: EzmanageApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        EzmanageApiHandlerService,
        {
          /** COMPLETED 9 AUG 23 */
          provide: EzmanageApiService,
          useValue: {
            getOrder: jest.fn(),
            getOrderName: jest.fn(),
            getCatererMenu: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EzmanageApiHandlerService>(EzmanageApiHandlerService);
    ezManageApiService = module.get<EzmanageApiService>(EzmanageApiService);
  });

  describe('existence tests', () => {
    test('service is defined', () => expect(service).toBeDefined());
    test('ezManageApiService is defined', () =>
      expect(ezManageApiService).toBeDefined());
  });
  describe('getOrder', () => {
    it('calls ezManageapiService.getOrder with the correct arguments', async () => {});
    it('propagates any error thrown by ezManageApiService.getOrder', async () => {});
    it('returns the result of ezManageApiService.getOrder on success', async () => {});
  });
  describe('getOrderName', () => {});
  describe('getCatererName', () => {});

  afterEach(() => jest.resetAllMocks());
});
