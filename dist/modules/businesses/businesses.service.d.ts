import { SupabaseService } from '../../supabase/supabase.service';
export declare class BusinessesService {
    private readonly supabase;
    constructor(supabase: SupabaseService);
    create(data: {
        name: string;
        businessType?: string;
        brandColor?: string;
        currency?: string;
    }, authHeader: string): Promise<any>;
    findAll(): Promise<{
        id: any;
        name: any;
        slug: any;
        business_type: any;
        created_at: any;
        owner_id: any;
    }[]>;
    findByOwnerId(ownerId: string): Promise<any>;
    savePosConfig(id: string, config: any): Promise<{
        success: boolean;
        data: any;
    }>;
    findBySlug(slug: string): Promise<any>;
}
