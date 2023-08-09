import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderManagerError } from 'src/common/classes';
import { ACCOUNT_REF } from 'src/internal-modules/external-interface-handlers/database/account-db-handler/types';
import { ExternalEzmanageApiModule } from './ezmanage-api.module';
import { EzmanageApiService } from './ezmanage-api.service';
import { IGetH4HCatererMenu } from './interfaces/gql';
import { IEzManageOrder } from './interfaces/gql/responses';

describe('EzmanageApiService', () => {
  let service: EzmanageApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), ExternalEzmanageApiModule],
      providers: [EzmanageApiService],
    }).compile();

    service = module.get<EzmanageApiService>(EzmanageApiService);
  });

  describe('existence tests', () => {
    test('service exists', async () => expect(service).toBeDefined());
    test('graphql service is injected on service', async () =>
      expect(service.graphqlService).toBeDefined());
  });
  describe('getOrder', () => {
    it('calls graphql service queryOrder with the correct arguments', async () => {
      const mockArguments: { orderId: string; ref: ACCOUNT_REF } = {
        orderId: 'ORDER ID UNDER TEST',
        ref: 'H4H',
      };
      const mockResolvedValue = {} as IEzManageOrder;
      jest
        .spyOn(service.graphqlService, 'queryOrder')
        .mockResolvedValue(mockResolvedValue);
      await service.getOrder(mockArguments.orderId, mockArguments.ref);
      expect(service.graphqlService.queryOrder).toHaveBeenCalledWith(
        mockArguments,
      );
    });
    it('passes through any non-error return', async () => {
      const mockArguments: { orderId: string; ref: ACCOUNT_REF } = {
        orderId: 'ORDER ID UNDER TEST',
        ref: 'H4H',
      };
      const mockResolvedValue = {} as IEzManageOrder;
      jest
        .spyOn(service.graphqlService, 'queryOrder')
        .mockResolvedValue(mockResolvedValue);
      const result = await service.getOrder(
        mockArguments.orderId,
        mockArguments.ref,
      );
      expect(result).toBe(mockResolvedValue);
    });
    it('propagates any error', async () => {
      const mockArguments: { orderId: string; ref: ACCOUNT_REF } = {
        orderId: 'ORDER ID UNDER TEST',
        ref: 'H4H',
      };
      const mockRejectedValue = new OrderManagerError('ERROR UNDER TEST');
      jest
        .spyOn(service.graphqlService, 'queryOrder')
        .mockRejectedValue(mockRejectedValue);
      await expect(
        service.getOrder(mockArguments.orderId, mockArguments.ref),
      ).rejects.toThrow(mockRejectedValue);
    });
  });
  describe('getOrderName', () => {
    it('calls graphql service queryOrderName with the correct arguments', async () => {
      const mockArguments: { orderId: string; ref: ACCOUNT_REF } = {
        orderId: 'ORDER ID UNDER TEST',
        ref: 'H4H',
      };
      const mockResolvedValue = 'MOCK ORDER NAME';
      jest
        .spyOn(service.graphqlService, 'queryOrderName')
        .mockResolvedValue(mockResolvedValue);
      await service.getOrderName(mockArguments);
      expect(service.graphqlService.queryOrderName).toHaveBeenCalledWith(
        mockArguments,
      );
    });
    it('passes through any non-error return', async () => {
      const mockArguments: { orderId: string; ref: ACCOUNT_REF } = {
        orderId: 'ORDER ID UNDER TEST',
        ref: 'H4H',
      };
      const mockResolvedValue = 'MOCK ORDER NAME';
      jest
        .spyOn(service.graphqlService, 'queryOrderName')
        .mockResolvedValue(mockResolvedValue);
      const orderName = await service.getOrderName(mockArguments);
      expect(orderName).toBe(mockResolvedValue);
    });
    it('propagates any error', async () => {
      const mockArguments: { orderId: string; ref: ACCOUNT_REF } = {
        orderId: 'ORDER ID UNDER TEST',
        ref: 'H4H',
      };
      const mockRejectedValue = new OrderManagerError('ERROR UNDER TEST');
      jest
        .spyOn(service.graphqlService, 'queryOrderName')
        .mockRejectedValue(mockRejectedValue);
      await expect(service.getOrderName(mockArguments)).rejects.toThrow(
        mockRejectedValue,
      );
    });
  });
  describe('getCatererName', () => {
    it('calls graphql service getCatererMenu with the correct arguments', async () => {
      const mockArguments: { catererId: string; ref: ACCOUNT_REF } = {
        catererId: 'CATERER ID UNDER TEST',
        ref: 'H4H',
      };
      const mockResolvedValue = {} as IGetH4HCatererMenu;
      jest
        .spyOn(service.graphqlService, 'getCatererMenu')
        .mockResolvedValue(mockResolvedValue);
      await service.getCatererMenu(mockArguments);
      expect(service.graphqlService.getCatererMenu).toHaveBeenCalledWith(
        mockArguments,
      );
    });
    it('passes through any non-error return', async () => {
      const mockArguments: { catererId: string; ref: ACCOUNT_REF } = {
        catererId: 'CATERER ID UNDER TEST',
        ref: 'H4H',
      };
      const mockResolvedValue = {} as IGetH4HCatererMenu;
      jest
        .spyOn(service.graphqlService, 'getCatererMenu')
        .mockResolvedValue(mockResolvedValue);
      const result = await service.getCatererMenu(mockArguments);
      expect(result).toBe(mockResolvedValue);
    });
    it('propagates any error', async () => {
      const mockArguments: { catererId: string; ref: ACCOUNT_REF } = {
        catererId: 'CATERER ID UNDER TEST',
        ref: 'H4H',
      };
      const mockRejectedValue = new OrderManagerError('ERROR UNDER TEST');
      jest
        .spyOn(service.graphqlService, 'getCatererMenu')
        .mockRejectedValue(mockRejectedValue);
      await expect(service.getCatererMenu(mockArguments)).rejects.toThrow(
        mockRejectedValue,
      );
    });
  });
});
