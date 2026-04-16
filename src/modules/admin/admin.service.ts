import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class AdminService {
  constructor(private readonly supabase: SupabaseService) {}

  async getAllBusinesses() {
    const { data, error } = await this.supabase.client
      .from('businesses')
      .select('id, name, slug, business_type, created_at, owner_id')
      .order('created_at', { ascending: false });

    if (error) throw new InternalServerErrorException(error.message);
    return data || [];
  }

  async createBusiness(data: { name: string; businessType?: string }) {
    const slug = data.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now().toString().slice(-6);

    const { data: business, error } = await this.supabase.client
      .from('businesses')
      .insert([{
        name: data.name,
        slug: slug,
        business_type: data.businessType || 'cafe',
        brand_color: '#2b3896',
        currency: 'ARS',
      }])
      .select()
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    return business;
  }

    async getPlatformStats() {
    try {
      const [businessesRes, ordersRes, productsRes] = await Promise.all([
        this.supabase.client
          .from('businesses')
          .select('id, name, slug, business_type, created_at'),   // ← Agregamos slug y business_type
        this.supabase.client.from('orders').select('id, status, business_id'),
        this.supabase.client.from('products').select('id, business_id'),
      ]);

      const businesses = businessesRes.data || [];
      const orders = ordersRes.data || [];
      const products = productsRes.data || [];

      const businessStats = businesses.map(biz => {
        const bizOrders = orders.filter(o => o.business_id === biz.id);
        const activeOrders = bizOrders.filter(o => ['pending', 'active'].includes(o.status)).length;
        const totalProducts = products.filter(p => p.business_id === biz.id).length;

        return {
          id: biz.id,
          name: biz.name,
          slug: biz.slug || '',                    // ← ahora existe
          business_type: biz.business_type || 'General',  // ← ahora existe
          created_at: biz.created_at,
          active_orders: activeOrders,
          total_products: totalProducts,
        };
      });

      return {
        total_businesses: businesses.length,
        total_active_orders: orders.filter(o => ['pending', 'active'].includes(o.status)).length,
        businesses: businessStats,
      };
    } catch (error) {
      console.error('Error en getPlatformStats:', error);
      throw new InternalServerErrorException('Error al obtener estadísticas de la plataforma');
    }
  }
}