import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ACCOUNT_REF } from 'src/internal-modules/external-interface-handlers/database/account-db-handler/types';
import { OrderDbHandlerService } from 'src/internal-modules/external-interface-handlers/database/order-db-handler/order-db-handler.service';
import { OrderService } from 'src/internal-modules/order/order.service';
import { IUpdateStatus } from './interfaces';
import { IGetOrderOutput } from './interfaces/output';
import { GetOrdersByAccount } from './types/output';
import { convertEzManageOrderForOutput } from './utility';

@Injectable()
export class OrderInternalInterfaceService {
  constructor(
    private readonly orderService: OrderService,
    private readonly orderDbHandler: OrderDbHandlerService,
  ) {}

  /**
   * @TODO need to think about pagination
   */
  async getOrdersByAccount({
    accountId,
  }: {
    accountId: string;
  }): Promise<GetOrdersByAccount> {
    const orders = await this.orderDbHandler.getAllForAccount(accountId);
    return orders.map((order) => ({
      id: order.id,
      name: order.name,
      status: order.status,
      caterer: order.catererName,
    }));
  }

  async getOrder({
    orderId,
    accountId,
    ref,
  }: {
    orderId: string;
    accountId: string;
    ref: ACCOUNT_REF;
  }): Promise<IGetOrderOutput> {
    const internalOrder = await this.orderDbHandler.getOne(orderId);
    if (!internalOrder) {
      /**
       * @TODO log
       */
      throw new NotFoundException('Order was not found');
    }

    const ezManageOrder = await this.getEzManageOrder({
      orderId,
      accountId,
      ref,
    });

    const convertedOrder = convertEzManageOrderForOutput({
      ...ezManageOrder,
      status: internalOrder.status,
    });

    return { ...convertedOrder, catererName: internalOrder.catererName };
  }

  async getEzManageOrder({
    orderId,
    accountId,
    ref,
  }: {
    orderId: string;
    accountId: string;
    ref: ACCOUNT_REF;
  }) {
    const order = await this.orderDbHandler.getOne(orderId);
    if (!order) throw new BadRequestException('Order not found');

    if (
      !this.orderService.doesOrderBelongToAccount({
        input: order,
        accountId,
      })
    )
      throw new ForbiddenException({ reason: 'WRONG_ACCT' });

    /**
     * Get order from EZManage
     */
    return await this.orderService.getEzManageOrder({
      order,
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
  }): Promise<IGetOrderOutput> {
    const order = await this.getInternalOrderByName({ orderName, accountId });
    return await this.getOrder({ orderId: order.id, accountId, ref });
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
    const results = await Promise.allSettled(
      updates.map(async ({ id: orderId, status }) => {
        const order = await this.orderDbHandler.getOne(orderId);

        if (!order) return { orderId, didUpdate: false };

        if (order.id !== accountId) return { orderId, didUpdate: false };

        if (order.status === status) return { orderId, didUpdate: false };
        const { updated } = await this.orderDbHandler.updateOne({
          orderId,
          updates: { status },
        });

        return { orderId, didUpdate: updated };
      }),
    );

    return results.reduce((acc, result) => {
      if (result.status === 'fulfilled') {
        acc.push(result.value);
      }
      return acc;
    }, [] as { orderId: string; didUpdate: boolean }[]);
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
    const orders = await this.orderDbHandler.getManyForAccount({ orderIds });
    const validOrders = orders.filter((order) => order.accountId === accountId);
    const invalidOrderIds = orders
      .filter((order) => order.accountId !== accountId)
      .map((order) => order.id);

    await Promise.all(
      validOrders.map(async (order) =>
        this.orderDbHandler.delete({ orderId: order.id }),
      ),
    );

    return { invalidOrders: invalidOrderIds };
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
    const internalOrder = await this.getInternalOrderByName({
      orderName,
      accountId,
    });

    const ezManageOrder = await this.getEzManageOrder({
      orderId: internalOrder.id,
      accountId,
      ref,
    });

    // const VOID_RETURN = await this.orderService.generateLeadFromOrder(
    //   ezManageOrder,
    // );
    // // return { lead, invalidKeys };
    // return VOID_RETURN;
  }

  private async getInternalOrderByName({
    orderName,
    accountId,
  }: {
    orderName: string;
    accountId: string;
  }) {
    return await this.orderDbHandler.findByNameForAccount(orderName, accountId);
  }
}
