import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

import { Module, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';

import type { Environment } from '../../config/environment.js';

function requestId(request: IncomingMessage, response: ServerResponse): string {
  const header = request.headers['x-request-id'];
  const candidate = Array.isArray(header) ? header[0] : header;
  const id = candidate ?? randomUUID();

  response.setHeader('x-request-id', id);
  return id;
}

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<Environment, true>) => {
        const isDevelopment = config.get('NODE_ENV', { infer: true }) === 'development';

        return {
          forRoutes: [{ path: '*splat', method: RequestMethod.ALL }],
          pinoHttp: {
            level: config.get('LOG_LEVEL', { infer: true }),
            genReqId: requestId,
            ...(isDevelopment
              ? {
                  transport: {
                    target: 'pino-pretty',
                    options: { colorize: true, singleLine: true },
                  },
                }
              : {}),
          },
        };
      },
    }),
  ],
  exports: [LoggerModule],
})
export class LoggingModule {}
