import { mkdir, readFile, writeFile } from 'node:fs/promises';

import { createApplication } from '../src/composition/create-application.js';
import { createOpenApiDocument } from '../src/composition/openapi.js';

const app = await createApplication({ logger: false });
const outputPath = 'openapi/openapi.json';

try {
  await app.init();

  const document = createOpenApiDocument(app);
  const serializedDocument = `${JSON.stringify(document, null, 2)}\n`;

  if (process.argv.includes('--check')) {
    const currentDocument = await readFile(outputPath, 'utf8');

    if (currentDocument !== serializedDocument) {
      throw new Error('OpenAPI document is out of date. Run pnpm openapi:generate.');
    }
  } else {
    await mkdir('openapi', { recursive: true });
    await writeFile(outputPath, serializedDocument);
  }
} finally {
  await app.close();
}
