import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';

// Rutas que NO requieren x-business-id
const PUBLIC_PATHS = ['/auth/register', '/auth/login', '/businesses', '/admin'];

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    // Saltar el check para rutas públicas
    const isPublic = PUBLIC_PATHS.some(p => request.path.startsWith(p));
    if (isPublic) return next.handle();

    const businessId = request.headers['x-business-id'];
    if (!businessId) {
      throw new BadRequestException('Falta el header x-business-id');
    }

    request['business_id'] = businessId;
    return next.handle();
  }
}
