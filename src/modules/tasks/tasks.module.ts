import { Module } from '@nestjs/common';

import { TASK_STORE } from './application/task-store.js';
import { TASKS } from './application/tasks.js';
import { TasksService } from './application/tasks.service.js';
import { DrizzleTaskStore } from './persistence/drizzle-task.store.js';
import { TasksController } from './transport/http/tasks.controller.js';

@Module({
  controllers: [TasksController],
  providers: [
    TasksService,
    DrizzleTaskStore,
    { provide: TASK_STORE, useExisting: DrizzleTaskStore },
    { provide: TASKS, useExisting: TasksService },
  ],
  exports: [TASKS],
})
export class TasksModule {}
