import { Injectable, NotFoundException } from '@nestjs/common';
import { DbOrderStatus } from 'src/external-modules/database/enum';
import {
  IAccountModelWithId,
  IOrderModel,
  IOrderModelWithId,
} from 'src/external-modules/database/models';
import { H4HWarnings } from 'src/external-modules/database/models/H4H';
import { CrmHandlerService } from '../external-interface-handlers/crm/crm-handler.service';
import { OrderDbHandlerService } from '../external-interface-handlers/database/order-db-handler/order-db-handler.service';
import { EzmanageApiHandlerService } from '../external-interface-handlers/ezmanage-api/ezmanage-api-handler.service';
import * as Sentry from '@sentry/node';
import { IEzManageOrder } from 'src/external-modules/ezmanage-api/interfaces/gql/responses';
import { ACCOUNT_REF } from '../external-interface-handlers/database/account-db-handler/types';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderDbService: OrderDbHandlerService,
    private readonly ezManageApiHandler: EzmanageApiHandlerService,
    private readonly crmHandler: CrmHandlerService,
  ) {}

  async createOrder({
    account,
    catererId,
    orderId,
    status,
    occurredAt,
    catererName,
  }: {
    account: IAccountModelWithId;
    catererId: string;
    orderId: string;
    status: DbOrderStatus;
    occurredAt: string;
    catererName: string;
  }) {
    const { ref } = account;
    const ezManageOrder = await this.ezManageApiHandler
      .getOrder({ orderId, ref })
      .catch((reason) => {
        Sentry.withScope((scope) => {
          scope.setExtras({
            account,
            orderId,
            message: `Failed to retrieve order ${orderId}`,
          });
          Sentry.captureException(reason);
        });
        throw reason;
      });

    const crmEntity = await this.generateCRMEntityFromOrder({
      account,
      ezManageOrder,
    });

    const data = this.generateIOrderModelFromCrmEntity({
      account,
      catererId,
      ezManageOrderNumber: ezManageOrder.orderNumber,
      status,
      crmEntity,
      catererName,
    });

    await this.orderDbService.create({ orderId, data });
    return;
  }

  async generateCRMEntityFromOrder({
    account,
    ezManageOrder,
  }: {
    account: IAccountModelWithId;
    ezManageOrder: IEzManageOrder;
  }): Promise<any> {
    /**
     * Create Nutshell Lead
     */
    const crmEntity = await this.crmHandler
      .generateCRMEntity({
        account,
        order: ezManageOrder,
      })
      .catch((reason) => {
        if (typeof reason.isLogged === 'boolean' && reason.isLogged === false) {
          Sentry.captureException(reason);
          reason.isLogged = true;
        }
        return undefined;
      });

    if (
      typeof crmEntity.isSubtotalMatch === 'boolean' &&
      crmEntity.isSubtotalMatch === false
    ) {
      const { crmTag } = H4HWarnings.SUBTOTAL_MISMATCH;

      const additionalAndExistingTags: string[] = Array.isArray(crmEntity.tags)
        ? crmEntity.tags.filter((tag) => typeof tag === 'string')
        : ([] as string[]);
      additionalAndExistingTags.push(crmTag);

      await this.crmHandler.updateCRMEntityWithOrder({
        account,
        order: ezManageOrder,
        crmEntityId: crmEntity.id,
        additionalAndExistingTags,
      });
    }

    return crmEntity;
  }

  generateIOrderModelFromCrmEntity({
    account,
    catererId,
    ezManageOrderNumber,
    status,
    crmEntity,
    catererName,
  }: {
    account: IAccountModelWithId;
    crmEntity: any;
    catererId: string;
    catererName: string;
    ezManageOrderNumber: string;
    status: DbOrderStatus;
  }) {
    /**
     * @TODO fix the date issue
     */
    const now = new Date();
    const data: IOrderModel = {
      accountId: account.id,
      catererId,
      catererName,
      name: ezManageOrderNumber,
      status,
      acceptedAt: now,
      lastUpdatedAt: now,
    };

    if (crmEntity) {
      data.crmId = crmEntity.id || null;
      data.crmDescription = crmEntity.description || null;

      if (
        typeof crmEntity.isSubtotalMatch === 'boolean' &&
        crmEntity.isSubtotalMatch === false
      ) {
        const { message } = H4HWarnings.SUBTOTAL_MISMATCH;
        data.warnings = [message];
      }
    }

    return data;
  }

  async updateOrder({
    account,
    catererId,
    occurredAt,
    catererName,
    internalOrder,
  }: {
    account: IAccountModelWithId;
    catererId: string;
    occurredAt: string;
    catererName: string;
    internalOrder: IOrderModelWithId;
  }) {
    const { id: orderId, crmId } = internalOrder;
    const { ref } = account;

    /**
     * If CRM ID doesn't exist, this needs to be treated as a new order
     */
    if (crmId === undefined) {
      return await this.createOrder({
        account,
        catererId,
        orderId,
        status: DbOrderStatus.ACCEPTED,
        occurredAt,
        catererName,
      });
    }

    const ezManageOrder = await this.ezManageApiHandler.getOrder({
      orderId,
      ref,
    });

    const updateResult = await this.crmHandler.updateCRMEntityWithOrder({
      account,
      order: ezManageOrder,
      crmEntityId: crmId,
    });

    const updates: Partial<
      Omit<IOrderModel, 'accountId' | 'catererId' | 'catererName'>
    > = { lastUpdatedAt: new Date() };
    if (
      updateResult &&
      typeof updateResult === 'object' &&
      typeof updateResult.crmDescription === 'string' &&
      updateResult.crmDescription !== internalOrder.crmDescription
    ) {
      updates.crmDescription = updateResult.crmDescription;
    }
    await this.orderDbService.updateOne({
      orderId,
      updates,
    });
  }

  async handleCancelledOrder(orderId: string) {
    /**
     * This should interface with the Nutshell API and do some undetermined number of things
     */
    return;
  }

  async doesOrderBelongToAccount({
    input,
    accountId,
  }: {
    input: string | IOrderModelWithId;
    accountId: string;
  }) {
    const order =
      typeof input === 'string'
        ? await this.orderDbService.getOne(input)
        : input;

    if (!order) throw new NotFoundException();

    // console.log('Order ID: ', order.id);
    return order.accountId === accountId;
  }

  /**
   * Implementation note:
   * It would be good if whatever called this had access to the whole order - is that possible?
   */
  async getEzManageOrder({
    order,
    ref,
  }: {
    order: IOrderModelWithId;
    ref: ACCOUNT_REF;
  }) {
    return await this.ezManageApiHandler.getOrder({
      orderId: order.id,
      ref,
    });
  }

  async getOrderName({ orderId, ref }: { orderId: string; ref: ACCOUNT_REF }) {
    return this.ezManageApiHandler.getOrderName({
      orderId,
      ref,
    });
  }
}
