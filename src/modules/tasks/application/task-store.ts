import type { Task } from '../domain/task.js';

export interface TaskStore {
  create(title: string): Promise<Task>;
  list(): Promise<readonly Task[]>;
}

export const TASK_STORE = Symbol('TASK_STORE');
