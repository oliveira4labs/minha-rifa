import {
  Injectable, Logger, type OnApplicationBootstrap, type OnApplicationShutdown,
} from '@nestjs/common';
import { PurgeIdleSessionsUseCase } from '../../application/auth/use-cases/purge-idle-sessions.use-case.js';
import { appConfig } from '../../config/app.config.js';

@Injectable()
export class PurgeIdleSessionsJob implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(PurgeIdleSessionsJob.name);
  private timer?: NodeJS.Timeout;

  constructor(private readonly purgeIdleSessions: PurgeIdleSessionsUseCase) {}

  onApplicationBootstrap(): void {
    const run = () => this.purgeIdleSessions.execute(Date.now()).catch((err) => this.logger.error(err));
    void run();
    this.timer = setInterval(run, appConfig.purgeIdleSessionsEveryMs);
    this.timer.unref();
  }

  onApplicationShutdown(): void {
    clearInterval(this.timer);
  }
}
