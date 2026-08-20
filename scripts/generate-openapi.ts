import { mkdir, writeFile } from 'node:fs/promises';

import { createApplication } from '../src/composition/create-application.js';
import { createOpenApiDocument } from '../src/composition/openapi.js';

const app = await createApplication({ logger: false });

try {
  await app.init();

  const document = createOpenApiDocument(app);

  await mkdir('openapi', { recursive: true });
  await writeFile('openapi/openapi.json', `${JSON.stringify(document, null, 2)}\n`);
} finally {
  await app.close();
}
