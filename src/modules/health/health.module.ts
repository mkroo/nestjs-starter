import { Module } from '@nestjs/common';

import { HealthController } from './transport/http/health.controller.js';

@Module({ controllers: [HealthController] })
export class HealthModule {}
