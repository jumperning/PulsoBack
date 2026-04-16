import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Headers,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /** GET /orders/active — mesas abiertas (pending + active) */
  @Get('active')
  async getActiveOrders(@Headers('x-business-id') businessId: string) {
    return this.ordersService.getActiveOrders(businessId);
  }

  /** GET /orders/analytics */
  @Get('analytics')
  async getAnalytics(
    @Headers('x-business-id') businessId: string,
    @Query('period') period: string = 'month',
    @Query('months') months: string = '6',
  ) {
    return this.ordersService.getAnalytics(businessId, period, parseInt(months));
  }

  /** GET /orders/table/:tableId — busca o crea orden */
  @Get('table/:tableId')
  async getTableOrder(
    @Param('tableId') tableId: string,
    @Headers('x-business-id') businessId: string,
  ) {
    return this.ordersService.getOrCreateOrder(tableId, businessId);
  }

  /** POST /orders/add-item */
@Post('add-item')
async addItem(
  @Body() data: { tableId: string; productId: string; quantity: number },
  @Headers('x-business-id') businessId: string,
) {
  const order = await this.ordersService.getOrCreateOrder(data.tableId, businessId);

  return this.ordersService.addItemToOrder(
    order.id, // ✅ ahora sí
    data.productId,
    data.quantity,
    businessId,
  );
}

  /** PATCH /orders/item/:itemId */
  @Patch('item/:itemId')
  async updateItem(
    @Param('itemId') itemId: string,
    @Body() data: { quantity: number },
  ) {
    return this.ordersService.updateItemQuantity(itemId, data.quantity);
  }

  /** DELETE /orders/item/:itemId */
  @Delete('item/:itemId')
  async deleteItem(@Param('itemId') itemId: string) {
    return this.ordersService.removeItem(itemId);
  }

  /**
   * 🆕 PATCH /orders/:orderId/mark-delivered
   * Cambia de pending → active
   */
  @Patch(':orderId/mark-delivered')
  async markAsDelivered(@Param('orderId') orderId: string) {
    return this.ordersService.markAsDelivered(orderId);
  }

  /**
   * 🆕 (opcional) volver a pendiente
   */
  @Patch(':orderId/reopen')
  async reopenOrder(@Param('orderId') orderId: string) {
    return this.ordersService.reopenOrder(orderId);
  }

  /**
   * POST /orders/close/:orderId
   * active → closed
   */
  @Post('close/:orderId')
  async closeOrder(
    @Param('orderId') orderId: string,
    @Body() data: { payment_method?: string } = {},
  ) {
    return this.ordersService.closeOrder(orderId, data.payment_method);
  }
}
