import { Test, TestingModule } from '@nestjs/testing';
import { H4HClientHelperService } from './h4h-client-helper.service';

describe('H4hClientHelperService', () => {
  let service: H4HClientHelperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [H4HClientHelperService],
    }).compile();

    service = module.get<H4HClientHelperService>(H4HClientHelperService);
  });

  describe('existence tests', () => {
    test('service is defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('aggregateLeadProducts', () => {
    it('calls service mapH4HMenuItemToCrmProductId with the correct arguments', () => {});
    describe('input includes an item named "Salad Boxed Lunches"', () => {
      it('calls service handleSaladBoxedLunch with th correct arguments', () => {});
    });
    describe('input does not include an item named "Salad Boxed Lunches"', () => {
      it('does not call handleSaladBoxedLunch', () => {});
    });
    describe('input includes an item with "customizations" array property', () => {
      describe('an item customization has "customizationTypeName" in "ADD_ON_TARGET_CUSTOMIZATION_TYPE_NAMES" constant', () => {
        it('calls service mapH4HAddOnToCRMProductId with the correct arguments', () => {});
        describe('mapH4HAddOnToCRMProductId returns a string', () => {
          describe('customization has "quantity" property that is a number', () => {});
          describe('customization has "quantity" property which is not a number', () => {});
          describe('customization does not have "quantity" property', () => {});
        });
        describe('mapH4HAddOnToCRMProductId returns undefined', () => {
          it('returns item.name in invalidKeys array', () => {});
        });
      });
      describe('no item has a customization with customizationTypeName in "ADD_ON_TARGET"CUSTOMIZATION_TYPE_NAMES" constant', () => {});
    });
    describe('input does not include an item with "customizations" array property', () => {});
  });

  describe('handleSaladBoxedLunch', () => {});

  describe('mapH4HMenuItemToCrmProductId', () => {});

  describe('mapH4HAddOnToCRMProductId', () => {});

  describe('getLeadName', () => {});

  describe('getDateForLeadName', () => {});

  describe('getLeadAssignee', () => {});

  afterEach(() => jest.resetAllMocks());
});
