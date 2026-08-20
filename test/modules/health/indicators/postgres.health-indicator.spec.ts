import { HealthIndicatorService } from '@nestjs/terminus';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PostgresHealthIndicator } from '../../../../src/modules/health/indicators/postgres.health-indicator.js';
import type { Database } from '../../../../src/platform/database/index.js';

describe('PostgresHealthIndicator', () => {
  const execute = vi.fn();
  const database = { execute } as unknown as Database;
  const healthIndicator = new PostgresHealthIndicator(database, new HealthIndicatorService());

  beforeEach(() => {
    execute.mockReset();
  });

  it('reports PostgreSQL as available when the probe succeeds', async () => {
    execute.mockResolvedValue(undefined);

    await expect(healthIndicator.check()).resolves.toEqual({
      postgres: { status: 'up' },
    });
  });

  it('reports PostgreSQL as unavailable without exposing the error', async () => {
    execute.mockRejectedValue(new Error('connection details'));

    await expect(healthIndicator.check()).resolves.toEqual({
      postgres: { status: 'down' },
    });
  });
});
