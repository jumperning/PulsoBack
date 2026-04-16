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
exports.BusinessesService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let BusinessesService = class BusinessesService {
    constructor(supabase) {
        this.supabase = supabase;
    }
    async create(data, authHeader) {
        let ownerId = null;
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.replace('Bearer ', '');
            try {
                const { data: userData } = await this.supabase.client.auth.getUser(token);
                ownerId = userData?.user?.id || null;
            }
            catch (e) {
                console.error("Error validando usuario:", e.message);
            }
        }
        const slug = data.name
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            + '-' + Math.random().toString(36).substring(2, 7);
        const { data: biz, error } = await this.supabase.client
            .from('businesses')
            .insert([{
                name: data.name,
                slug,
                business_type: data.businessType || 'other',
                brand_color: data.brandColor || '#2b3896',
                currency: data.currency || 'ARS',
                owner_id: ownerId,
            }])
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return biz;
    }
    async findAll() {
        const { data, error } = await this.supabase.client
            .from('businesses')
            .select('id, name, slug, business_type, created_at, owner_id')
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        return data;
    }
    async findByOwnerId(ownerId) {
        if (!ownerId || ownerId === 'null')
            return null;
        const { data, error } = await this.supabase.client
            .from('businesses')
            .select('*')
            .eq('owner_id', ownerId)
            .maybeSingle();
        if (error)
            throw new Error(error.message);
        return data || null;
    }
    async savePosConfig(id, config) {
        const { data, error } = await this.supabase.client
            .from('businesses')
            .update({ pos_config: config })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return { success: true, data };
    }
    async findBySlug(slug) {
        const { data, error } = await this.supabase.client
            .from('businesses')
            .select('*')
            .eq('slug', slug)
            .single();
        if (error || !data)
            throw new common_1.NotFoundException(`El negocio "${slug}" no existe.`);
        return data;
    }
};
exports.BusinessesService = BusinessesService;
exports.BusinessesService = BusinessesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], BusinessesService);
//# sourceMappingURL=businesses.service.js.map