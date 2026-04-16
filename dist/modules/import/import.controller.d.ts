import { OrdersService } from '../orders/orders.service';
export declare class ImportController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    importProducts(body: any, businessId: string): Promise<{
        success: boolean;
        count: number;
    }>;
}
