import { Controller, Get, Post, Body } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('businesses')
  getAllBusinesses() {
    return this.adminService.getAllBusinesses();
  }

  @Post('businesses')
  createBusiness(@Body() body: { name: string; businessType?: string }) {
    return this.adminService.createBusiness(body);
  }

  @Get('stats')
  getPlatformStats() {
    return this.adminService.getPlatformStats();
  }
}
