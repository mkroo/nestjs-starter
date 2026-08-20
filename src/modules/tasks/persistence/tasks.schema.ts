import { boolean, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const tasksTable = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  completed: boolean('completed').default(false).notNull(),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
});
