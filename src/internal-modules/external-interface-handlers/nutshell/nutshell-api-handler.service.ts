import { Injectable } from '@nestjs/common';
import { NutshellApiService } from 'src/external-modules/nutshell-api/nutshell-api.service';

@Injectable()
export class NutshellApiHandlerService {
  constructor(private readonly nutshellApiService: NutshellApiService) {}

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
}
