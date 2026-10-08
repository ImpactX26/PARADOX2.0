import { Module } from '@nestjs/common';
import { ApplicantController } from './controllers/applicant.controller';
import { ApplicantStore } from './store/applicant.store';
import { DocumentScannerService } from './services/document-scanner.service';
import { RulesEngineService } from './services/rules-engine.service';
import { CvGeneratorService } from './services/cv-generator.service';

@Module({
  imports: [],
  controllers: [ApplicantController],
  providers: [
    ApplicantStore,
    DocumentScannerService,
    RulesEngineService,
    CvGeneratorService,
  ],
})
export class AppModule {}
