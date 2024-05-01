import { Module } from '@nestjs/common';
import { InvoiceflowService } from './invoiceflow.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [InvoiceflowService],
  exports: [InvoiceflowService],
})
export class InvoiceflowModule {}
