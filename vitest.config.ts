import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts', 'test/**/*.spec.ts'],
    exclude: ['test/e2e/**'],
    setupFiles: ['./test/support/setup-env.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/main.ts', '**/*.module.ts', '**/*.schema.ts'],
    },
  },
});
