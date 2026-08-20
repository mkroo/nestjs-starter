import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, type OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

const openApiConfig = new DocumentBuilder()
  .setTitle('NestJS Starter')
  .setDescription('API reference for the NestJS starter application')
  .setVersion('1.0')
  .build();

/** @internal Used by the OpenAPI generation script. */
export function createOpenApiDocument(app: INestApplication): OpenAPIObject {
  return SwaggerModule.createDocument(app, openApiConfig);
}

export function setupOpenApi(app: INestApplication): void {
  SwaggerModule.setup('docs', app, createOpenApiDocument(app));
}
