import { Injectable } from '@nestjs/common';

@Injectable()
export class EzmanageApiHandlerService {
  async getOrder(orderId: string) {
    throw new Error('Method not implemented.');
  }
}
