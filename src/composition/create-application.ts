import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
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
