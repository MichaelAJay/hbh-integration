import { Injectable, NotFoundException } from '@nestjs/common';
import { DbOrderStatus } from 'src/external-modules/database/enum';
import {
  IAccountModelWithId,
  IOrderModel,
  IOrderModelWithId,
} from 'src/external-modules/database/models';
import { H4HWarnings } from 'src/external-modules/database/models/H4H';
import { CustomLoggerService } from 'src/support-modules/custom-logger/custom-logger.service';
import { CrmHandlerService } from '../external-interface-handlers/crm/crm-handler.service';
import { AccountDbHandlerService } from '../external-interface-handlers/database/account-db-handler/account-db-handler.service';
import { OrderDbHandlerService } from '../external-interface-handlers/database/order-db-handler/order-db-handler.service';
import { EzmanageApiHandlerService } from '../external-interface-handlers/ezmanage-api/ezmanage-api-handler.service';
import * as Sentry from '@sentry/node';

@Injectable()
export class OrderService {
  constructor(
    private readonly accountDbService: AccountDbHandlerService,
    private readonly orderDbService: OrderDbHandlerService,
    private readonly ezManageApiHandler: EzmanageApiHandlerService,
    private readonly crmHandler: CrmHandlerService,
    private readonly logger: CustomLoggerService,
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
    const data = await this.generateCRMEntityFromOrder({
      account,
      catererId,
      orderId,
      status,
      occurredAt,
      catererName,
    });

    await this.orderDbService.create({ orderId, data });
    return;
  }

  async generateCRMEntityFromOrder({
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
  }): Promise<IOrderModel> {
    const { ref } = account;
    const ezManageOrder = await this.ezManageApiHandler
      .getOrder({ orderId, ref })
      .catch((reason) => {
        const msg = `Failed to retrieve order ${orderId}`;
        this.logger.error(msg, reason);
        throw reason;
      });

    /**
     * Create Nutshell Lead
     */
    const generatedCRMEntity = await this.crmHandler
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

    /**
     * @TODO fix the date issue
     */
    const now = new Date();
    const data: IOrderModel = {
      accountId: account.id,
      catererId,
      catererName,
      name: ezManageOrder.orderNumber || 'PLACEHOLDER NAME',
      status,
      acceptedAt: now,
      lastUpdatedAt: now,
    };

    if (generatedCRMEntity) {
      data.crmId = generatedCRMEntity.id || null;
      data.crmDescription = generatedCRMEntity.description || null;

      if (
        typeof generatedCRMEntity.isSubtotalMatch === 'boolean' &&
        generatedCRMEntity.isSubtotalMatch === false
      ) {
        const { message, crmTag } = H4HWarnings.SUBTOTAL_MISMATCH;
        data.warnings = [message];

        const additionalAndExistingTags: string[] = Array.isArray(
          generatedCRMEntity.tags,
        )
          ? generatedCRMEntity.tags.filter((tag) => typeof tag === 'string')
          : ([] as string[]);
        additionalAndExistingTags.push(crmTag);

        await this.crmHandler.updateCRMEntityWithOrder({
          account,
          order: ezManageOrder,
          crmEntityId: generatedCRMEntity.id,
          additionalAndExistingTags,
        });
      }
    }

    // Need to convert accountId and catererId to references

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

    const ezManageOrder = await this.ezManageApiHandler
      .getOrder({ orderId, ref })
      .catch((reason) => {
        const msg = `Failed to retrieve order ${orderId}`;
        this.logger.error(msg, reason);
        throw reason;
      });

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

    const updateResult = await this.crmHandler.updateCRMEntityWithOrder({
      account,
      order: ezManageOrder,
      crmEntityId: internalOrder.crmId as string,
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
    ref: string;
  }) {
    return await this.ezManageApiHandler.getOrder({
      orderId: order.id,
      ref,
    });
  }

  async getOrderName({ orderId, ref }: { orderId: string; ref: string }) {
    return this.ezManageApiHandler.getOrderName({
      orderId,
      ref,
    });
  }
}
