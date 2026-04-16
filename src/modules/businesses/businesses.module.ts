import { Module } from '@nestjs/common';
import { BusinessesController } from './businesses.controller';
import { BusinessesService } from './businesses.service';

@Module({
  controllers: [BusinessesController],
  providers: [BusinessesService],
  exports: [BusinessesService], // Lo exportamos por si otros módulos lo necesitan
})
export class BusinessesModule {}