import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- CONFIGURACIÓN DE CORS OPTIMIZADA ---
  app.enableCors({
    origin: true, // Refleja automáticamente el origen de la petición (ideal para desarrollo)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    // Aunque usamos '*', es mejor dejar explícitos los que ya usamos en OnceyDoce
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-business-id',
      'Accept',
    ],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // --- VALIDACIÓN GLOBAL ---
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remueve propiedades que no estén en el DTO
      forbidNonWhitelisted: true, // Tira error si mandan data extraña
      transform: true, // Transforma los tipos (ej: string a number o UUID)
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log('---');
  console.log(`🚀 OnceyDoce API corriendo en http://localhost:${port}`);
  console.log(`🔒 CORS habilitado con soporte para Authorization`);
  console.log('---');
}

bootstrap();