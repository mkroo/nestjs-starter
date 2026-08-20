import { readdirSync } from 'node:fs';

const moduleNames = readdirSync(new URL('./src/modules', import.meta.url), {
  withFileTypes: true,
})
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

const moduleInterfaceRules = moduleNames.map((moduleName) => ({
  name: `no-deep-imports-into-${moduleName}`,
  severity: 'error',
  comment: `Import ${moduleName} through its root index.ts or composition/index.ts.`,
  from: {
    pathNot: `^src/modules/${moduleName}/`,
  },
  to: {
    path: `^src/modules/${moduleName}/(?!index\\.ts$|composition/index\\.ts$)`,
  },
}));

/** @type {import('dependency-cruiser').IConfiguration} */
export default {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'no-deprecated-core',
      severity: 'error',
      from: {},
      to: { dependencyTypes: ['core'], path: ['^(punycode|sys|domain)$'] },
    },
    {
      name: 'composition-is-not-a-feature-dependency',
      severity: 'error',
      comment: 'Only the application composition root may import a feature composition interface.',
      from: { path: '^src/modules/' },
      to: { path: '^src/modules/[^/]+/composition/index\\.ts$' },
    },
    ...moduleInterfaceRules,
    {
      name: 'no-deep-imports-into-database-platform',
      severity: 'error',
      from: {
        pathNot: '^src/platform/database/',
      },
      to: {
        path: '^src/platform/database/(?!index\\.ts$|composition/index\\.ts$)',
      },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: { extensions: ['.ts', '.js', '.json'] },
    reporterOptions: {
      dot: { collapsePattern: 'node_modules/[^/]+' },
    },
  },
};
