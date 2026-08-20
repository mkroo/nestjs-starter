import { Inject, Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { sql } from 'drizzle-orm';

import { DATABASE, type Database } from '../../../platform/database/index.js';

@Injectable()
export class PostgresHealthIndicator {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async check() {
    const indicator = this.healthIndicatorService.check('postgres');

    try {
      await this.database.execute(sql`select 1`);
      return indicator.up();
    } catch {
      return indicator.down();
    }
  }
}
