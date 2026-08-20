import { Module, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';

import type { Environment } from '../../config/environment.js';

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
