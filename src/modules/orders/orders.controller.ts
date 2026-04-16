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
  BadRequestException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /** GET /orders/active — mesas abiertas (pending + active) */
  @Get('active')
  getActiveOrders(@Headers('x-business-id') businessId: string) {
    return this.ordersService.getActiveOrders(businessId);
  }

  /** GET /orders/analytics?period=month&months=6 */
  @Get('analytics')
  getAnalytics(
    @Headers('x-business-id') businessId: string,
    @Query('period') period = 'month',
    @Query('months') months = '6',
  ) {
    return this.ordersService.getAnalytics(businessId, period, parseInt(months, 10));
  }

  /** GET /orders/table/:tableId — busca o crea orden para la mesa */
  @Get('table/:tableId')
  getTableOrder(
    @Param('tableId') tableId: string,
    @Headers('x-business-id') businessId: string,
  ) {
    return this.ordersService.getOrCreateOrder(tableId, businessId);
  }

  /** POST /orders/add-item */
  @Post('add-item')
  async addItem(
    @Body() body: { tableId: string; productId: string; quantity: number },
    @Headers('x-business-id') businessId: string,
  ) {
    const { tableId, productId, quantity } = body;

    if (!tableId || !productId || !quantity) {
      throw new BadRequestException('tableId, productId y quantity son requeridos');
    }

    const order = await this.ordersService.getOrCreateOrder(tableId, businessId);
    return this.ordersService.addItemToOrder(order.id, productId, quantity, businessId);
  }

  /** PATCH /orders/item/:itemId — actualiza cantidad de un item */
  @Patch('item/:itemId')
  updateItem(
    @Param('itemId') itemId: string,
    @Body() body: { quantity: number },
  ) {
    return this.ordersService.updateItemQuantity(itemId, body.quantity);
  }

  /** DELETE /orders/item/:itemId — elimina un item */
  @Delete('item/:itemId')
  deleteItem(@Param('itemId') itemId: string) {
    return this.ordersService.removeItem(itemId);
  }

  /** PATCH /orders/:orderId/mark-delivered — pending → active */
  @Patch(':orderId/mark-delivered')
  markAsDelivered(@Param('orderId') orderId: string) {
    return this.ordersService.markAsDelivered(orderId);
  }

  /** PATCH /orders/:orderId/reopen — active → pending */
  @Patch(':orderId/reopen')
  reopenOrder(@Param('orderId') orderId: string) {
    return this.ordersService.reopenOrder(orderId);
  }

  /** POST /orders/close/:orderId — cierra la orden y registra el pago */
  @Post('close/:orderId')
  closeOrder(
    @Param('orderId') orderId: string,
    @Body() body: { payment_method?: string } = {},
  ) {
    return this.ordersService.closeOrder(orderId, body.payment_method);
  }
}
