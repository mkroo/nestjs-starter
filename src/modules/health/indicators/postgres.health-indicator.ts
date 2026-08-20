import { Inject, Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { sql } from 'drizzle-orm';

import { DATABASE, type Database } from '../../../platform/database/index.js';

const POSTGRES_HEALTH_TIMEOUT_MS = 1_000;

@Injectable()
export class PostgresHealthIndicator {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async check() {
    const indicator = this.healthIndicatorService.check('postgres');
    let timeout: ReturnType<typeof setTimeout> | undefined;

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeout = setTimeout(() => {
          reject(new Error('PostgreSQL health check timed out'));
        }, POSTGRES_HEALTH_TIMEOUT_MS);
      });

      await Promise.race([this.database.execute(sql`select 1`), timeoutPromise]);
      return indicator.up();
    } catch {
      return indicator.down();
    } finally {
      clearTimeout(timeout);
    }
  }
}
