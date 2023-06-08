import { Injectable } from '@nestjs/common';
import { CustomLoggerService } from 'src/support-modules/custom-logger/custom-logger.service';
import { IUpdateStatus } from './interfaces';
import { OrderInternalInterfaceService } from './order-internal-interface.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderInternalInterface: OrderInternalInterfaceService,
    private readonly logger: CustomLoggerService,
  ) {}

  async getOrdersByAccount({ accountId }: { accountId: string }) {
    return await this.orderInternalInterface.getOrdersByAccount({ accountId });
  }

  async getOrder({
    orderId,
    accountId,
    ref: ref,
  }: {
    orderId: string;
    accountId: string;
    ref: string;
  }) {
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
    ref: string;
  }) {
    return await this.orderInternalInterface.getOrderByName({
      orderName: orderName
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

  async generateLeadFromOrder({
    orderName,
    accountId,
    ref,
  }: {
    orderName: string;
    accountId: string;
    ref: string;
  }) {
    return await this.orderInternalInterface.generateLeadFromOrder({
      orderName,
      accountId,
      ref,
    });
  }
}
