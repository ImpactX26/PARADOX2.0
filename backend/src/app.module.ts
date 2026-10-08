import { Module } from '@nestjs/common';
import { ApplicantController } from './controllers/applicant.controller';
import { ApplicantStore } from './store/applicant.store';
import { DocumentScannerService } from './services/document-scanner.service';
import { RulesEngineService } from './services/rules-engine.service';
import { CvGeneratorService } from './services/cv-generator.service';
import { TimelineValidatorService } from './services/timeline-validator.service';
import { IdentityVerifierService } from './services/identity-verifier.service';

@Module({
  imports: [],
  controllers: [ApplicantController],
  providers: [
    ApplicantStore,
    DocumentScannerService,
    RulesEngineService,
    CvGeneratorService,
    TimelineValidatorService,
    IdentityVerifierService,
  ],
})
export class AppModule {}
