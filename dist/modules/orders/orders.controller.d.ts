import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    getActiveOrders(businessId: string): Promise<any>;
    getAnalytics(businessId: string, period?: string, months?: string): Promise<{
        period: string;
        kpis: {
            total_sales: number;
            total_sales_pct: number;
            order_count: any;
            order_count_pct: number;
            avg_ticket: number;
            avg_ticket_pct: number;
            payment_breakdown: Record<string, number>;
        };
        monthly_chart: {
            labels: string[];
            values: number[];
        };
        category_sales: {
            name: string;
            total: number;
        }[];
        top_products: any[];
        recent_orders: any;
    }>;
    getTableOrder(tableId: string, businessId: string): Promise<any>;
    addItem(data: {
        tableId: string;
        productId: string;
        quantity: number;
    }, businessId: string): Promise<{
        success: boolean;
    }>;
    updateItem(itemId: string, data: {
        quantity: number;
    }): Promise<{
        success: boolean;
        data?: any;
    }>;
    deleteItem(itemId: string): Promise<{
        success: boolean;
    }>;
    markAsDelivered(orderId: string): Promise<{
        success: boolean;
        data: any;
    }>;
    reopenOrder(orderId: string): Promise<{
        success: boolean;
        data: any;
    }>;
    closeOrder(orderId: string, data?: {
        payment_method?: string;
    }): Promise<{
        success: boolean;
        data: any;
    }>;
}
