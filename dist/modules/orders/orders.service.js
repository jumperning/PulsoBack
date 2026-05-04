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
const OPEN_STATUSES = ['pending', 'active'];
let OrdersService = OrdersService_1 = class OrdersService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
        this.logger = new common_1.Logger(OrdersService_1.name);
        this.supabase = supabaseService.getClient();
    }
    async getActiveOrders(businessId) {
        const { data, error } = await this.supabase
            .from('orders')
            .select('*, order_items(*, products(*))')
            .eq('business_id', businessId)
            .in('status', OPEN_STATUSES);
        if (error) {
            this.logger.error(`getActiveOrders: ${error.message}`);
            throw new common_1.InternalServerErrorException(error.message);
        }
        return (data ?? []).map((order) => ({
            ...order,
            total: this.calcOrderTotal(order.order_items),
            item_count: this.calcItemCount(order.order_items),
        }));
    }
    async getOrCreateOrder(tableId, businessId) {
        const { data: order, error: searchError } = await this.supabase
            .from('orders')
            .select('*')
            .eq('table_id', tableId)
            .eq('business_id', businessId)
            .in('status', OPEN_STATUSES)
            .maybeSingle();
        if (searchError) {
            this.logger.error(`getOrCreateOrder search: ${searchError.message}`);
            throw new common_1.InternalServerErrorException(searchError.message);
        }
        if (order) {
            const { data: items } = await this.supabase
                .from('order_items')
                .select('*, products(*)')
                .eq('order_id', order.id);
            return { ...order, order_items: items ?? [] };
        }
        const { data: newOrder, error: createError } = await this.supabase
            .from('orders')
            .insert([{ table_id: tableId, business_id: businessId, status: 'pending', total: 0 }])
            .select()
            .single();
        if (createError) {
            this.logger.error(`getOrCreateOrder create: ${createError.message}`);
            throw new common_1.InternalServerErrorException(createError.message);
        }
        return { ...newOrder, order_items: [] };
    }
    async addItemToOrder(orderId, productId, quantity, businessId) {
        const { data: order, error: orderError } = await this.supabase
            .from('orders')
            .select('id, status')
            .eq('id', orderId)
            .eq('business_id', businessId)
            .maybeSingle();
        if (orderError || !order) {
            throw new common_1.NotFoundException('Orden no encontrada');
        }
        if (!OPEN_STATUSES.includes(order.status)) {
            throw new common_1.BadRequestException(`No se pueden agregar items a una orden en estado "${order.status}"`);
        }
        const { data: product } = await this.supabase
            .from('products')
            .select('id, price')
            .eq('id', productId)
            .eq('business_id', businessId)
            .maybeSingle();
        if (!product) {
            throw new common_1.NotFoundException('Producto no encontrado');
        }
        const { data: existingItem, error: checkError } = await this.supabase
            .from('order_items')
            .select('id, quantity')
            .eq('order_id', orderId)
            .eq('product_id', productId)
            .maybeSingle();
        if (checkError) {
            this.logger.error(`addItemToOrder check: ${checkError.message}`);
            throw new common_1.InternalServerErrorException(checkError.message);
        }
        if (existingItem) {
            const { data, error } = await this.supabase
                .from('order_items')
                .update({ quantity: existingItem.quantity + quantity })
                .eq('id', existingItem.id)
                .select('*, products(*)')
                .single();
            if (error) {
                this.logger.error(`addItemToOrder update: ${error.message}`);
                throw new common_1.InternalServerErrorException(error.message);
            }
            return { success: true, data };
        }
        const { data, error } = await this.supabase
            .from('order_items')
            .insert([{ order_id: orderId, product_id: productId, quantity, unit_price: product.price }])
            .select('*, products(*)')
            .single();
        if (error) {
            this.logger.error(`addItemToOrder insert: ${error.message}`);
            throw new common_1.InternalServerErrorException(error.message);
        }
        return { success: true, data };
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
    async markAsDelivered(orderId) {
        const order = await this.findOrderOrFail(orderId);
        if (order.status !== 'pending') {
            throw new common_1.BadRequestException(`Solo se pueden marcar como entregadas las órdenes pendientes (estado actual: "${order.status}")`);
        }
        return this.updateOrderStatus(orderId, 'active', { delivered_at: new Date().toISOString() });
    }
    async reopenOrder(orderId) {
        const order = await this.findOrderOrFail(orderId);
        if (!['active', 'closed'].includes(order.status)) {
            throw new common_1.BadRequestException(`Solo se pueden reabrir órdenes activas o cerradas (estado actual: "${order.status}")`);
        }
        return this.updateOrderStatus(orderId, 'pending', {
            delivered_at: null,
            closed_at: null,
            payment_method: null,
        });
    }
    async closeOrder(orderId, paymentMethod = 'cash') {
        const order = await this.findOrderOrFail(orderId);
        if (order.status === 'closed') {
            throw new common_1.BadRequestException('La orden ya está cerrada');
        }
        return this.updateOrderStatus(orderId, 'closed', {
            payment_method: paymentMethod,
            closed_at: new Date().toISOString(),
        });
    }
    async importOrders(body, businessId) {
        const { orders, withItems } = body;
        let ok = 0;
        let fail = 0;
        for (const row of orders) {
            try {
                const { data: order, error: orderError } = await this.supabase
                    .from('orders')
                    .insert([{
                        business_id: row.business_id,
                        table_id: row.table_id,
                        total: row.total,
                        payment_method: row.payment_method,
                        status: row.status ?? 'closed',
                        created_at: row.created_at ?? new Date().toISOString(),
                        closed_at: row.closed_at ?? row.created_at ?? new Date().toISOString(),
                    }])
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
                                .insert([{
                                    name: item.nombre,
                                    price: item.precio,
                                    business_id: order.business_id,
                                    is_active: true,
                                }])
                                .select()
                                .single();
                            if (productError)
                                throw productError;
                            product = newProduct;
                        }
                        const { error: itemError } = await this.supabase
                            .from('order_items')
                            .insert([{
                                order_id: order.id,
                                product_id: product.id,
                                quantity: item.qty,
                                unit_price: item.precio ?? 0,
                                unit_cost: item.costo ?? 0,
                            }]);
                        if (itemError)
                            throw itemError;
                    }
                }
                ok++;
            }
            catch (err) {
                this.logger.error('importOrders row failed:', err);
                fail++;
            }
        }
        return { ok, fail };
    }
    async importProducts(rows, businessId) {
        const products = rows.map((row) => ({
            name: row.nombre ?? row.name ?? row.producto,
            price: Number(row.precio ?? row.price ?? 0),
            category: row.categoria ?? row.category ?? 'General',
            stock: Number(row.stock ?? 0),
            description: row.descripcion ?? row.description ?? '',
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
        const periodStart = this.getPeriodStart(period, now);
        const periodMs = now.getTime() - periodStart.getTime();
        const prevStart = new Date(periodStart.getTime() - periodMs);
        const prevEnd = new Date(periodStart);
        const [currentOrders, prevOrders, chartOrders, recentOrders] = await Promise.all([
            this.fetchClosedOrders(businessId, periodStart, now, '*, order_items(*, products(*))'),
            this.fetchClosedOrders(businessId, prevStart, prevEnd, 'id, order_items(quantity, products(price))'),
            this.fetchClosedOrders(businessId, new Date(now.getFullYear(), now.getMonth() - (months - 1), 1), now, 'closed_at, order_items(quantity, products(price))'),
            this.supabase
                .from('orders')
                .select(`
          id, 
          table_id, 
          closed_at, 
          payment_method,
          order_items (
            quantity,
            products (
              id,
              name,
              price,
              category
            )
          )
        `)
                .eq('business_id', businessId)
                .eq('status', 'closed')
                .order('closed_at', { ascending: false })
                .limit(20)
                .then(({ data }) => data ?? []),
        ]);
        const calcTotal = (orders) => orders.reduce((sum, o) => sum + (o.order_items ?? []).reduce((s, i) => s + (i.products?.price ?? 0) * (i.quantity ?? 0), 0), 0);
        const currentTotal = calcTotal(currentOrders);
        const prevTotal = calcTotal(prevOrders);
        const currentCount = currentOrders.length;
        const prevCount = prevOrders.length;
        const avgTicket = currentCount > 0 ? currentTotal / currentCount : 0;
        const prevAvgTicket = prevCount > 0 ? prevTotal / prevCount : 0;
        const pct = (curr, prev) => prev === 0 ? null : Math.round(((curr - prev) / prev) * 100);
        const paymentBreakdown = {};
        currentOrders.forEach((o) => {
            const method = o.payment_method ?? 'cash';
            const total = (o.order_items ?? []).reduce((s, i) => s + (i.products?.price ?? 0) * (i.quantity ?? 0), 0);
            paymentBreakdown[method] = (paymentBreakdown[method] ?? 0) + total;
        });
        const monthLabels = [];
        const monthTotals = [];
        for (let m = 0; m < months; m++) {
            const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - m), 1);
            const nextD = new Date(d.getFullYear(), d.getMonth() + 1, 1);
            const label = d.toLocaleString('es-AR', { month: 'short' }).replace('.', '');
            const monthTotal = chartOrders
                .filter((o) => { const t = new Date(o.closed_at); return t >= d && t < nextD; })
                .reduce((sum, o) => sum + (o.order_items ?? []).reduce((s, i) => s + (i.products?.price ?? 0) * (i.quantity ?? 0), 0), 0);
            monthLabels.push(label);
            monthTotals.push(Math.round(monthTotal));
        }
        const categoryMap = {};
        currentOrders.forEach((o) => {
            (o.order_items ?? []).forEach((item) => {
                const cat = item.products?.category ?? 'Sin categoría';
                categoryMap[cat] = (categoryMap[cat] ?? 0) + (item.products?.price ?? 0) * (item.quantity ?? 0);
            });
        });
        const categorySales = Object.entries(categoryMap)
            .map(([name, total]) => ({ name, total: Math.round(total) }))
            .sort((a, b) => b.total - a.total);
        const productMap = {};
        currentOrders.forEach((o) => {
            (o.order_items ?? []).forEach((item) => {
                const id = item.product_id;
                if (!productMap[id]) {
                    productMap[id] = { name: item.products?.name ?? 'Producto', category: item.products?.category ?? '', qty: 0, revenue: 0 };
                }
                productMap[id].qty += item.quantity ?? 0;
                productMap[id].revenue += (item.products?.price ?? 0) * (item.quantity ?? 0);
            });
        });
        const topProducts = Object.values(productMap)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5)
            .map((p) => ({ ...p, revenue: Math.round(p.revenue) }));
        const recentFormatted = recentOrders.map((o) => ({
            id: o.id,
            table_id: o.table_id,
            closed_at: o.closed_at,
            created_at: o.created_at,
            payment_method: o.payment_method ?? 'cash',
            total: Math.round(o.total ??
                (o.order_items ?? []).reduce((s, i) => s + (i.unit_price ?? i.products?.price ?? 0) * (i.quantity ?? 0), 0)),
            items_count: (o.order_items ?? []).reduce((s, i) => s + (i.quantity ?? 0), 0),
            order_items: (o.order_items ?? []).map((i) => ({
                id: i.id,
                product_id: i.product_id,
                quantity: i.quantity ?? 0,
                unit_price: i.unit_price ?? i.products?.price ?? 0,
                unit_cost: i.unit_cost ?? 0,
                name: i.name ?? i.products?.name ?? 'Producto',
                sku: i.sku ?? i.products?.sku ?? null,
                products: i.products ? {
                    id: i.products.id,
                    name: i.products.name ?? 'Producto',
                    price: i.products.price ?? 0,
                    category: i.products.category ?? '',
                    image_url: i.products.image_url ?? null,
                } : null,
            })),
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
    async findOrderOrFail(orderId) {
        const { data: order, error } = await this.supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();
        if (error || !order) {
            throw new common_1.NotFoundException('Orden no encontrada');
        }
        return order;
    }
    async updateOrderStatus(orderId, status, extra = {}) {
        const { data, error } = await this.supabase
            .from('orders')
            .update({ status, ...extra })
            .eq('id', orderId)
            .select()
            .single();
        if (error) {
            this.logger.error(`updateOrderStatus → ${status}: ${error.message}`);
            throw new common_1.InternalServerErrorException(error.message);
        }
        return { success: true, data };
    }
    async fetchClosedOrders(businessId, from, to, select) {
        const { data, error } = await this.supabase
            .from('orders')
            .select(select)
            .eq('business_id', businessId)
            .eq('status', 'closed')
            .gte('closed_at', from.toISOString())
            .lte('closed_at', to.toISOString());
        if (error) {
            this.logger.error(`fetchClosedOrders: ${error.message}`);
            throw new common_1.InternalServerErrorException(error.message);
        }
        return data ?? [];
    }
    getPeriodStart(period, now) {
        switch (period) {
            case 'today':
                return new Date(now.getFullYear(), now.getMonth(), now.getDate());
            case 'week': {
                const d = new Date(now);
                d.setDate(now.getDate() - now.getDay());
                d.setHours(0, 0, 0, 0);
                return d;
            }
            case 'year':
                return new Date(now.getFullYear(), 0, 1);
            default:
                return new Date(now.getFullYear(), now.getMonth(), 1);
        }
    }
    calcOrderTotal(items) {
        return (items ?? []).reduce((sum, item) => sum + (item.products?.price ?? 0) * (item.quantity ?? 0), 0);
    }
    calcItemCount(items) {
        return (items ?? []).reduce((sum, item) => sum + (item.quantity ?? 0), 0);
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = OrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map