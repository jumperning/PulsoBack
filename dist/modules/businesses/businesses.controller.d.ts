import { BusinessesService } from './businesses.service';
export declare class BusinessesController {
    private readonly businessesService;
    constructor(businessesService: BusinessesService);
    getAll(): Promise<{
        id: any;
        name: any;
        slug: any;
        business_type: any;
        created_at: any;
        owner_id: any;
    }[]>;
    create(body: {
        name: string;
        businessType?: string;
        brandColor?: string;
        currency?: string;
    }, auth: string): Promise<any>;
    savePosConfig(id: string, body: {
        config: any;
    }): Promise<{
        success: boolean;
        data: any;
    }>;
    getOne(slug: string): Promise<any>;
}
