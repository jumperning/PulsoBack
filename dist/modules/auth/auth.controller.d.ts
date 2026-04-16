import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
    }): Promise<{
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
    login(body: {
        email: string;
        password: string;
    }): Promise<{
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
    logout(auth: string): Promise<{
        success: boolean;
    }>;
    getProfile(): {
        message: string;
    };
}
