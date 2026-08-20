import { z } from 'zod';

const telemetryEnvironmentSchema = z.object({
  OTEL_SERVICE_NAME: z.string().min(1).default('nestjs-starter'),
  OTEL_TRACES_EXPORTER: z.enum(['none', 'otlp']).default('none'),
});

interface TelemetryEnvironment {
  readonly serviceName: string;
  readonly tracesExporter: 'none' | 'otlp';
}

export function parseTelemetryEnvironment(
  environment: Record<string, unknown>,
): TelemetryEnvironment {
  const parsed = telemetryEnvironmentSchema.parse(environment);

  return {
    serviceName: parsed.OTEL_SERVICE_NAME,
    tracesExporter: parsed.OTEL_TRACES_EXPORTER,
  };
}
