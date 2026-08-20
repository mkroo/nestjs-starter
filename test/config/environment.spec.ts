import { describe, expect, it } from 'vitest';

import { parseEnvironment } from '../../src/config/environment.js';

describe('parseEnvironment', () => {
  it('applies safe application defaults', () => {
    expect(
      parseEnvironment({
        DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/app',
      }),
    ).toEqual({
      NODE_ENV: 'development',
      PORT: 3000,
      LOG_LEVEL: 'info',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/app',
      DATABASE_POOL_MAX: 10,
    });
  });

  it('rejects a non-PostgreSQL database URL', () => {
    expect(() => parseEnvironment({ DATABASE_URL: 'mysql://localhost/app' })).toThrow(
      'Expected a PostgreSQL connection URL',
    );
  });
});
