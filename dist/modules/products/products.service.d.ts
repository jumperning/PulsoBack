import { SupabaseService } from '../../supabase/supabase.service';
export declare class ProductsService {
    private readonly supabase;
    constructor(supabase: SupabaseService);
    findAll(businessId: string): Promise<any[]>;
    findAllGlobal(): Promise<any[]>;
    create(data: any, businessId: string): Promise<any>;
    update(id: string, data: any, businessId: string): Promise<any>;
    remove(id: string, businessId: string): Promise<{
        success: boolean;
    }>;
}
