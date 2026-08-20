import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module.js';
import { setupOpenApi } from './openapi.js';

interface CreateApplicationOptions {
  readonly logger?: boolean;
}

export async function createApplication(
  options: CreateApplicationOptions = {},
): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    ...(options.logger === false ? { logger: false } : {}),
  });

  if (options.logger !== false) {
    app.useLogger(app.get(Logger));
  }

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", 'data:'],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
        },
      },
    }),
  );
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );
  app.enableShutdownHooks();

  setupOpenApi(app);

  return app;
}
