import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { parseEnvironment } from '../config/environment.js';
import { HealthModule } from '../modules/health/composition/index.js';
import { DatabaseModule } from '../platform/database/composition/index.js';
import { LoggingModule } from '../platform/logging/composition/index.js';
import { TelemetryModule } from '../platform/telemetry/composition/index.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      validate: parseEnvironment,
    }),
    TelemetryModule,
    LoggingModule,
    DatabaseModule,
    HealthModule,
  ],
})
export class AppModule {}
