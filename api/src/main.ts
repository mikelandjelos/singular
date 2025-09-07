// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: true, credentials: true });

  app.use(helmet()); // secure headers
  app.use(morgan(process.env.NODE_ENV !== 'production' ? 'dev' : 'combined')); // per-request logging

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Singular API')
    .setDescription('Lightweight note taking Web application.')
    .setVersion('1.0.0')
    // .addBearerAuth() // shows "Authorize" button (JWT in header), not needed if using cookies
    .build();

  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, doc); // http://localhost:3000/docs

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

bootstrap();
