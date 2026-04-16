import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(private readonly supabase: SupabaseService) {}

  async register(email: string, password: string, firstName: string, lastName: string) {
    const { data, error } = await this.supabase.client.auth.signUp({
      email,
      password,
      options: {
        data: { firstName, lastName },
      },
    });

    if (error) {
      if (error.message.toLowerCase().includes('already')) {
        throw new ConflictException('Ya existe una cuenta con ese email');
      }
      throw new UnauthorizedException(error.message);
    }

    const userId = data.user?.id;

    // Buscar negocio existente del usuario recién registrado (por si ya tenía uno)
    const { data: business } = await this.supabase.client
      .from('businesses')
      .select('*')
      .eq('owner_id', userId)
      .maybeSingle();

    return {
      token: data.session?.access_token,
      user: {
        id:        data.user?.id,
        email:     data.user?.email,
        firstName: data.user?.user_metadata?.firstName || firstName,
        lastName:  data.user?.user_metadata?.lastName  || lastName,
      },
      businessId: business?.id || null,
      business:   business || null,
    };
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new UnauthorizedException('Credenciales inválidas');

    const user = data.user;

    // Buscar el negocio asociado al usuario
    // Usamos el token del usuario para la consulta (respeta RLS)
    const { data: business } = await this.supabase.client
      .from('businesses')
      .select('*')
      .eq('owner_id', user.id)
      .maybeSingle();
    // Si no tiene negocio todavía → business será null, no es error

    return {
      token: data.session?.access_token,
      user: {
        id:        user?.id,
        email:     user?.email,
        firstName: user?.user_metadata?.firstName || '',
        lastName:  user?.user_metadata?.lastName  || '',
      },
      businessId: business?.id || null,
      business:   business || null,
    };
  }

  async logout(token: string) {
    // Invalida la sesión en Supabase
    const { error } = await this.supabase.client.auth.admin.signOut(token);
    if (error) {
      // No lanzar error si el token ya expiró
      console.warn('Logout warning:', error.message);
    }
    return { success: true };
  }
}