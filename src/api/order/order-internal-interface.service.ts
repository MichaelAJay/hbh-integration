import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { OrderDbHandlerService } from 'src/internal-modules/external-interface-handlers/database/order-db-handler/order-db-handler.service';
import { OrderService } from 'src/internal-modules/order/order.service';
import { IUpdateStatus } from './interfaces';
import { IGetOrderOutput } from './interfaces/output';
import { GetOrdersByAccount } from './types/output/get-orders-by-account.type';

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
    const orders = await this.orderDbHandler.getManyForAccount(accountId);
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
    ref: string;
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
    const ezManageOrder = await this.orderService.getOrder({
      order,
      ref,
    });

    return { catererName: order.catererName, ...ezManageOrder };
  }

  async getOrderByName({
    orderName,
    accountId,
    ref,
  }: {
    orderName: string;
    accountId: string;
    ref: string;
  }): Promise<IGetOrderOutput> {
    const order = await this.orderDbHandler.findByNameForAccount(
      orderName,
      accountId,
    );

    const ezManageOrder = await this.getOrder({
      orderId: order.id,
      accountId,
      ref,
    });

    return ezManageOrder;
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

  async generateLeadFromOrder({
    orderName,
    accountId,
    ref,
  }: {
    orderName: string;
    accountId: string;
    ref: string;
  }) {
    const ezManageOrder = await this.getOrderByName({
      orderName,
      accountId,
      ref,
    });

    const { lead, invalidKeys } = await this.orderService.generateLeadFromOrder(
      ezManageOrder,
    );
    return { lead, invalidKeys };
  }
}
