import type { Server } from 'node:http';

import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { z } from 'zod';

import { createApplication } from '../../src/composition/create-application.js';

const taskSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  completed: z.boolean(),
  createdAt: z.iso.datetime(),
});

describe('tasks', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createApplication({ logger: false });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates a task and returns it in the task list', async () => {
    const title = `Ship starter ${crypto.randomUUID()}`;
    const server = app.getHttpServer() as Server;

    const createdResponse = await request(server).post('/api/tasks').send({ title }).expect(201);
    const created = taskSchema.parse(createdResponse.body);

    expect(created).toMatchObject({
      title,
      completed: false,
    });

    const listedResponse = await request(server).get('/api/tasks').expect(200);
    const listed = z.array(taskSchema).parse(listedResponse.body);

    expect(listed).toContainEqual(created);
  });

  it('rejects an invalid task title', async () => {
    const server = app.getHttpServer() as Server;

    await request(server).post('/api/tasks').send({ title: '' }).expect(400);
  });
});
