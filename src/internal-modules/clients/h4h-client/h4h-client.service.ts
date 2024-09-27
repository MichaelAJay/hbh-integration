import { Injectable } from '@nestjs/common';
import { getH4HCommissionInCents } from 'src/api/order/utility';
import { ConvertCentsToDollarsAndCents } from 'src/common/utility';
import { IEzManageOrder } from 'src/external-modules/ezmanage-api/interfaces/gql/responses';
import { IUpsertLeadEntity } from 'src/external-modules/nutshell-api/interfaces/requests';
import { retrievePipelineIdFromOrderSourceType } from 'src/internal-modules/external-interface-handlers/crm/accounts/H4H/constants';
import { IH4HCreateLeadCustomFields } from 'src/internal-modules/external-interface-handlers/crm/accounts/H4H/interfaces';
import {
  mapH4HMenuItemToCrmProductId,
  FormatOrderName,
} from 'src/internal-modules/external-interface-handlers/crm/accounts/H4H/utility';
import { AccountRecordWithId } from 'src/internal-modules/external-interface-handlers/database/account-db-handler/types';
import { H4HClientHelperService } from './h4h-client-helper.service';

@Injectable()
export class H4HClientService {
  constructor(private readonly h4hClientHelper: H4HClientHelperService) {}

  outputOrderToCrm({
    order,
    account,
  }: {
    order: IEzManageOrder;
    account: AccountRecordWithId;
  }) {
    try {
      const { leadProducts: products, invalidKeys } =
        this.h4hClientHelper.aggregateLeadProducts(
          order.catererCart.orderItems,
        );

      const id = mapH4HMenuItemToCrmProductId('EZCater/EZOrder Commission');
      if (id) {
        const commissionInCents = getH4HCommissionInCents(order);
        const commission = ConvertCentsToDollarsAndCents(commissionInCents);
        products.push({
          id,
          quantity: 1,
          price: { currency_shortname: 'USD', amount: commission.toString() },
        });
      }

      const lead: IUpsertLeadEntity<IH4HCreateLeadCustomFields> = {
        products,
        description: this.h4hClientHelper.getLeadName(order),
        customFields: {
          'Lead description': `This lead was generated from the EzManage order ${FormatOrderName(
            order.orderNumber,
          )}`,
        },
      };

      const stagesetId = retrievePipelineIdFromOrderSourceType(
        order.orderSourceType,
      );
      if (stagesetId) {
        lead.stagesetId = stagesetId;
      }

      const assignee = this.h4hClientHelper.getLeadAssignee({ order, account });
      if (assignee) {
        lead.assignee = { ...assignee };
      }

      return { lead, invalidKeys };
    } catch (err) {
      console.error('Order to CRM Lead failed', err);
      throw err;
    }
  }
}
