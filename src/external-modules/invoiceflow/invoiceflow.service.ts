import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InvoiceFlowInvoiceData } from './generate-invoice.type';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class InvoiceflowService {
  constructor(private readonly httpService: HttpService) {}

  async generateInvoice(data: InvoiceFlowInvoiceData) {
    const result = this.httpService.post(
      'http://localhost:8000/generate-invoice',
      data,
    );
    const resolvedResult = await lastValueFrom(result);
    return resolvedResult;
  }
}
