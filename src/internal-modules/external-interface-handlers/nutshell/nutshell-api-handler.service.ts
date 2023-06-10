import { Injectable } from '@nestjs/common';
import { IEzManageOrder } from 'src/external-modules/ezmanage-api/interfaces/gql/responses';
import { NutshellApiService } from 'src/external-modules/nutshell-api/nutshell-api.service';

@Injectable()
export class NutshellApiHandlerService {
  constructor(private readonly nutshellApiService: NutshellApiService) {}

  async createLead(order: IEzManageOrder) {
    // return await this.nutshellApiService.createLead();
  }

  async testNutshellIntegration({
    ref,
    a,
    b,
  }: {
    ref: string;
    a: number;
    b: number;
  }) {
    try {
      return await this.nutshellApiService.add({ ref, a, b });
    } catch (err) {
      throw err;
    }
  }

  async getProducts({ ref }: { ref: any }) {
    try {
      return await this.nutshellApiService.getProducts({ ref });
    } catch (err) {
      throw err;
    }
  }
}
