import { Injectable } from '@nestjs/common';
import { ACCOUNT_REF } from 'src/internal-modules/external-interface-handlers/database/account-db-handler/types';
import { IUpdateStatus } from './interfaces';
import { IGetOrderOutput } from './interfaces/output';
import { OrderInternalInterfaceService } from './order-internal-interface.service';

@Injectable()
export class OrderAPIService {
  constructor(
    private readonly orderInternalInterface: OrderInternalInterfaceService,
  ) {}

  async getOrdersByAccount({ accountId }: { accountId: string }) {
    return await this.orderInternalInterface.getOrdersByAccount({ accountId });
  }

  /**
   * @TODO this needs to be refactored to handle the conversion of the EzManage order
   * to the required output here
   */
  async getOrder({
    orderId,
    accountId,
    ref: ref,
  }: {
    orderId: string;
    accountId: string;
    ref: ACCOUNT_REF;
  }): Promise<IGetOrderOutput> {
    return await this.orderInternalInterface.getOrder({
      orderId,
      accountId,
      ref,
    });
  }

  async getOrderByName({
    orderName,
    accountId,
    ref,
  }: {
    orderName: string;
    accountId: string;
    ref: ACCOUNT_REF;
  }) {
    return await this.orderInternalInterface.getOrderByName({
      orderName: orderName
        .toUpperCase()
        .split('')
        .filter((char) => /[a-zA-Z0-9]/.test(char))
        .join(''),
      accountId,
      ref,
    });
  }

  async updateStatuses({
    updates,
    accountId,
    ref,
  }: {
    updates: IUpdateStatus[];
    accountId: string;
    ref: string;
  }) {
    return await this.orderInternalInterface.updateStatuses({
      updates,
      accountId,
      ref,
    });
  }

  async deleteOrders({
    orderIds,
    accountId,
    ref,
  }: {
    orderIds: string[];
    accountId: string;
    ref: string;
  }) {
    return await this.orderInternalInterface.deleteOrders({
      orderIds,
      accountId,
      ref,
    });
  }

  async generateLeadFromOrder({
    orderName,
    accountId,
    ref,
  }: {
    orderName: string;
    accountId: string;
    ref: ACCOUNT_REF;
  }) {
    return await this.orderInternalInterface.generateLeadFromOrder({
      orderName,
      accountId,
      ref,
    });
  }
}
