import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from 'src/guards/admin.guard';
import { AdminService } from './admin.service';
import { AdminCreateUserBodyDto, GetCrmProductsBodyDto } from './dtos/body';
import { SentOrderToCrmQueryDto } from './dtos/query';

@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('create-user')
  async createUser(@Body() body: AdminCreateUserBodyDto) {
    return this.adminService.createUser(body);
  }

  @Get('order-names-for-account/:id')
  async getOrderNamesForAccount(@Param('id') accountId: string) {
    return this.adminService.getOrderNamesForAccount(accountId);
  }

  @Get('get-crm-products')
  async getCrmProducts(
    @Body() { 'account-id': accountId }: GetCrmProductsBodyDto,
  ) {
    return this.adminService.getCrmProducts({ accountId });
  }

  @Get('caterer-menu/:catererId')
  async getCatererMenu(@Param('catererId') catererId: string) {
    return this.adminService.getCatererMenu({ catererId });
  }

  /**
   * Thoughts:  While writing this route, always be mindful that there may be configurable
   * CRM options
   *
   * Also, note that whatever is available in the authenticated user's JWT should be sent
   * as query parameters, along with the order-id
   */
  @Post('send-order-to-crm')
  async sendOrderToCrm(@Query() query: SentOrderToCrmQueryDto) {
    return this.adminService.sendEzManageOrderToCrm(query);
  }
}
