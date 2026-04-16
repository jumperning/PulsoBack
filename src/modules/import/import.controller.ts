import { Controller, Post, Body, Headers } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';

@Controller('import')
export class ImportController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('products')
  async importProducts(
    @Body() body: any,
    @Headers('x-business-id') businessId: string,
  ) {
    return this.ordersService.importProducts(body.products, businessId);
  }
}