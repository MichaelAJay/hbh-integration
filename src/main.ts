import { InternalServerErrorException, ValidationPipe } from '@nestjs/common';
import {
  CorsOptions,
  CorsOptionsDelegate,
} from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
async function bootstrap() {
  const { ENV, FRONTEND_BASE_URL } = process.env;
  if (!(ENV && FRONTEND_BASE_URL))
    throw new InternalServerErrorException(
      'Server missing required environment variables',
    );
  const corsOrigin = [FRONTEND_BASE_URL];
  if (ENV === 'local' || ENV === 'dev')
    corsOrigin.push('http://localhost:8080', 'https://localhost:8080');

  const corsOptions: CorsOptions | CorsOptionsDelegate<any> = {
    origin: corsOrigin,
    credentials: true,
    allowedHeaders: [
      'Access-Control-Allow-Origin',
      'Origin',
      'X-Requested-With',
      'Accept',
      'Content-Type',
      'Authorization',
    ],
    exposedHeaders: 'Authorization',
    methods: ['GET', 'PUT', 'OPTIONS', 'POST', 'DELETE', 'PATCH'],
  };

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors(corsOptions);

  app.useGlobalPipes(
    // new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    new ValidationPipe({ whitelist: true }),
  );

  await app.listen(8080, '0.0.0.0');
}
bootstrap();
