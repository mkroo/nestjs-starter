import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';

import { AppModule } from '../src/composition/app.module.js';

describe('AppModule dependency injection', () => {
  it('compiles the complete application graph', async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();

    expect(moduleRef).toBeDefined();

    await moduleRef.close();
  });
});
