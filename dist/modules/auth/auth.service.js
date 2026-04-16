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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let AuthService = class AuthService {
    constructor(supabase) {
        this.supabase = supabase;
    }
    async register(email, password, firstName, lastName) {
        const { data, error } = await this.supabase.client.auth.signUp({
            email,
            password,
            options: {
                data: { firstName, lastName },
            },
        });
        if (error) {
            if (error.message.toLowerCase().includes('already')) {
                throw new common_1.ConflictException('Ya existe una cuenta con ese email');
            }
            throw new common_1.UnauthorizedException(error.message);
        }
        const userId = data.user?.id;
        const { data: business } = await this.supabase.client
            .from('businesses')
            .select('*')
            .eq('owner_id', userId)
            .maybeSingle();
        return {
            token: data.session?.access_token,
            user: {
                id: data.user?.id,
                email: data.user?.email,
                firstName: data.user?.user_metadata?.firstName || firstName,
                lastName: data.user?.user_metadata?.lastName || lastName,
            },
            businessId: business?.id || null,
            business: business || null,
        };
    }
    async login(email, password) {
        const { data, error } = await this.supabase.client.auth.signInWithPassword({
            email,
            password,
        });
        if (error)
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        const user = data.user;
        const { data: business } = await this.supabase.client
            .from('businesses')
            .select('*')
            .eq('owner_id', user.id)
            .maybeSingle();
        return {
            token: data.session?.access_token,
            user: {
                id: user?.id,
                email: user?.email,
                firstName: user?.user_metadata?.firstName || '',
                lastName: user?.user_metadata?.lastName || '',
            },
            businessId: business?.id || null,
            business: business || null,
        };
    }
    async logout(token) {
        const { error } = await this.supabase.client.auth.admin.signOut(token);
        if (error) {
            console.warn('Logout warning:', error.message);
        }
        return { success: true };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], AuthService);
//# sourceMappingURL=auth.service.js.map