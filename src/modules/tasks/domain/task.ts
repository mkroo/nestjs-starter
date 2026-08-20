export interface Task {
  readonly id: string;
  readonly title: string;
  readonly completed: boolean;
  readonly createdAt: Date;
}
