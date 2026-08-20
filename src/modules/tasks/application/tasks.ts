import type { Task } from '../domain/task.js';

export interface CreateTaskCommand {
  readonly title: string;
}

export interface Tasks {
  create(command: CreateTaskCommand): Promise<Task>;
  list(): Promise<readonly Task[]>;
}

export const TASKS = Symbol('TASKS');
