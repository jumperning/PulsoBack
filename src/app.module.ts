import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TenantInterceptor } from './common/interceptors/tenant.interceptor';
import { SupabaseModule } from './supabase/supabase.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { AuthModule } from './modules/auth/auth.module';
import { BusinessesModule } from './modules/businesses/businesses.module';
import { AdminModule } from './modules/admin/admin.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Una sola vez, global
    SupabaseModule,
    ProductsModule,
    OrdersModule,
    AuthModule,
    BusinessesModule,
    AdminModule
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantInterceptor,
    },
  ],
})
export class AppModule {}
