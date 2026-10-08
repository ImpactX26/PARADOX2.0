import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as express from 'express';
import * as path from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const logger = new Logger('EducaroBootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend dev and preview servers
  app.enableCors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Ensure /uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    try {
      fs.mkdirSync(uploadsDir, { recursive: true });
    } catch (e) {
      logger.warn(`Could not create uploads directory: ${e.message}`);
    }
  }

  // Serve static files from /uploads
  app.use('/uploads', express.static(uploadsDir));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`=================================================================`);
  logger.log(`🇩🇪 Educaro European AI Forensic Gateway Backend active on port ${port}`);
  logger.log(`⚡ API ready at: http://localhost:${port}/api/applicant/current`);
  logger.log(`=================================================================`);
}

bootstrap();
