import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { express as voyagerMiddlware } from 'graphql-voyager/middleware';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  app.use('/voyager', voyagerMiddlware({ endpointUrl: '/graphql' }));
  await app.listen(3000);
}
bootstrap();
