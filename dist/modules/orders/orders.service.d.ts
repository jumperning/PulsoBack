import { SupabaseService } from '../../supabase/supabase.service';
export declare class OrdersService {
    private readonly supabaseService;
    private readonly logger;
    private readonly supabase;
    constructor(supabaseService: SupabaseService);
    addItem(tableId: string, productId: string, quantity: number): Promise<any>;
    importOrders(body: any): Promise<{
        ok: number;
        fail: number;
    }>;
    reopenOrder(orderId: string): Promise<{
        success: boolean;
        data: any;
    }>;
    addItemToOrder(tableId: string, productId: string, quantity: number, businessId: string): Promise<{
        success: boolean;
    }>;
    updateItemQuantity(itemId: string, quantity: number): Promise<{
        success: boolean;
        data?: any;
    }>;
    getActiveOrders(businessId: string): Promise<any>;
    getOrCreateOrder(tableId: string, businessId: string): Promise<any>;
    markAsDelivered(orderId: string): Promise<{
        success: boolean;
        data: any;
    }>;
    closeOrder(orderId: string, paymentMethod?: string): Promise<{
        success: boolean;
        data: any;
    }>;
    removeItem(itemId: string): Promise<{
        success: boolean;
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
}
