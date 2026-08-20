import { Inject, Injectable } from '@nestjs/common';

import { TASK_STORE, type TaskStore } from './task-store.js';
import type { CreateTaskCommand, Tasks } from './tasks.js';

@Injectable()
export class TasksService implements Tasks {
  constructor(@Inject(TASK_STORE) private readonly taskStore: TaskStore) {}

  create(command: CreateTaskCommand) {
    return this.taskStore.create(command.title);
  }

  list() {
    return this.taskStore.list();
  }
}
