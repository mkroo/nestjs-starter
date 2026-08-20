import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

import { PostgresHealthIndicator } from '../../indicators/postgres.health-indicator.js';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly postgresHealthIndicator: PostgresHealthIndicator,
  ) {}

  @Get('live')
  @ApiOperation({ summary: 'Check whether the API process is alive' })
  @ApiResponse({ status: 200, schema: { example: { status: 'ok' } } })
  live() {
    return { status: 'ok' as const };
  }

  @Get('ready')
  @HealthCheck()
  @ApiOperation({ summary: 'Check whether the API can reach PostgreSQL' })
  ready() {
    return this.healthCheckService.check([() => this.postgresHealthIndicator.check()]);
  }
}
