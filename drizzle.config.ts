import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const databaseUrl =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/app';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/modules/**/persistence/*.schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: databaseUrl,
  },
  strict: true,
  verbose: true,
});
