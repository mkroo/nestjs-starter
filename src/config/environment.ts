import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  LOG_LEVEL: z.enum(['silent', 'fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  DATABASE_URL: z.string().regex(/^postgres(?:ql)?:\/\//, 'Expected a PostgreSQL connection URL'),
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(100).default(10),
});

export type Environment = z.infer<typeof environmentSchema>;

export function parseEnvironment(environment: Record<string, unknown>): Environment {
  return environmentSchema.parse(environment);
}
