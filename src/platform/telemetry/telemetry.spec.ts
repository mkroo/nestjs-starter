import { describe, expect, it } from 'vitest';

import { parseTelemetryEnvironment } from './telemetry-environment.js';

describe('parseTelemetryEnvironment', () => {
  it('uses vendor-neutral defaults without exporting spans', () => {
    expect(parseTelemetryEnvironment({})).toEqual({
      serviceName: 'nestjs-starter',
      tracesExporter: 'none',
    });
  });

  it('accepts the standard OTLP exporter', () => {
    expect(
      parseTelemetryEnvironment({
        OTEL_SERVICE_NAME: 'tasks-api',
        OTEL_TRACES_EXPORTER: 'otlp',
      }),
    ).toEqual({
      serviceName: 'tasks-api',
      tracesExporter: 'otlp',
    });
  });

  it('rejects unsupported exporters', () => {
    expect(() => parseTelemetryEnvironment({ OTEL_TRACES_EXPORTER: 'vendor-specific' })).toThrow();
  });
});
