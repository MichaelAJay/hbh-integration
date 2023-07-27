import {
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
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
import { OrderHelperService } from './order-helper.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderDbService: OrderDbHandlerService,
    private readonly ezManageApiHandler: EzmanageApiHandlerService,
    private readonly crmHandler: CrmHandlerService,
    private readonly orderHelperService: OrderHelperService,
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

    const data = this.orderHelperService.generateIOrderModelFromCrmEntity({
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

    if (crmEntity === undefined) return crmEntity;

    if (
      typeof crmEntity.id === 'string' &&
      typeof crmEntity.isSubtotalMatch === 'boolean' &&
      crmEntity.isSubtotalMatch === false
    ) {
      const { crmTag } = H4HWarnings.SUBTOTAL_MISMATCH;

      const additionalAndExistingTags: string[] = Array.isArray(crmEntity.tags)
        ? crmEntity.tags.filter((tag) => typeof tag === 'string')
        : ([] as string[]);
      additionalAndExistingTags.push(crmTag);

      /**
       * This returns something useful - why isn't it being used?
       */
      await this.crmHandler.updateCRMEntityWithOrder({
        account,
        order: ezManageOrder,
        crmEntityId: crmEntity.id,
        additionalAndExistingTags,
      });
    }

    return crmEntity;
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

    const ezManageOrder = await this.ezManageApiHandler.getOrder({
      orderId,
      ref,
    });

    let updates: Partial<
      Omit<IOrderModel, 'accountId' | 'catererId' | 'catererName'>
    > = { lastUpdatedAt: new Date() };
    let requiresUpdate = false;

    if (crmId === undefined) {
      const crmEntity = await this.generateCRMEntityFromOrder({
        account,
        ezManageOrder,
      });
      updates = this.orderHelperService.tryAppendCrmDataToOrder({
        order: updates,
        crmEntity,
      });
      requiresUpdate =
        'crmId' in updates ||
        'crmDescription' in updates ||
        'warnings' in updates;
    } else {
      const updateResult = await this.crmHandler.updateCRMEntityWithOrder({
        account,
        order: ezManageOrder,
        crmEntityId: crmId,
      });

      if (
        updateResult &&
        typeof updateResult === 'object' &&
        typeof updateResult.crmDescription === 'string' &&
        updateResult.crmDescription !== internalOrder.crmDescription
      ) {
        updates.crmDescription = updateResult.crmDescription;
        requiresUpdate = true;
      }
    }

    if (requiresUpdate) {
      await this.orderDbService.updateOne({
        orderId,
        updates,
      });
    }
  }

  async handleCancelledOrder(orderId: string) {
    throw new NotImplementedException();
    /**
     * This should interface with the Nutshell API and do some undetermined number of things
     */
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

    if (!order) {
      throw new NotFoundException();
    }

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
    return this.ezManageApiHandler.getOrder({
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
