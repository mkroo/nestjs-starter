import 'reflect-metadata';

import { ConfigService } from '@nestjs/config';

import { createApplication } from './composition/create-application.js';
import type { Environment } from './config/environment.js';

async function bootstrap(): Promise<void> {
  const app = await createApplication();
  const config = app.get(ConfigService<Environment, true>);

  await app.listen(config.get('PORT', { infer: true }));
}

await bootstrap();
