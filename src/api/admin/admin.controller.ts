import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from 'src/guards/admin.guard';
import { AdminService } from './admin.service';
import { AdminCreateUserBodyDto } from './dtos/body';

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

  @Post('test-nutshell-integration')
  async testNutshellIntegration(
    @Body() { ref, a, b }: { ref: string; a: number; b: number },
  ) {
    if (!(Number.isInteger(a) && Number.isInteger(b)))
      throw new BadRequestException('Both parameters must be integers');
    return this.adminService.testNutshellIntegration({ ref, a, b });
  }
}
