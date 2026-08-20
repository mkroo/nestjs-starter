import type { Server } from 'node:http';

import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TerminusModule } from '@nestjs/terminus';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createApplication } from '../../src/composition/create-application.js';
import { PostgresHealthIndicator } from '../../src/modules/health/indicators/postgres.health-indicator.js';
import { HealthController } from '../../src/modules/health/transport/http/health.controller.js';
import { DATABASE } from '../../src/platform/database/index.js';

describe('health', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await createApplication({ logger: false });
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('reports that the process is alive', async () => {
    const server = app.getHttpServer() as Server;
    const response = await request(server).get('/api/health/live').expect(200);

    expect(response.body).toEqual({ status: 'ok' });
    expect(response.headers).not.toHaveProperty('x-request-id');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  it('reports that PostgreSQL is ready', async () => {
    const server = app.getHttpServer() as Server;
    const response = await request(server).get('/api/health/ready').expect(200);

    expect(response.body).toEqual({
      status: 'ok',
      info: { postgres: { status: 'up' } },
      error: {},
      details: { postgres: { status: 'up' } },
    });
    expect(response.headers['cache-control']).toBe('no-cache, no-store, must-revalidate');
  });

  it('serves Swagger UI with its required security policy', async () => {
    const server = app.getHttpServer() as Server;
    const response = await request(server).get('/docs/').expect(200);

    expect(response.headers['content-security-policy']).toContain(
      "script-src 'self' 'unsafe-inline'",
    );
  });

  it('reports that the API is unavailable when PostgreSQL fails', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TerminusModule.forRoot({ logger: false })],
      controllers: [HealthController],
      providers: [
        PostgresHealthIndicator,
        {
          provide: DATABASE,
          useValue: { execute: vi.fn().mockRejectedValue(new Error('connection details')) },
        },
      ],
    }).compile();
    const unavailableApp = moduleRef.createNestApplication({ logger: false });
    unavailableApp.setGlobalPrefix('api');

    try {
      await unavailableApp.init();
      const server = unavailableApp.getHttpServer() as Server;
      const response = await request(server).get('/api/health/ready').expect(503);

      expect(response.body).toEqual({
        status: 'error',
        info: {},
        error: { postgres: { status: 'down' } },
        details: { postgres: { status: 'down' } },
      });
    } finally {
      await unavailableApp.close();
    }
  });
});
