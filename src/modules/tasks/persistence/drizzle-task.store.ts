import { Inject, Injectable } from '@nestjs/common';
import { asc } from 'drizzle-orm';

import { DATABASE, type Database } from '../../../platform/database/index.js';
import type { TaskStore } from '../application/task-store.js';
import type { Task } from '../domain/task.js';
import { tasksTable } from './tasks.schema.js';

@Injectable()
export class DrizzleTaskStore implements TaskStore {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  async create(title: string): Promise<Task> {
    const [task] = await this.database.insert(tasksTable).values({ title }).returning();

    if (!task) {
      throw new Error('PostgreSQL did not return the created task');
    }

    return task;
  }

  list(): Promise<readonly Task[]> {
    return this.database.select().from(tasksTable).orderBy(asc(tasksTable.createdAt));
  }
}
