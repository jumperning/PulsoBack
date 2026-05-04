import { SupabaseService } from '../../supabase/supabase.service';
export declare class OrdersService {
    private readonly supabaseService;
    private readonly logger;
    private readonly supabase;
    constructor(supabaseService: SupabaseService);
    getActiveOrders(businessId: string): Promise<any>;
    getOrCreateOrder(tableId: string, businessId: string): Promise<any>;
    addItemToOrder(orderId: string, productId: string, quantity: number, businessId: string): Promise<{
        success: boolean;
        data: any;
    }>;
    updateItemQuantity(itemId: string, quantity: number): Promise<{
        success: boolean;
    } | {
        success: boolean;
        data: any;
    }>;
    removeItem(itemId: string): Promise<{
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
    closeOrder(orderId: string, paymentMethod?: string): Promise<{
        success: boolean;
        data: any;
    }>;
    importOrders(body: any, businessId: string): Promise<{
        ok: number;
        fail: number;
    }>;
    importProducts(rows: any[], businessId: string): Promise<{
        success: boolean;
        count: number;
    }>;
    getAnalytics(businessId: string, period: string, months?: number): Promise<{
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
    private findOrderOrFail;
    private updateOrderStatus;
    private fetchClosedOrders;
    private getPeriodStart;
    private calcOrderTotal;
    private calcItemCount;
}
