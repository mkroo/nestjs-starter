import 'reflect-metadata';

import type { ConfigService as ConfigServiceType } from '@nestjs/config';

import type { Environment } from './config/environment.js';
import { shutdownTelemetry, startTelemetry } from './platform/telemetry/telemetry.js';

startTelemetry();

async function bootstrap(): Promise<void> {
  const [{ ConfigService }, { createApplication }] = await Promise.all([
    import('@nestjs/config'),
    import('./composition/create-application.js'),
  ]);
  const app = await createApplication();
  const config = app.get<ConfigServiceType<Environment, true>>(ConfigService);

  await app.listen(config.get('PORT', { infer: true }));
}

try {
  await bootstrap();
} catch (error) {
  await shutdownTelemetry();
  throw error;
}
