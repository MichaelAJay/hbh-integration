import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderManagerError } from 'src/common/classes';
import { ACCOUNT_REF } from 'src/internal-modules/external-interface-handlers/database/account-db-handler/types';
import { ExternalEzmanageApiModule } from './ezmanage-api.module';
import { EzmanageApiService } from './ezmanage-api.service';
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
    it('returns Promise<IEzManageOrder>', async () => {
      const mockArguments: { orderId: string; ref: ACCOUNT_REF } = {
        orderId: 'INCONSEQUENTIAL ORDER ID',
        ref: 'H4H',
      };
      const mockResponse: { order: IEzManageOrder } = {
        order: {
          orderNumber: 'FW8M2X',
          uuid: '31d569b3-f7c8-4507-b7aa-d239ba456dac',
          event: {
            timestamp: '2023-06-29T15:15:00Z',
            timeZoneOffset: '-04:00',
            address: {
              city: 'Watkinsville',
              name: 'Piedmont Heart',
              state: 'GA',
              street: '1305 Jennings Mill Rd',
              street2: 'Suite 250',
              street3: null,
              zip: '30677',
            },
            contact: {
              name: 'Frank Sullivan',
              phone: '2298943785',
            },
          },
          orderCustomer: {
            firstName: null,
            lastName: null,
          },
          totals: {
            subTotal: {
              subunits: 16920,
            },
            tip: {
              subunits: 0,
            },
          },
          caterer: {
            address: {
              city: 'Athens',
            },
          },
          catererCart: {
            feesAndDiscounts: [
              {
                name: 'Delivery Fee',
                cost: {
                  subunits: 2500,
                },
              },
            ],
            orderItems: [
              {
                quantity: 15,
                name: 'Signature Sandwich Boxed Lunches',
                totalInSubunits: {
                  subunits: 16920,
                },
                customizations: [
                  {
                    customizationTypeName: 'Signature Sandwiches',
                    name: 'Assorted',
                    quantity: 15,
                  },
                  {
                    customizationTypeName: 'Add Drinks',
                    name: 'Assorted Canned Sodas',
                    quantity: 15,
                  },
                ],
              },
            ],
            totals: {
              catererTotalDue: 154.22,
            },
          },
          orderSourceType: 'MARKETPLACE',
        },
      };
      jest
        .spyOn(service.graphqlService.client, 'request')
        .mockResolvedValue(mockResponse);
      const order = await service.getOrder(
        mockArguments.orderId,
        mockArguments.ref,
      );
      expect(order).toBe(mockResponse.order);
    });
    it('propagates any error from GraphqlClientService instance', async () => {
      const mockArguments: { orderId: string; ref: ACCOUNT_REF } = {
        orderId: 'INCONSEQUENTIAL ORDER ID',
        ref: 'H4H',
      };
      const mockError = new OrderManagerError('ERROR UNDER TEST');
      jest
        .spyOn(service.graphqlService, 'queryOrder')
        .mockRejectedValue(mockError);
      await expect(
        service.getOrder(mockArguments.orderId, mockArguments.ref),
      ).rejects.toThrow(mockError);
    });
  });
  describe('getOrderName', () => {
    it("returns Promise<string> representing an order's name", async () => {
      const mockArguments: { orderId: string; ref: ACCOUNT_REF } = {
        orderId: 'ORDER ID WITH MATCHING ORDER NUMBER/NAME',
        ref: 'H4H',
      };
      const mockResponse = {
        order: {
          orderNumber: 'ORDER NAME UNDER TEST',
        },
      };
      jest
        .spyOn(service.graphqlService.client, 'request')
        .mockResolvedValue(mockResponse);
      const orderName = await service.getOrderName(mockArguments);
      expect(orderName).toBe(mockResponse.order.orderNumber);
    });
    it('propagates any error', async () => {
      const mockArguments: { orderId: string; ref: ACCOUNT_REF } = {
        orderId: 'INCONSEQUENTIAL ORDER ID',
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
    it('returns Promise<IGetH4HCatererMenu>', async () => {
      const mockArguments: { catererId: string; ref: ACCOUNT_REF } = {
        catererId: 'CATERER ID WITH MENU',
        ref: 'H4H',
      };
      const mockResponse = {
        menu: {
          endDate: null,
          id: '0b71ac53-6292-407d-a45c-32d08a025fb5',
          name: '6/7/2023',
          startDate: '2023-06-07',
          categories: [
            {
              id: 'c00b384a-7451-40e3-88bb-dbbe89ab3fc3',
              name: 'Breakfast',
              items: [
                {
                  id: 'e6bec818-0d71-4a35-989f-a25c00782b5f',
                  name: 'Fresh Fruit Tray',
                  originalItemId: null,
                  status: 'SHOW',
                  comboComponents: [],
                },
                {
                  id: '820e78eb-ec53-431f-9931-4664329b9110',
                  name: 'Signature Breakfast Sandwich Tray',
                  originalItemId: null,
                  status: 'SHOW',
                  comboComponents: [],
                },
                {
                  id: '802ca9fb-c48e-440b-a930-435662a4bf74',
                  name: 'Coffee Cake Tray',
                  originalItemId: null,
                  status: 'SHOW',
                  comboComponents: [],
                },
                {
                  id: 'e4bee761-2333-46cc-9caa-5900deaba4ef',
                  name: 'Build-Your-Own Yogurt Parfait',
                  originalItemId: null,
                  status: 'SHOW',
                  comboComponents: [],
                },
                {
                  id: '7d8b053d-2d76-40a2-aeb3-5f8a92da65f3',
                  name: 'Boxed Breakfast',
                  originalItemId: null,
                  status: 'SHOW',
                  comboComponents: [],
                },
                {
                  id: 'daccd240-9794-48ef-9c3c-954ebb6469b2',
                  name: 'Breakfast Pastry Tray',
                  originalItemId: null,
                  status: 'SHOW',
                  comboComponents: [],
                },
                {
                  id: '84890a3a-6c17-48a5-a6ac-facb8c12c37e',
                  name: 'Assorted Bagel Tray',
                  originalItemId: null,
                  status: 'SHOW',
                  comboComponents: [],
                },
                {
                  id: '36a0fb29-d5d4-4d13-8b54-f65bb8fc61f9',
                  name: 'Honey Baked Ham & Cheddar Biscuit Box',
                  originalItemId: null,
                  status: 'SHOW',
                  comboComponents: [],
                },
              ],
            },
            {
              id: '472342c5-fee1-4ed1-894d-fb4992cd6680',
              name: 'Boxed Lunches',
              items: [
                {
                  id: '91d9687b-90a3-4527-b479-facbdd66a201',
                  name: 'Signature Sandwich Boxed Lunches',
                  originalItemId: null,
                  status: 'SHOW',
                  comboComponents: [],
                },
                {
                  id: 'e30b1abf-d2a3-4e25-bada-ed6767f365af',
                  name: 'Specialty Sandwich Boxed Lunches',
                  originalItemId: null,
                  status: 'SHOW',
                  comboComponents: [],
                },
                {
                  id: 'd45ff95f-b360-4bb0-ae16-bbc1b6c02bf0',
                  name: 'Salad Boxed Lunches',
                  originalItemId: null,
                  status: 'SHOW',
                  comboComponents: [],
                },
                {
                  id: '775c4790-b152-4b9c-90dc-a2cb28648ea3',
                  name: 'Honey Baked Plate Boxed Lunch',
                  originalItemId: null,
                  status: 'SHOW',
                  comboComponents: [],
                },
                {
                  id: '7f210c4a-f9b6-478f-9f9b-dd71058b04bf',
                  name: 'Gluten-Free Specialty Sandwich Boxed Lunches',
                  originalItemId: null,
                  status: 'SHOW',
                  comboComponents: [],
                },
                {
                  id: '3a88428a-2102-406e-91ce-2b6a257b0d4b',
                  name: 'Gluten-Free Signature Sandwich Boxed Lunches',
                  originalItemId: null,
                  status: 'SHOW',
                  comboComponents: [],
                },
              ],
            },
            {
              id: '6b3d3411-bc46-400a-b755-a66f30127077',
              name: 'HoneyBaked Buffets',
              items: [
                {
                  id: '96262c3a-8116-41fc-a882-635314b9b625',
                  name: 'VIP Buffet',
                  originalItemId: null,
                  status: 'SHOW',
                  comboComponents: [],
                },
                {
                  id: 'f26b1c92-3155-44e7-a5ef-8a349dd1db71',
                  name: 'Supreme Sandwich Tray',
                  originalItemId: null,
                  status: 'SHOW',
                  comboComponents: [],
                },
                {
                  id: 'b667be35-18ca-4338-babc-a25b6909365e',
                  name: 'The Sandwich Builder Buffet',
                  originalItemId: null,
                  status: 'SHOW',
                  comboComponents: [],
                },
              ],
            },
            {
              id: '26ef0239-f19a-4501-ba08-fef30565fd28',
              name: 'Buffet Salads',
              items: [
                {
                  id: 'b5a7c4ff-5e21-4e20-8c20-db1b5bf03e34',
                  name: 'Garden Salad',
                  originalItemId: null,
                  status: 'SHOW',
                  comboComponents: [],
                },
                {
                  id: '5de13563-3d48-4a6a-a311-3f375a64cbfc',
                  name: 'Veggie Cobb Salad',
                  originalItemId: null,
                  status: 'SHOW',
                  comboComponents: [],
                },
                {
                  id: 'ab4bce83-31b4-4bea-96c0-b2cd351e7197',
                  name: 'Cobb Salad',
                  originalItemId: null,
                  status: 'SHOW',
                  comboComponents: [],
                },
              ],
            },
            {
              id: '4a0ac90f-7848-45ed-b130-c8a4235486ef',
              name: 'Sides',
              items: [
                {
                  id: '67bcd079-c25d-4beb-901f-3afa9b1ac73c',
                  name: 'Fresh Fruit Tray',
                  originalItemId: null,
                  status: 'SHOW',
                  comboComponents: [],
                },
                {
                  id: '0c0c256c-d9e9-4bcd-8c67-505dd7d2e0aa',
                  name: 'Broccoli Bacon Bliss Salad',
                  originalItemId: null,
                  status: 'SHOW',
                  comboComponents: [],
                },
                {
                  id: '9c4d09ef-47e9-454d-bc3d-5a013f40a507',
                  name: 'Smashed Potato Salad',
                  originalItemId: null,
                  status: 'SHOW',
                  comboComponents: [],
                },
                {
                  id: '431c6b67-7804-4e21-b7fa-2924500af2d5',
                  name: 'Fresh Veggie Tray',
                  originalItemId: null,
                  status: 'SHOW',
                  comboComponents: [],
                },
                {
                  id: '77ccb233-81b2-425f-a1d2-00e2787b002b',
                  name: 'Deep River Kettle Chips',
                  originalItemId: null,
                  status: 'SHOW',
                  comboComponents: [],
                },
                {
                  id: '5a12862e-4887-40b6-b253-6a1d13bc2669',
                  name: 'Chicken Salad',
                  originalItemId: null,
                  status: 'SHOW',
                  comboComponents: [],
                },
                {
                  id: 'be28f26f-14b4-4ac2-b3da-d0173a8dc232',
                  name: 'Ham Salad',
                  originalItemId: null,
                  status: 'SHOW',
                  comboComponents: [],
                },
              ],
            },
            {
              id: '2fcd5c10-9a0e-4c4a-a2dc-a04499eb66e2',
              name: 'Desserts',
              items: [
                {
                  id: '1ff54107-f228-4ed9-8e12-a8f5832af662',
                  name: 'Assorted Cookies',
                  originalItemId: null,
                  status: 'SHOW',
                  comboComponents: [],
                },
                {
                  id: 'd4f052d2-d5ba-437c-aebb-c35ee2922b8a',
                  name: 'Cookie & Brownie Tray',
                  originalItemId: null,
                  status: 'SHOW',
                  comboComponents: [],
                },
                {
                  id: '00529b21-89a9-4367-a749-787333b11471',
                  name: 'Brownies',
                  originalItemId: null,
                  status: 'SHOW',
                  comboComponents: [],
                },
              ],
            },
            {
              id: '6b9f900d-ea25-4ccc-b908-51b08d8b5e9f',
              name: 'Beverages',
              items: [
                {
                  id: 'd0054e6d-4d76-4464-b0dd-986047e5c4d1',
                  name: 'Gallon Unsweet Tea',
                  originalItemId: null,
                  status: 'SHOW',
                  comboComponents: [],
                },
                {
                  id: '1b165661-b932-4213-9a59-c1d51d156c4b',
                  name: 'Gallon Lemonade',
                  originalItemId: null,
                  status: 'SHOW',
                  comboComponents: [],
                },
                {
                  id: '83b022c0-ddf2-4a7a-91aa-6d17e894ad3d',
                  name: 'Gallon Sweet Tea',
                  originalItemId: null,
                  status: 'SHOW',
                  comboComponents: [],
                },
                {
                  id: '1707706f-c057-4e49-b868-4249414647d9',
                  name: 'Assorted Coca-Cola Beverages',
                  originalItemId: null,
                  status: 'SHOW',
                  comboComponents: [],
                },
                {
                  id: '333dec92-4087-45a0-934e-ace0d44996ff',
                  name: 'Bottled Water',
                  originalItemId: null,
                  status: 'SHOW',
                  comboComponents: [],
                },
                {
                  id: '71b22061-6ffb-4fc7-acfc-8c2999ccbe6a',
                  name: 'Coffee Carafe',
                  originalItemId: null,
                  status: 'SHOW',
                  comboComponents: [],
                },
                {
                  id: '6cec24b0-f223-4616-a51c-b66e09b1d586',
                  name: 'Gallon Orange Juice',
                  originalItemId: null,
                  status: 'SHOW',
                  comboComponents: [],
                },
              ],
            },
            {
              id: '1b1ced94-c2c6-41f6-a5cf-3e602f2273f3',
              name: 'Miscellaneous',
              items: [
                {
                  id: 'a351a5ef-3c93-403b-81bc-60f87d745ae3',
                  name: 'Ice',
                  originalItemId: null,
                  status: 'SHOW',
                  comboComponents: [],
                },
              ],
            },
          ],
        },
      };
      jest
        .spyOn(service.graphqlService.client, 'request')
        .mockResolvedValue(mockResponse);
      const H4HCatererMenu = await service.getCatererMenu(mockArguments);
      expect(H4HCatererMenu).toBe(mockResponse);
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
