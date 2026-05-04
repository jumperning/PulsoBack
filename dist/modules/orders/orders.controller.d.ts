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
    addItem(body: {
        tableId: string;
        productId: string;
        quantity: number;
    }, businessId: string): Promise<{
        success: boolean;
        data: any;
    }>;
    updateItem(itemId: string, body: {
        quantity: number;
    }): Promise<{
        success: boolean;
    } | {
        success: boolean;
        data: any;
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
    closeOrder(orderId: string, body?: {
        payment_method?: string;
    }): Promise<{
        success: boolean;
        data: any;
    }>;
    importOrders(orders: any[], businessId: string): Promise<{
        ok: number;
        fail: number;
    }>;
}
