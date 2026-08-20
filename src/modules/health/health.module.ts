import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { PostgresHealthIndicator } from './indicators/postgres.health-indicator.js';
import { HealthController } from './transport/http/health.controller.js';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [PostgresHealthIndicator],
})
export class HealthModule {}
