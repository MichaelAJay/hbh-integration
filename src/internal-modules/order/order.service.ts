import { Injectable } from '@nestjs/common';
import { IOrderModel } from 'src/external-modules/database/models';
import { OrderDbHandlerService } from '../external-interface-handlers/database/order-db-handler/order-db-handler.service';
import { EzmanageApiHandlerService } from '../external-interface-handlers/ezmanage-api/ezmanage-api-handler.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderDbService: OrderDbHandlerService,
    private readonly ezManageApiHandler: EzmanageApiHandlerService,
  ) {}

  async createOrder({
    accountId,
    catererId,
    orderId,
    occurredAt,
    accEnvVarPrefix,
  }: {
    accountId: string;
    catererId: string;
    orderId: string;
    occurredAt: string;
    accEnvVarPrefix: string;
  }) {
    /**
     * Need order name for db
     */
    /**
     * @TODO add request to check for order name
     */
    // const ezManageOrder = await this.ezManageApiHandler.getOrder(
    //   orderId,
    //   accEnvVarPrefix,
    // );

    /**
     * @TODO this is spoofing until I can get some order ids in the system
     */
    const ezManageOrder = { name: 'PLACEHOLDER NAME' };

    /**
     * @TODO fix the date issue
     */
    const now = new Date();
    const data: IOrderModel = {
      accountId,
      catererId,
      name: ezManageOrder.name,
      acceptedAt: now,
      lastUpdatedAt: now,
    };

    await this.orderDbService.create({ orderId, data });
    return;
  }
}
