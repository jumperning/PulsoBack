import { Injectable, Scope, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable({ scope: Scope.REQUEST })
export class ProductsService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll(businessId: string) {
    // VALIDACIÓN: Evita que la base de datos detone si el ID llega como "null" o "undefined"
    if (!businessId || businessId === 'null' || businessId === 'undefined') {
      console.warn('⚠️ Intento de acceso a productos con businessId nulo.');
      return [];
    }

    const { data, error } = await this.supabase
      .getClient()
      .from('products')
      .select('*')
      .eq('business_id', businessId)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error obteniendo productos:', error.message);
      return [];
    }
    return data;
  }

  // Método para el Futuro Panel de Super Admin (Trae todo sin filtrar)
  async findAllGlobal() {
    const { data, error } = await this.supabase
      .getClient()
      .from('products')
      .select('*, businesses(name)')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async create(data: any, businessId: string) {
    if (!businessId || businessId === 'null') {
        throw new BadRequestException('ID de negocio no válido.');
    }

    const { data: newProduct, error } = await this.supabase
      .getClient()
      .from('products')
      .insert([
        {
          name: data.name,
          price: data.price,
          stock_quantity: data.stock_quantity || 0,
          category: data.category,
          is_favorite: data.is_favorite || false,
          business_id: businessId,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creando en Supabase:', error.message);
      return null;
    }
    return newProduct;
  }
  
  async update(id: string, data: any, businessId: string) {
    const { data: updatedProduct, error } = await this.supabase
      .getClient()
      .from('products')
      .update({
        name: data.name,
        price: data.price,
        stock_quantity: data.stock_quantity,
        is_favorite: data.is_favorite,
        category: data.category,
      })
      .eq('id', id)
      .eq('business_id', businessId)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando:', error.message);
      return null;
    }
    return updatedProduct;
  }

  async remove(id: string, businessId: string) {
    const { error } = await this.supabase
      .getClient()
      .from('products')
      .delete()
      .eq('id', id)
      .eq('business_id', businessId);

    if (error) {
      console.error('Error eliminando:', error.message);
      return null;
    }
    return { success: true };
  }
}