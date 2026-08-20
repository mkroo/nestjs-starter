import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

import { parseTelemetryEnvironment } from './telemetry-environment.js';

let provider: NodeTracerProvider | undefined;
let unregisterInstrumentations: (() => void) | undefined;

export function startTelemetry(environment: Record<string, unknown> = process.env): void {
  if (provider) {
    return;
  }

  const config = parseTelemetryEnvironment(environment);
  const spanProcessors =
    config.tracesExporter === 'otlp' ? [new BatchSpanProcessor(new OTLPTraceExporter())] : [];

  provider = new NodeTracerProvider({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: config.serviceName,
    }),
    spanProcessors,
  });
  provider.register();

  unregisterInstrumentations = registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [
      new HttpInstrumentation(),
      new NestInstrumentation(),
      new PgInstrumentation(),
      new PinoInstrumentation({ disableLogSending: true }),
    ],
  });
}

export async function shutdownTelemetry(): Promise<void> {
  unregisterInstrumentations?.();
  unregisterInstrumentations = undefined;
  await provider?.shutdown();
}
