import {
  TypeOrmHealthIndicator,
  HealthCheckService,
  HealthCheck,
} from '@nestjs/terminus';
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @HealthCheck()
  @Get()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'), // automatically SELECT 1
    ]);
  }
}
