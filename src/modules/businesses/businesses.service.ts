import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class BusinessesService {
  constructor(private readonly supabase: SupabaseService) {}

  async create(data: { name: string; businessType?: string; brandColor?: string; currency?: string }, authHeader: string) {
    let ownerId: string | null = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      try {
        const { data: userData } = await this.supabase.client.auth.getUser(token);
        ownerId = userData?.user?.id || null;
      } catch (e) {
        console.error("Error validando usuario:", e.message);
      }
    }

    // Generar slug más robusto
    const slug = data.name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Math.random().toString(36).substring(2, 7);

    const { data: biz, error } = await this.supabase.client
      .from('businesses')
      .insert([{
        name:          data.name,
        slug,
        business_type: data.businessType || 'other',
        brand_color:   data.brandColor   || '#2b3896',
        currency:      data.currency     || 'ARS',
        owner_id:      ownerId,
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return biz;
  }

  // Método para listar TODO (Panel Super Admin)
  async findAll() {
    const { data, error } = await this.supabase.client
      .from('businesses')
      .select('id, name, slug, business_type, created_at, owner_id')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findByOwnerId(ownerId: string) {
    if (!ownerId || ownerId === 'null') return null;

    const { data, error } = await this.supabase.client
      .from('businesses')
      .select('*')
      .eq('owner_id', ownerId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data || null;
  }
// Pega esto dentro de la clase BusinessesService
  async savePosConfig(id: string, config: any) {
    const { data, error } = await this.supabase.client
      .from('businesses')
      .update({ pos_config: config })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { success: true, data };
  }
  async findBySlug(slug: string) {
    const { data, error } = await this.supabase.client
      .from('businesses')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) throw new NotFoundException(`El negocio "${slug}" no existe.`);
    return data;
  }
}