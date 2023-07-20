import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { IOrderModelWithId } from 'src/external-modules/database/models';
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
      order: internalOrder,
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
    order,
    accountId,
    ref,
  }: {
    order: IOrderModelWithId;
    accountId: string;
    ref: ACCOUNT_REF;
  }) {
    if (
      !(await this.orderService.doesOrderBelongToAccount({
        input: order,
        accountId,
      }))
    ) {
      throw new ForbiddenException({ reason: 'WRONG_ACCT' });
    }

    /**
     * Get order from EZManage
     */
    return this.orderService.getEzManageOrder({
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
    const internalOrder = await this.getInternalOrderByName({
      orderName,
      accountId,
    });
    return this.getOrder({ orderId: internalOrder.id, accountId, ref });
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

        if (order.accountId !== accountId) return { orderId, didUpdate: false };

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

  /**
   * This should really use Promise.allSettled instead
   */
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

    const results = await Promise.allSettled(
      validOrders.map(async (order) =>
        this.orderDbHandler
          .delete({ orderId: order.id })
          .then(({ didDelete }) => ({ didDelete, orderId: order.id }))
          .catch((err) => {
            throw {
              reason: err.message,
              orderId: order.id,
            };
          }),
      ),
    );

    const { deleteErrors, didDeleteOrderIds, didNotDeleteOrderIds } =
      results.reduce(
        (
          acc: {
            deleteErrors: string[];
            didDeleteOrderIds: string[];
            didNotDeleteOrderIds: string[];
          },
          result,
        ) => {
          if (result.status === 'fulfilled') {
            const val = result.value;
            if (typeof val === 'object') {
              if (val.didDelete) {
                acc.didDeleteOrderIds.push(val.orderId);
              } else {
                acc.didNotDeleteOrderIds.push(val.orderId);
              }
            }
            /** Status is "rejected" */
          } else {
            acc.deleteErrors.push(result.reason);
          }
          return acc;
        },
        {
          deleteErrors: [],
          didDeleteOrderIds: [],
          didNotDeleteOrderIds: [],
        },
      );

    return {
      deleted: didDeleteOrderIds,
      didNotDelete: didNotDeleteOrderIds,
      deleteErrors: deleteErrors,
      invalid: invalidOrderIds,
    };
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
    throw new NotImplementedException(
      'Order internal service generateLeadFromOrder not implemented',
    );
    // const internalOrder = await this.getInternalOrderByName({
    //   orderName,
    //   accountId,
    // });

    // if (!internalOrder) throw new BadRequestException('Order not found');

    // const ezManageOrder = await this.getEzManageOrder({
    //   order: internalOrder,
    //   accountId,
    //   ref,
    // });

    // const VOID_RETURN = await this.orderService.generateLeadFromOrder(
    //   ezManageOrder,
    // );
    // // return { lead, invalidKeys };
    // return VOID_RETURN;
  }

  async getInternalOrderByName({
    orderName,
    accountId,
  }: {
    orderName: string;
    accountId: string;
  }) {
    return this.orderDbHandler.findByNameForAccount(orderName, accountId);
  }
}
