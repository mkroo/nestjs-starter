import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { parseEnvironment } from '../config/environment.js';
import { HealthModule } from '../modules/health/composition/index.js';
import { TasksModule } from '../modules/tasks/composition/index.js';
import { DatabaseModule } from '../platform/database/composition/index.js';
import { LoggingModule } from '../platform/logging/composition/index.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      validate: parseEnvironment,
    }),
    LoggingModule,
    DatabaseModule,
    HealthModule,
    TasksModule,
  ],
})
export class AppModule {}
