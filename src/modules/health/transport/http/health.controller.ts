import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { sql } from 'drizzle-orm';

import { DATABASE, type Database } from '../../../../platform/database/index.js';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  @Get('live')
  @ApiOperation({ summary: 'Check whether the API process is alive' })
  @ApiResponse({ status: 200, schema: { example: { status: 'ok' } } })
  live() {
    return { status: 'ok' as const };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Check whether the API can reach PostgreSQL' })
  @ApiResponse({ status: 200, schema: { example: { status: 'ok' } } })
  @ApiResponse({ status: 503, description: 'PostgreSQL is unavailable' })
  async ready() {
    try {
      await this.database.execute(sql`select 1`);
      return { status: 'ok' as const };
    } catch (error) {
      throw new ServiceUnavailableException('Database is unavailable', { cause: error });
    }
  }
}
