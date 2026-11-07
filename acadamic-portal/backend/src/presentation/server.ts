import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configuration } from '../infrastructure/config/configuration';
import { DatabaseService } from '../infrastructure/database/postgres/DatabaseService';
import { runSeed } from '../infrastructure/database/postgres/seed';
import { Logger } from '@nestjs/common';
import * as express from 'express';
import * as path from 'path';

export async function bootstrap() {
  const logger = new Logger('AcademicPortalServer');
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend PWA
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Serve uploaded materials statically with download headers
  const uploadDir = configuration.uploadDir;
  app.use('/uploads', express.static(uploadDir));

  // Run seed check
  const dbService = app.get(DatabaseService);
  try {
    await runSeed(dbService);
    logger.log('Database verification and seed ready.');
  } catch (err: any) {
    logger.warn(`Seed process note: ${err.message}`);
  }

  const port = configuration.port;
  await app.listen(port);
  logger.log(`================================================================`);
  logger.log(`Academic Portal Backend running on http://localhost:${port}`);
  logger.log(`Continuous Education Monitoring Dept (Hexagonal Architecture)`);
  logger.log(`UTF-8 Database & Localization Enabled (am-ET Default)`);
  logger.log(`================================================================`);
}

if (require.main === module) {
  bootstrap();
}
