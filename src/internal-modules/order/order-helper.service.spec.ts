import { Test, TestingModule } from '@nestjs/testing';
import { OrderHelperService } from './order-helper.service';

describe('OrderHelperService', () => {
  let service: OrderHelperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderHelperService],
    }).compile();

    service = module.get<OrderHelperService>(OrderHelperService);
  });

  describe('existence tests', () => {
    test('service is defined', () => expect(service).toBeDefined());
  });

  describe('generateIOrderModelFromCrmEntity', () => {
    it('calls service tryAppendCrmDataToOrder with the correct arguments', () => {});
    it('propagates any error thrown by service tryAppendCrmDataToOrder', () => {});
    it('returns an object which matches the IOrderModel interface', () => {});
  });
  describe('tryAppendCrmDataToOrder', () => {
    describe('crmEntity is object and not null', () => {
      it('returns object with "crmId" string property if crmEntity argument has "id" string property', () => {});
      it('returns object without "crmId" if crmEntity argument does not have "id" property', () => {});
      it('returns object without "crmId" if crmEntity argument "id" is not string', () => {});
      it('returns object with "crmDescription" string property if crmEntity argument has "description" string property', () => {});
      it('returns object without "crmDescription" if crmEntity argument does not have "description" property', () => {});
      it('returns object without "crmDescription" if crmEntity argument "description" is not string', () => {});
      describe('crmEntity.isSubtotalMatch is boolean false', () => {
        it('returns object with "warnings" string array', () => {});
      });
      describe('crmEntity.isSubtotalMatch is not boolean false', () => {
        it('does not return object with "warnings" string array if crmEntity.isSubtotalMatch is undefined', () => {});
        it('does not return object with "warnings" string array if crmEntity.isSubtotalMatch is not boolean type', () => {});
        it('does not return object with "warnings" string array if crmEntity.isSubtotalMatch is true', () => {});
      });
    });
    /**
     * For these tests, just check that the return is the same as the input
     */
    describe('crmEntity is not object', () => {});
    describe('crmEntity is null', () => {});
  });

  afterEach(() => jest.resetAllMocks());
});
