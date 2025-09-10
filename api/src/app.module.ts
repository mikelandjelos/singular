import { UserModule } from './user/user.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './health/health.module';
import { ProjectModule } from './project/project.module';
import { NoteModule } from './note/note.module';
import { TagModule } from './tag/tag.module';
import { DbBootstrapService } from './db/db-bootstrap.service';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        url: cfg.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        namingStrategy: new SnakeNamingStrategy(),
        synchronize: process.env.SYNC_MIGRATIONS
          ? process.env.SYNC_MIGRATIONS === 'true'
          : false, // TODO: use `false` (run migs manually)
      }),
    }),
    AuthModule,
    HealthModule,
    UserModule,
    ProjectModule,
    NoteModule,
    TagModule,
  ],
  controllers: [],
  providers: [DbBootstrapService],
})
export class AppModule {
  constructor() {}
}
