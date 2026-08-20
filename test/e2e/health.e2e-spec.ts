import type { Server } from 'node:http';

import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createApplication } from '../../src/composition/create-application.js';

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
  });

  it('reports that PostgreSQL is ready', async () => {
    const server = app.getHttpServer() as Server;
    const response = await request(server).get('/api/health/ready').expect(200);

    expect(response.body).toEqual({ status: 'ok' });
  });
});
