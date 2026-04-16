import { Controller, Get, Post, Param, Body, Headers } from '@nestjs/common';
import { BusinessesService } from './businesses.service';

@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Get()
  async getAll() {
    return this.businessesService.findAll();
  }

  @Post()
  async create(
    @Body() body: { name: string; businessType?: string; brandColor?: string; currency?: string },
    @Headers('authorization') auth: string,
  ) {
    return this.businessesService.create(body, auth);
  }

  @Post(':id/pos-config')
  async savePosConfig(
    @Param('id') id: string,
    @Body() body: { config: any },
  ) {
    return this.businessesService.savePosConfig(id, body.config);
  }

  @Get(':slug')
  async getOne(@Param('slug') slug: string) {
    return this.businessesService.findBySlug(slug);
  }
}