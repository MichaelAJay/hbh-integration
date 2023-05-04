import { Injectable } from '@nestjs/common';

@Injectable()
export class EzmanageSubscriberService {
  /**
   * Employ some sort of graphql client I guess
   */
  async receiveOrder() {
    throw new Error('Method not implemented.');
  }
}
