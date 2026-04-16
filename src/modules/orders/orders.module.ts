import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ImportController } from '../import/import.controller';

@Module({
  controllers: [OrdersController, ImportController],
  providers: [OrdersService],
  
  exports: [OrdersService],
})
export class OrdersModule {}