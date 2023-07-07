import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderManagerError } from 'src/common/classes';
import { ACCOUNT_REF } from 'src/internal-modules/external-interface-handlers/database/account-db-handler/types';
import { CustomLoggerModule } from 'src/support-modules/custom-logger/custom-logger.module';
import { GraphqlClientService } from './graphql-client.service';

describe('GraphqlClientService', () => {
  let service: GraphqlClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), CustomLoggerModule],
      providers: [GraphqlClientService],
    }).compile();

    service = module.get<GraphqlClientService>(GraphqlClientService);
  });

  describe('initialization tests', () => {
    test('service is defined', async () => expect(service).toBeDefined());
    test('graphql client exists', async () =>
      expect(service.client).toBeDefined());
  });

  describe('queryOrder', () => {
    it("calls service.client's request once", async () => {
      jest.spyOn(service.client, 'request').mockRejectedValue(new Error());
      await service
        .queryOrder({ orderId: 'order id', ref: 'H4H' })
        .catch((reason) => {});
      expect(service.client.request).toHaveBeenCalledTimes(1);
    });
    it('throws OrderManagerError if order not found with id for account', async () => {
      const mockArguments: { orderId: string; ref: ACCOUNT_REF } = {
        orderId: 'NONEXISTENT ORDER ID',
        ref: 'H4H',
      };
      const mockReason = {
        response: {
          data: {
            order: null,
          },
        },
      };
      jest.spyOn(service.client, 'request').mockRejectedValue(mockReason);
      await service.queryOrder(mockArguments).catch((reason) => {
        expect(reason).toBeInstanceOf(OrderManagerError);
        expect(reason.message).toBe('Order not found with id for account');
        expect(reason.isLogged).toBe(true);
      });
    });
    it('propagates through any error other than if the order is not found with id for account', async () => {
      const mockArguments: { orderId: string; ref: ACCOUNT_REF } = {
        orderId: 'INCONSEQUENTIAL ORDER ID',
        ref: 'H4H',
      };
      const mockError = new Error('ERROR UNDER TEST');
      jest.spyOn(service.client, 'request').mockRejectedValue(mockError);
      await expect(service.queryOrder(mockArguments)).rejects.toThrow(
        mockError,
      );
    });
    it('throws OrderManagerError with "Malformed GQL response" if client does not return response with object property', async () => {
      const mockArguments: { orderId: string; ref: ACCOUNT_REF } = {
        orderId: 'INCONSEQUENTIAL ORDER ID',
        ref: 'H4H',
      };

      jest
        .spyOn(service.client, 'request')
        .mockResolvedValue('Not an object with order property');

      const expectedError = new OrderManagerError('Malformed GQL response');
      await expect(service.queryOrder(mockArguments)).rejects.toThrow(
        expectedError,
      );
    });
    it('throws OrderManagerError with "Malformed GQL order response" if returned order fails validation', async () => {
      const mockArguments: { orderId: string; ref: ACCOUNT_REF } = {
        orderId: 'INCONSEQUENTIAL ORDER ID',
        ref: 'H4H',
      };

      jest
        .spyOn(service.client, 'request')
        .mockResolvedValue({ order: 'INVALID ORDER' });
      const expectedError = new OrderManagerError(
        'Malformed GQL order response',
      );
      await expect(service.queryOrder(mockArguments)).rejects.toThrow(
        expectedError,
      );
    });
    it('returns validated order', async () => {
      /**
       * Get a validated order
       */
      expect(true).toBe(false);
    });
  });
  describe('queryOrderName', () => {});
  describe('getCatererMenu', () => {});
});
