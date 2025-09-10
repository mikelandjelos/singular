import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DbBootstrapService implements OnModuleInit {
  constructor(private readonly ds: DataSource) {}

  async onModuleInit() {
    await this.ds.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);

    // User FTS
    await this.ds.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_app_user_display_trgm
        ON app_user USING GIN (display_name gin_trgm_ops);
    `);
    await this.ds.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_app_user_first_trgm
        ON app_user USING GIN (first_name gin_trgm_ops);
    `);
    await this.ds.query(`
      CREATE INDEX IF NOT EXISTS idx_app_user_last_trgm
        ON app_user USING GIN (last_name gin_trgm_ops);
    `);

    // Project FTS
    await this.ds.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_name_trgm
        ON project USING GIN (name gin_trgm_ops);
    `);
    await this.ds.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_desc_trgm
        ON project USING GIN (description gin_trgm_ops);
    `);
  }
}
