import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class AdminService {
  constructor(private readonly supabase: SupabaseService) {}

  // === LISTADO COMPLETO DE TIENDAS CON TODA LA INFO ===
  async getAllBusinesses() {
    const { data: businesses, error } = await this.supabase.client
      .from('businesses')
      .select(`
        id,
        name,
        slug,
        business_type,
        brand_color,
        logo_url,
        created_at,
        owner_id,
        profiles!business_id (
          full_name,
          role
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw new InternalServerErrorException(error.message);

    // Traemos conteos por separado (más confiable)
    const businessIds = businesses.map(b => b.id);

    const [productsRes, ordersRes] = await Promise.all([
      this.supabase.client
        .from('products')
        .select('business_id')
        .in('business_id', businessIds),
      this.supabase.client
        .from('orders')
        .select('business_id, status')
        .in('business_id', businessIds)
    ]);

    const productCountMap = new Map();
    productsRes.data?.forEach(p => {
      productCountMap.set(p.business_id, (productCountMap.get(p.business_id) || 0) + 1);
    });

    const activeOrdersMap = new Map();
    ordersRes.data?.forEach(o => {
      if (['pending', 'active'].includes(o.status)) {
        activeOrdersMap.set(o.business_id, (activeOrdersMap.get(o.business_id) || 0) + 1);
      }
    });

    return businesses.map(biz => ({
      id: biz.id,
      name: biz.name,
      slug: biz.slug,
      business_type: biz.business_type || 'General',
      brand_color: biz.brand_color,
      logo_url: biz.logo_url,
      created_at: biz.created_at,
      owner_email: biz.profiles?.[0]?.full_name || 'Sin dueño', // fallback
      total_products: productCountMap.get(biz.id) || 0,
      active_orders: activeOrdersMap.get(biz.id) || 0,
    }));
  }

  // === ESTADÍSTICAS GLOBALES ===
  async getPlatformStats() {
    const { data: businesses } = await this.supabase.client
      .from('businesses')
      .select('id');

    const businessIds = businesses?.map(b => b.id) || [];

    const [ordersRes, productsRes] = await Promise.all([
      this.supabase.client
        .from('orders')
        .select('business_id, status')
        .in('business_id', businessIds),
      this.supabase.client
        .from('products')
        .select('business_id')
        .in('business_id', businessIds)
    ]);

    const totalActiveOrders = ordersRes.data?.filter(o => 
      ['pending', 'active'].includes(o.status)
    ).length || 0;

    const businessesWithStats = businesses.map(biz => {
      const active = ordersRes.data?.filter(o => 
        o.business_id === biz.id && ['pending', 'active'].includes(o.status)
      ).length || 0;
      const products = productsRes.data?.filter(p => p.business_id === biz.id).length || 0;

      return { id: biz.id, active_orders: active, total_products: products };
    });

    return {
      total_businesses: businesses.length,
      total_active_orders: totalActiveOrders,
      businesses: businessesWithStats,
    };
  }

  // Crear nueva tienda (ya lo tenías)
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
        slug,
        business_type: data.businessType || 'cafe',
        brand_color: '#2b3896',
        currency: 'ARS',
      }])
      .select()
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    return business;
  }
}
