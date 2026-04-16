"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let OrdersService = OrdersService_1 = class OrdersService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
        this.logger = new common_1.Logger(OrdersService_1.name);
        this.supabase = supabaseService.getClient();
    }
    async addItem(tableId, productId, quantity) {
        const { data: order, error: searchError } = await this.supabase
            .from('orders')
            .select('*')
            .eq('tableId', tableId)
            .eq('status', 'open')
            .maybeSingle();
        let currentOrder = order;
        if (!currentOrder) {
            const { data: newOrder, error: createError } = await this.supabase
                .from('orders')
                .insert([{ tableId, status: 'open', total: 0 }])
                .select()
                .single();
            if (createError)
                throw new Error('No se pudo crear la orden');
            currentOrder = newOrder;
        }
        const { data: item, error: itemError } = await this.supabase
            .from('order_items')
            .insert([{
                orderId: currentOrder.id,
                productId: productId,
                quantity: quantity
            }])
            .select();
        if (itemError)
            throw new Error('No se pudo agregar el item');
        return item;
    }
    async importOrders(body) {
        const { orders, withItems } = body;
        let ok = 0;
        let fail = 0;
        for (const row of orders) {
            try {
                const { data: order, error: orderError } = await this.supabase
                    .from('orders')
                    .insert([
                    {
                        business_id: row.business_id,
                        table_id: row.table_id,
                        total: row.total,
                        payment_method: row.payment_method,
                        status: row.status || 'closed',
                        created_at: row.created_at || new Date().toISOString(),
                        closed_at: row.closed_at || row.created_at || new Date().toISOString(),
                    },
                ])
                    .select()
                    .single();
                if (orderError)
                    throw orderError;
                if (withItems && row._items?.length) {
                    for (const item of row._items) {
                        let { data: product } = await this.supabase
                            .from('products')
                            .select('*')
                            .eq('name', item.nombre)
                            .eq('business_id', order.business_id)
                            .maybeSingle();
                        if (!product) {
                            const { data: newProduct, error: productError } = await this.supabase
                                .from('products')
                                .insert([
                                {
                                    name: item.nombre,
                                    price: item.precio,
                                    business_id: order.business_id,
                                    is_active: true,
                                },
                            ])
                                .select()
                                .single();
                            if (productError)
                                throw productError;
                            product = newProduct;
                        }
                        const { error: itemError } = await this.supabase
                            .from('order_items')
                            .insert([
                            {
                                order_id: order.id,
                                product_id: product.id,
                                quantity: item.qty,
                                unit_price: item.precio || 0,
                                unit_cost: item.costo || 0,
                            },
                        ]);
                        if (itemError)
                            throw itemError;
                    }
                }
                ok++;
            }
            catch (error) {
                console.error('Error importando orden:', error);
                fail++;
            }
        }
        return { ok, fail };
    }
    async reopenOrder(orderId) {
        const { data: order, error: fetchError } = await this.supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();
        if (fetchError || !order) {
            throw new common_1.NotFoundException('Orden no encontrada');
        }
        if (order.status !== 'closed') {
            throw new common_1.BadRequestException(`Solo se pueden reabrir órdenes cerradas (estado actual: ${order.status})`);
        }
        const { data, error } = await this.supabase
            .from('orders')
            .update({ status: 'open', closed_at: null })
            .eq('id', orderId)
            .select()
            .single();
        if (error) {
            this.logger.error(`reopenOrder: ${error.message}`);
            throw new common_1.InternalServerErrorException(error.message);
        }
        return { success: true, data };
    }
    async addItemToOrder(tableId, productId, quantity, businessId) {
        const { data: order } = await this.supabase
            .from('orders')
            .select('id')
            .eq('table_id', tableId)
            .eq('business_id', businessId)
            .in('status', ['pending', 'active'])
            .maybeSingle();
        let currentOrderId;
        if (!order) {
            const { data: newOrder, error: createError } = await this.supabase
                .from('orders')
                .insert([{
                    table_id: tableId,
                    business_id: businessId,
                    status: 'pending'
                }])
                .select()
                .single();
            if (createError)
                throw createError;
            currentOrderId = newOrder.id;
        }
        else {
            currentOrderId = order.id;
        }
        const { error: itemError } = await this.supabase
            .from('order_items')
            .insert([{
                order_id: currentOrderId,
                product_id: productId,
                quantity: quantity
            }]);
        if (itemError)
            throw itemError;
        return { success: true };
    }
    async updateItemQuantity(itemId, quantity) {
        if (quantity <= 0) {
            return this.removeItem(itemId);
        }
        const { data, error } = await this.supabase
            .from('order_items')
            .update({ quantity })
            .eq('id', itemId)
            .select('*, products(*)')
            .single();
        if (error) {
            this.logger.error(`updateItemQuantity ${itemId}: ${error.message}`);
            throw new common_1.InternalServerErrorException(error.message);
        }
        return { success: true, data };
    }
    async getActiveOrders(businessId) {
        const { data, error } = await this.supabase
            .from('orders')
            .select('*, order_items(*, products(*))')
            .eq('business_id', businessId)
            .in('status', ['pending', 'open']);
        if (error) {
            this.logger.error(`getActiveOrders: ${error.message}`);
            throw new common_1.InternalServerErrorException(error.message);
        }
        return (data || []).map((order) => ({
            ...order,
            total: (order.order_items || []).reduce((sum, item) => sum + (item.products?.price || 0) * item.quantity, 0),
            item_count: (order.order_items || []).reduce((sum, item) => sum + item.quantity, 0),
        }));
    }
    async getOrCreateOrder(tableId, businessId) {
        const { data: order, error: searchError } = await this.supabase
            .from('orders')
            .select('*')
            .eq('table_id', tableId)
            .eq('business_id', businessId)
            .in('status', ['pending', 'open'])
            .maybeSingle();
        if (searchError) {
            this.logger.error(`getOrCreateOrder: ${searchError.message}`);
            throw new common_1.InternalServerErrorException(searchError.message);
        }
        if (order) {
            const { data: items } = await this.supabase
                .from('order_items')
                .select('*, products(*)')
                .eq('order_id', order.id);
            return { ...order, order_items: items || [] };
        }
        const { data: newOrder, error: createError } = await this.supabase
            .from('orders')
            .insert([{ table_id: tableId, business_id: businessId, status: 'pending', total: 0 }])
            .select()
            .single();
        if (createError) {
            this.logger.error(`createOrder: ${createError.message}`);
            throw new common_1.InternalServerErrorException(createError.message);
        }
        return { ...newOrder, order_items: [] };
    }
    async markAsDelivered(orderId) {
        const { data: order, error: fetchError } = await this.supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();
        if (fetchError || !order) {
            throw new common_1.NotFoundException('Orden no encontrada');
        }
        if (order.status !== 'pending') {
            throw new common_1.BadRequestException(`La orden no está en estado pendiente (estado actual: ${order.status})`);
        }
        const { data, error } = await this.supabase
            .from('orders')
            .update({ status: 'open', delivered_at: new Date().toISOString() })
            .eq('id', orderId)
            .select()
            .single();
        if (error) {
            this.logger.error(`markAsDelivered: ${error.message}`);
            throw new common_1.InternalServerErrorException(error.message);
        }
        return { success: true, data };
    }
    async closeOrder(orderId, paymentMethod = 'cash') {
        const { data: order, error: fetchError } = await this.supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();
        if (fetchError || !order) {
            throw new common_1.NotFoundException('Orden no encontrada');
        }
        if (order.status === 'closed') {
            throw new common_1.BadRequestException('La orden ya está cerrada');
        }
        const { data, error } = await this.supabase
            .from('orders')
            .update({
            status: 'closed',
            closed_at: new Date().toISOString(),
            payment_method: paymentMethod,
        })
            .eq('id', orderId)
            .select()
            .single();
        if (error) {
            this.logger.error(`closeOrder: ${error.message}`);
            throw new common_1.InternalServerErrorException(error.message);
        }
        return { success: true, data };
    }
    async removeItem(itemId) {
        const { error } = await this.supabase
            .from('order_items')
            .delete()
            .eq('id', itemId);
        if (error) {
            this.logger.error(`removeItem ${itemId}: ${error.message}`);
            throw new common_1.InternalServerErrorException(error.message);
        }
        return { success: true };
    }
    async importProducts(rows, businessId) {
        const products = rows.map((row) => ({
            name: row.nombre || row.name || row.producto,
            price: Number(row.precio || row.price || 0),
            category: row.categoria || row.category || 'General',
            stock: Number(row.stock || 0),
            description: row.descripcion || row.description || '',
            business_id: businessId,
        }));
        const { error } = await this.supabase.from('products').insert(products).select();
        if (error) {
            this.logger.error(`importProducts: ${error.message}`);
            throw new common_1.InternalServerErrorException(error.message);
        }
        return { success: true, count: products.length };
    }
    async getAnalytics(businessId, period, months = 6) {
        const now = new Date();
        let periodStart;
        if (period === 'today') {
            periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        }
        else if (period === 'week') {
            const day = now.getDay();
            periodStart = new Date(now);
            periodStart.setDate(now.getDate() - day);
            periodStart.setHours(0, 0, 0, 0);
        }
        else if (period === 'year') {
            periodStart = new Date(now.getFullYear(), 0, 1);
        }
        else {
            periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        const periodMs = now.getTime() - periodStart.getTime();
        const prevEnd = new Date(periodStart);
        const prevStart = new Date(periodStart.getTime() - periodMs);
        const { data: currentOrders, error: currentError } = await this.supabase
            .from('orders')
            .select('*, order_items(*, products(*))')
            .eq('business_id', businessId)
            .eq('status', 'closed')
            .gte('closed_at', periodStart.toISOString())
            .lte('closed_at', now.toISOString());
        if (currentError) {
            this.logger.error(`analytics current: ${currentError.message}`);
            throw new common_1.InternalServerErrorException(currentError.message);
        }
        const { data: prevOrders } = await this.supabase
            .from('orders')
            .select('id, order_items(quantity, products(price))')
            .eq('business_id', businessId)
            .eq('status', 'closed')
            .gte('closed_at', prevStart.toISOString())
            .lt('closed_at', prevEnd.toISOString());
        const chartStart = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
        const { data: chartOrders } = await this.supabase
            .from('orders')
            .select('closed_at, order_items(quantity, products(price))')
            .eq('business_id', businessId)
            .eq('status', 'closed')
            .gte('closed_at', chartStart.toISOString());
        const calcTotal = (orders) => (orders || []).reduce((sum, o) => sum +
            (o.order_items || []).reduce((s, i) => s + (i.products?.price || 0) * (i.quantity || 0), 0), 0);
        const currentTotal = calcTotal(currentOrders || []);
        const prevTotal = calcTotal(prevOrders || []);
        const currentCount = (currentOrders || []).length;
        const prevCount = (prevOrders || []).length;
        const avgTicket = currentCount > 0 ? currentTotal / currentCount : 0;
        const prevAvgTicket = prevCount > 0 ? prevTotal / prevCount : 0;
        const pct = (curr, prev) => prev === 0 ? null : Math.round(((curr - prev) / prev) * 100);
        const paymentBreakdown = {};
        (currentOrders || []).forEach((o) => {
            const method = o.payment_method || 'cash';
            const total = (o.order_items || []).reduce((s, i) => s + (i.products?.price || 0) * (i.quantity || 0), 0);
            paymentBreakdown[method] = (paymentBreakdown[method] || 0) + total;
        });
        const monthLabels = [];
        const monthTotals = [];
        for (let m = 0; m < months; m++) {
            const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - m), 1);
            const nextD = new Date(d.getFullYear(), d.getMonth() + 1, 1);
            const label = d.toLocaleString('es-AR', { month: 'short' }).replace('.', '');
            const monthTotal = (chartOrders || [])
                .filter((o) => {
                const t = new Date(o.closed_at);
                return t >= d && t < nextD;
            })
                .reduce((sum, o) => sum +
                (o.order_items || []).reduce((s, i) => s + (i.products?.price || 0) * (i.quantity || 0), 0), 0);
            monthLabels.push(label);
            monthTotals.push(Math.round(monthTotal));
        }
        const categoryMap = {};
        (currentOrders || []).forEach((o) => {
            (o.order_items || []).forEach((item) => {
                const cat = item.products?.category || 'Sin categoría';
                const total = (item.products?.price || 0) * (item.quantity || 0);
                categoryMap[cat] = (categoryMap[cat] || 0) + total;
            });
        });
        const categorySales = Object.entries(categoryMap)
            .map(([name, total]) => ({ name, total: Math.round(total) }))
            .sort((a, b) => b.total - a.total);
        const productMap = {};
        (currentOrders || []).forEach((o) => {
            (o.order_items || []).forEach((item) => {
                const id = item.product_id;
                if (!productMap[id]) {
                    productMap[id] = {
                        name: item.products?.name || 'Producto',
                        category: item.products?.category || '',
                        qty: 0,
                        revenue: 0,
                    };
                }
                productMap[id].qty += item.quantity || 0;
                productMap[id].revenue += (item.products?.price || 0) * (item.quantity || 0);
            });
        });
        const topProducts = Object.values(productMap)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5)
            .map((p) => ({ ...p, revenue: Math.round(p.revenue) }));
        const { data: recentOrders } = await this.supabase
            .from('orders')
            .select('id, table_id, closed_at, payment_method, order_items(quantity, products(price, name))')
            .eq('business_id', businessId)
            .eq('status', 'closed')
            .order('closed_at', { ascending: false })
            .limit(20);
        const recentFormatted = (recentOrders || []).map((o) => ({
            id: o.id,
            table_id: o.table_id,
            closed_at: o.closed_at,
            payment_method: o.payment_method || 'cash',
            total: Math.round((o.order_items || []).reduce((s, i) => s + (i.products?.price || 0) * (i.quantity || 0), 0)),
            items_count: (o.order_items || []).reduce((s, i) => s + (i.quantity || 0), 0),
        }));
        return {
            period,
            kpis: {
                total_sales: Math.round(currentTotal),
                total_sales_pct: pct(currentTotal, prevTotal),
                order_count: currentCount,
                order_count_pct: pct(currentCount, prevCount),
                avg_ticket: Math.round(avgTicket),
                avg_ticket_pct: pct(avgTicket, prevAvgTicket),
                payment_breakdown: paymentBreakdown,
            },
            monthly_chart: { labels: monthLabels, values: monthTotals },
            category_sales: categorySales,
            top_products: topProducts,
            recent_orders: recentFormatted,
        };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = OrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map