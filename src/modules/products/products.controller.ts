import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Headers,
  NotFoundException,
} from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Headers('x-business-id') businessId: string) {
    console.log('BUSINESS ID BACK:', businessId);
    return this.productsService.findAll(businessId);
  }

  @Post()
  async create(
    @Body() createData: any,
    @Headers('x-business-id') businessId: string,
  ) {
    return this.productsService.create(createData, businessId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: any,
    @Headers('x-business-id') businessId: string,
  ) {
    const updated = await this.productsService.update(id, updateData, businessId);
    if (!updated) throw new NotFoundException('Producto no encontrado');
    return updated;
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Headers('x-business-id') businessId: string,
  ) {
    const deleted = await this.productsService.remove(id, businessId);
    if (!deleted) throw new NotFoundException('Producto no encontrado');
    return deleted;
  }
}