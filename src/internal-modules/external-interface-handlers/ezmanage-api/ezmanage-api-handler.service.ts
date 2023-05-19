import { Injectable } from '@nestjs/common';
import { EzmanageApiService } from 'src/external-modules/ezmanage-api/ezmanage-api.service';

@Injectable()
export class EzmanageApiHandlerService {
  constructor(private readonly ezManageApiService: EzmanageApiService) {}

  async getOrder({ orderId, ref }: { orderId: string; ref: string }) {
    return await this.ezManageApiService.getOrder(orderId, ref);
  }

  async getOrderName({ orderId, ref }: { orderId: string; ref: string }) {
    return await this.ezManageApiService.getOrderName({
      orderId,
      ref,
    });
  }
}
