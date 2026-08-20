import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/e2e/**/*.e2e-spec.ts'],
    setupFiles: ['./test/support/setup-env.ts'],
    fileParallelism: false,
  },
});
