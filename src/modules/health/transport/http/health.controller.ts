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
  @HealthCheck({ noCache: true, swaggerDocumentation: false })
  @ApiOperation({ summary: 'Check whether the API can reach PostgreSQL' })
  @ApiResponse({
    status: 200,
    description: 'The API is ready to serve requests',
    schema: {
      example: {
        status: 'ok',
        info: { postgres: { status: 'up' } },
        error: {},
        details: { postgres: { status: 'up' } },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'PostgreSQL is unavailable or the application is shutting down',
    schema: {
      example: {
        status: 'error',
        info: {},
        error: { postgres: { status: 'down' } },
        details: { postgres: { status: 'down' } },
      },
    },
  })
  ready() {
    return this.healthCheckService.check([() => this.postgresHealthIndicator.check()]);
  }
}
