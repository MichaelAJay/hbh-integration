import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { Public } from 'src/decorators';
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
}
