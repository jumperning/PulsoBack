import { SupabaseService } from '../../supabase/supabase.service';
export declare class AuthService {
    private readonly supabase;
    constructor(supabase: SupabaseService);
    register(email: string, password: string, firstName: string, lastName: string): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            firstName: any;
            lastName: any;
        };
        businessId: any;
        business: any;
    }>;
    login(email: string, password: string): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            firstName: any;
            lastName: any;
        };
        businessId: any;
        business: any;
    }>;
    logout(token: string): Promise<{
        success: boolean;
    }>;
}
