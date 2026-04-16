import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(businessId: string): Promise<any[]>;
    create(createData: any, businessId: string): Promise<any>;
    update(id: string, updateData: any, businessId: string): Promise<any>;
    remove(id: string, businessId: string): Promise<{
        success: boolean;
    }>;
}
