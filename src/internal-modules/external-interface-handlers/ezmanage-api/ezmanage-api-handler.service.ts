import { Injectable } from '@nestjs/common';
import { EzmanageApiService } from 'src/external-modules/ezmanage-api/ezmanage-api.service';
import { ACCOUNT_REF } from '../database/account-db-handler/types';

@Injectable()
export class EzmanageApiHandlerService {
  constructor(private readonly ezManageApiService: EzmanageApiService) {}

  async getOrder({ orderId, ref }: { orderId: string; ref: ACCOUNT_REF }) {
    try {
      return await this.ezManageApiService.getOrder(orderId, ref);
    } catch (err) {
      throw err;
    }
  }

  async getOrderName({ orderId, ref }: { orderId: string; ref: ACCOUNT_REF }) {
    return await this.ezManageApiService.getOrderName({
      orderId,
      ref,
    });
  }

  async getCatererMenu({ catererId, ref }: { catererId: string; ref: string }) {
    const { menu } = await this.ezManageApiService.getCatererMenu({
      catererId,
      ref,
    });

    const menuItemSet = new Set<string>();
    for (const category of menu.categories) {
      for (const item of category.items) {
        if (item.status === 'SHOW') menuItemSet.add(item.name);
      }
    }

    return Array.from(menuItemSet).sort((a, b) => {
      if (a < b) {
        return -1;
      } else if (a > b) {
        return 1;
      }
      return 0;
    });
  }
}
