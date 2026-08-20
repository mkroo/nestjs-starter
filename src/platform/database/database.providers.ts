import type { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import type { Environment } from '../../config/environment.js';
import { DATABASE } from './index.js';

export const DATABASE_POOL = Symbol('DATABASE_POOL');

export const databaseProviders: Provider[] = [
  {
    provide: DATABASE_POOL,
    inject: [ConfigService],
    useFactory: (config: ConfigService<Environment, true>) =>
      new Pool({
        connectionString: config.get('DATABASE_URL', { infer: true }),
        max: config.get('DATABASE_POOL_MAX', { infer: true }),
      }),
  },
  {
    provide: DATABASE,
    inject: [DATABASE_POOL],
    useFactory: (pool: Pool) => drizzle({ client: pool }),
  },
];
