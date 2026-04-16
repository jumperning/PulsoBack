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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let ProductsService = class ProductsService {
    constructor(supabase) {
        this.supabase = supabase;
    }
    async findAll(businessId) {
        if (!businessId || businessId === 'null' || businessId === 'undefined') {
            console.warn('⚠️ Intento de acceso a productos con businessId nulo.');
            return [];
        }
        const { data, error } = await this.supabase
            .getClient()
            .from('products')
            .select('*')
            .eq('business_id', businessId)
            .order('name', { ascending: true });
        if (error) {
            console.error('Error obteniendo productos:', error.message);
            return [];
        }
        return data;
    }
    async findAllGlobal() {
        const { data, error } = await this.supabase
            .getClient()
            .from('products')
            .select('*, businesses(name)')
            .order('created_at', { ascending: false });
        if (error)
            throw new Error(error.message);
        return data;
    }
    async create(data, businessId) {
        if (!businessId || businessId === 'null') {
            throw new common_1.BadRequestException('ID de negocio no válido.');
        }
        const { data: newProduct, error } = await this.supabase
            .getClient()
            .from('products')
            .insert([
            {
                name: data.name,
                price: data.price,
                stock_quantity: data.stock_quantity || 0,
                category: data.category,
                is_favorite: data.is_favorite || false,
                business_id: businessId,
            },
        ])
            .select()
            .single();
        if (error) {
            console.error('Error creando en Supabase:', error.message);
            return null;
        }
        return newProduct;
    }
    async update(id, data, businessId) {
        const { data: updatedProduct, error } = await this.supabase
            .getClient()
            .from('products')
            .update({
            name: data.name,
            price: data.price,
            stock_quantity: data.stock_quantity,
            is_favorite: data.is_favorite,
            category: data.category,
        })
            .eq('id', id)
            .eq('business_id', businessId)
            .select()
            .single();
        if (error) {
            console.error('Error actualizando:', error.message);
            return null;
        }
        return updatedProduct;
    }
    async remove(id, businessId) {
        const { error } = await this.supabase
            .getClient()
            .from('products')
            .delete()
            .eq('id', id)
            .eq('business_id', businessId);
        if (error) {
            console.error('Error eliminando:', error.message);
            return null;
        }
        return { success: true };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.REQUEST }),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], ProductsService);
//# sourceMappingURL=products.service.js.map