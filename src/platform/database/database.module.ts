import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseLifecycle } from './database-lifecycle.js';
import { databaseProviders } from './database.providers.js';
import { DATABASE } from './index.js';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [...databaseProviders, DatabaseLifecycle],
  exports: [DATABASE],
})
export class DatabaseModule {}
