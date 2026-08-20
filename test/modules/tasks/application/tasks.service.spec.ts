import { describe, expect, it } from 'vitest';

import type { TaskStore } from '../../../../src/modules/tasks/application/task-store.js';
import { TasksService } from '../../../../src/modules/tasks/application/tasks.service.js';
import type { Task } from '../../../../src/modules/tasks/index.js';

class InMemoryTaskStore implements TaskStore {
  readonly #tasks: Task[] = [];

  create(title: string): Promise<Task> {
    const task: Task = {
      id: '3d2f8428-0c0a-4db6-8c3f-b58acb02cf53',
      title,
      completed: false,
      createdAt: new Date('2026-08-20T00:00:00.000Z'),
    };

    this.#tasks.push(task);
    return Promise.resolve(task);
  }

  list(): Promise<readonly Task[]> {
    return Promise.resolve(this.#tasks);
  }
}

describe('Tasks', () => {
  it('creates a task and returns it in the task list', async () => {
    const tasks = new TasksService(new InMemoryTaskStore());

    await tasks.create({ title: 'Ship the starter' });

    await expect(tasks.list()).resolves.toEqual([
      {
        id: '3d2f8428-0c0a-4db6-8c3f-b58acb02cf53',
        title: 'Ship the starter',
        completed: false,
        createdAt: new Date('2026-08-20T00:00:00.000Z'),
      },
    ]);
  });
});
