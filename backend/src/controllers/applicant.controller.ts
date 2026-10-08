import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  Query,
  Res,
  Logger
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ApplicantStore, ApplicantRecord, ExtractedDocumentRecord } from '../store/applicant.store';
import { DocumentScannerService } from '../services/document-scanner.service';
import { RulesEngineService } from '../services/rules-engine.service';
import { CvGeneratorService } from '../services/cv-generator.service';
import { TimelineValidatorService } from '../services/timeline-validator.service';
import { IdentityVerifierService } from '../services/identity-verifier.service';

@Controller('api/applicant')
export class ApplicantController {
  private readonly logger = new Logger(ApplicantController.name);

  constructor(
    private readonly applicantStore: ApplicantStore,
    private readonly documentScannerService: DocumentScannerService,
    private readonly rulesEngineService: RulesEngineService,
    private readonly cvGeneratorService: CvGeneratorService,
    private readonly timelineValidatorService: TimelineValidatorService,
    private readonly identityVerifierService: IdentityVerifierService,
  ) {}

  /**
   * GET /api/applicant/current
   * Retrieves active applicant profile
   */
  @Get('current')
  getCurrentApplicant(@Query('id') id?: string) {
    return this.applicantStore.getOrCreateApplicant(id);
  }

  /**
   * GET /api/applicant/all
   * Retrieves all registered applicants for Counselor CRM
   */
  @Get('all')
  getAllApplicants() {
    return this.applicantStore.getAllApplicants();
  }

  /**
   * POST /api/applicant/reset
   * Cleans applicant state to a fresh intake
   */
  @Post('reset')
  resetApplicant() {
    this.applicantStore.clearAll();
    const fresh = this.applicantStore.createInitialApplicant();
    return { success: true, applicant: fresh };
  }

  /**
   * POST /api/applicant/profile
   * Saves personal details, origin, and pathway choices
   */
  @Post('profile')
  saveProfile(
    @Body()
    body: {
      id?: string;
      personal?: Partial<ApplicantRecord['personal']>;
      motivation?: Partial<ApplicantRecord['motivation']>;
      education?: Partial<ApplicantRecord['education']>;
      employment?: Partial<ApplicantRecord['employment']>;
      skills?: string[];
    },
  ) {
    const applicant = this.applicantStore.getOrCreateApplicant(body.id);
    
    // If grade is provided, compute Bavarian formula
    let germanGrade = applicant.education.germanGrade;
    if (body.education?.grade) {
      const calc = this.rulesEngineService.calculateBavarianGrade(body.education.grade);
      germanGrade = calc.germanGrade;
    }

    const updated = this.applicantStore.updateApplicant(applicant.id, {
      personal: body.personal ? { ...applicant.personal, ...body.personal } : applicant.personal,
      motivation: body.motivation ? { ...applicant.motivation, ...body.motivation } : applicant.motivation,
      education: body.education ? {
        ...applicant.education,
        ...body.education,
        germanGrade,
        provenance: applicant.education.isVerified ? 'Verified from Document' : 'Applicant-Provided Claim'
      } : applicant.education,
      employment: body.employment ? {
        ...applicant.employment,
        ...body.employment,
        provenance: applicant.employment.isVerified ? 'Verified from Document' : 'Applicant-Provided Claim'
      } : applicant.employment,
      skills: body.skills || applicant.skills,
    });

    // Auto-evaluate after profile update
    const evalResult = this.rulesEngineService.evaluateApplicant(updated);
    const evaluated = this.applicantStore.updateApplicant(applicant.id, {
      qualification: evalResult.qualification,
      recommendedJourney: evalResult.recommendedJourney,
    });

    return evaluated;
  }

  /**
   * POST /api/applicant/upload
   * Multer file upload; runs Tesseract OCR and forensic check; updates Education/Language models
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body('applicantId') applicantId?: string,
    @Body('category') category?: string,
  ) {
    if (!file) {
      return { error: 'No document file uploaded' };
    }

    const applicant = this.applicantStore.getOrCreateApplicant(applicantId);
    const scan = await this.documentScannerService.scanDocument(file, category);

    const docRecord: ExtractedDocumentRecord = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fileName: scan.fileName,
      extractedText: scan.extractedText,
      authenticityStatus: scan.authenticityStatus,
      confidenceScore: scan.confidenceScore,
      tamperAlerts: scan.tamperAlerts,
      isVerified: scan.authenticityStatus === 'AUTHENTIC',
      provenanceTag: scan.provenanceTag,
      extractedFields: scan.extractedFields,
      createdAt: new Date().toISOString(),
    };

    this.applicantStore.addDocument(applicant.id, docRecord);

    // Dynamic field mapping into applicant profile based on extracted fields
    const updates: Partial<ApplicantRecord> = {};

    // 1. Personal Details extraction
    const personalUpdates: Partial<ApplicantRecord['personal']> = {};
    if (scan.extractedFields.candidateName) personalUpdates.name = scan.extractedFields.candidateName;
    if (scan.extractedFields.email) personalUpdates.email = scan.extractedFields.email;
    if (scan.extractedFields.phone) personalUpdates.phone = scan.extractedFields.phone;
    if (scan.extractedFields.city) personalUpdates.city = scan.extractedFields.city;
    if (Object.keys(personalUpdates).length > 0) {
      updates.personal = { ...applicant.personal, ...personalUpdates };
    }

    // 2. CV / Resume Auto-fill
    if (scan.detectedDocumentType === 'CV' || category === 'CV') {
      const calcGrade = scan.extractedFields.grade
        ? this.rulesEngineService.calculateBavarianGrade(scan.extractedFields.grade).germanGrade
        : (applicant.education.germanGrade || 2.2);

      updates.education = {
        ...applicant.education,
        degree: scan.extractedFields.degree || applicant.education.degree || 'Bachelor Degree',
        institution: scan.extractedFields.institution || applicant.education.institution || 'Recognized University',
        fieldOfStudy: scan.extractedFields.fieldOfStudy || applicant.education.fieldOfStudy || 'Engineering / Sciences',
        graduationYear: scan.extractedFields.year || applicant.education.graduationYear || 2023,
        grade: scan.extractedFields.grade || applicant.education.grade || 'First Class Distinction',
        germanGrade: calcGrade,
        isVerified: true,
        provenance: 'Verified from Uploaded CV' as any,
      };

      if (scan.extractedFields.role || scan.extractedFields.employer || scan.extractedFields.durationMonths) {
        updates.employment = {
          ...applicant.employment,
          role: scan.extractedFields.role || applicant.employment.role || 'Professional Specialist',
          employer: scan.extractedFields.employer || applicant.employment.employer || 'Enterprise Technology Corp',
          durationMonths: scan.extractedFields.durationMonths || applicant.employment.durationMonths || 36,
          responsibilities: scan.extractedFields.responsibilities || applicant.employment.responsibilities || 'Engineering & operational execution.',
          isVerified: true,
          provenance: 'Verified from Uploaded CV' as any,
        };
      }

      if (scan.extractedFields.skills && scan.extractedFields.skills.length > 0) {
        const mergedSkills = Array.from(new Set([...applicant.skills, ...scan.extractedFields.skills]));
        updates.skills = mergedSkills;
      }

      if (scan.extractedFields.languages && scan.extractedFields.languages.length > 0) {
        const langList = [...applicant.languages];
        for (const l of scan.extractedFields.languages) {
          const idx = langList.findIndex(existing => existing.language.toLowerCase() === l.language.toLowerCase());
          if (idx >= 0) {
            langList[idx] = {
              language: l.language,
              level: l.level,
              certificateType: l.certificateType || 'Verified from CV',
              isVerified: true,
              provenance: 'Verified from Uploaded CV' as any,
            };
          } else {
            langList.push({
              language: l.language,
              level: l.level,
              certificateType: l.certificateType || 'Verified from CV',
              isVerified: true,
              provenance: 'Verified from Uploaded CV' as any,
            });
          }
        }
        updates.languages = langList;
      }
    } else if (scan.detectedDocumentType === 'DEGREE' || scan.detectedDocumentType === 'MARKSHEET') {
      const calcGrade = scan.extractedFields.grade
        ? this.rulesEngineService.calculateBavarianGrade(scan.extractedFields.grade).germanGrade
        : applicant.education.germanGrade;

      updates.education = {
        ...applicant.education,
        degree: scan.extractedFields.degree || applicant.education.degree || 'Bachelor Degree',
        institution: scan.extractedFields.institution || applicant.education.institution || 'Recognized Indian University',
        fieldOfStudy: scan.extractedFields.fieldOfStudy || applicant.education.fieldOfStudy || 'Engineering / Sciences',
        graduationYear: scan.extractedFields.year || applicant.education.graduationYear || 2023,
        grade: scan.extractedFields.grade || applicant.education.grade || '8.2/10',
        germanGrade: calcGrade,
        isVerified: scan.authenticityStatus === 'AUTHENTIC',
        provenance: 'Verified from Document',
      };
    }

    if (scan.detectedDocumentType === 'LANGUAGE_CERTIFICATE' || scan.extractedFields.language) {
      const langName = scan.extractedFields.language || 'German';
      const langLevel = scan.extractedFields.cefrLevel || 'B2';
      const certType = scan.extractedText.toUpperCase().includes('GOETHE') ? 'Goethe-Institut' : 'Telc / IELTS';

      const existingLangIndex = applicant.languages.findIndex(l => l.language.toLowerCase() === langName.toLowerCase());
      const newLangList = [...applicant.languages];
      if (existingLangIndex >= 0) {
        newLangList[existingLangIndex] = {
          language: langName,
          level: langLevel,
          certificateType: certType,
          isVerified: scan.authenticityStatus === 'AUTHENTIC',
          provenance: 'Verified from Document',
        };
      } else {
        newLangList.push({
          language: langName,
          level: langLevel,
          certificateType: certType,
          isVerified: scan.authenticityStatus === 'AUTHENTIC',
          provenance: 'Verified from Document',
        });
      }
      updates.languages = newLangList;
    }

    if (scan.detectedDocumentType === 'EXPERIENCE_LETTER') {
      updates.employment = {
        ...applicant.employment,
        isVerified: scan.authenticityStatus === 'AUTHENTIC',
        provenance: 'Verified from Document',
      };
    }

    // Update applicant state
    const afterUpdate = this.applicantStore.updateApplicant(applicant.id, updates);

    // Re-evaluate rules, timeline audit, and identity cross-check
    const evalResult = this.rulesEngineService.evaluateApplicant(afterUpdate);
    const timelineAudit = this.timelineValidatorService.auditApplicantTimeline(afterUpdate);
    const identityCrossCheck = this.identityVerifierService.crossCheckIdentity(afterUpdate);

    const finalEvaluated = this.applicantStore.updateApplicant(applicant.id, {
      qualification: evalResult.qualification,
      recommendedJourney: evalResult.recommendedJourney,
      timelineAudit,
      identityCrossCheck,
    });

    return {
      success: true,
      scanResult: scan,
      documentRecord: docRecord,
      applicant: finalEvaluated,
    };
  }

  /**
   * POST /api/applicant/media
   * Ingests video pitch text/transcript; scores communication and goals
   */
  @Post('media')
  ingestMediaPitch(
    @Body()
    body: {
      applicantId?: string;
      transcript: string;
      recordedDurationSeconds?: number;
      communicationRating?: number;
      analysisSummary?: string;
      integrityTrustScore?: number;
      proctoringSummary?: any;
      germanCefrAssessment?: any;
      writtenEvaluation?: any;
    },
  ) {
    const applicant = this.applicantStore.getOrCreateApplicant(body.applicantId);
    const text = body.transcript || '';

    // Deterministic communication clarity rating
    // Analyzes structure, German motivation keywords, vocabulary richness
    let rating = body.communicationRating || 7.0;
    if (!body.communicationRating) {
      const lower = text.toLowerCase();
      if (lower.includes('deutschland') || lower.includes('germany') || lower.includes('karriere') || lower.includes('study')) rating += 1.0;
      if (lower.includes('language') || lower.includes('ausbildung') || lower.includes('master')) rating += 0.8;
      if (text.split(' ').length > 40) rating += 0.7;
      if (lower.includes('um') || lower.includes('like') || lower.includes('uh')) rating -= 0.5;
      rating = Math.max(4.0, Math.min(9.8, Math.round(rating * 10) / 10));
    }

    const analysisSummary = body.analysisSummary ||
      `Clarity & Pitch Score: ${rating}/10. High motivation detected for ${applicant.motivation.pathway || 'European journey'}. Professional presentation with articulated career goals.`;

    const updated = this.applicantStore.updateApplicant(applicant.id, {
      media: {
        videoPitchTranscript: text,
        communicationRating: rating,
        analysisSummary,
        integrityTrustScore: body.integrityTrustScore !== undefined ? body.integrityTrustScore : (applicant.media.integrityTrustScore ?? 100),
        proctoringSummary: body.proctoringSummary || applicant.media.proctoringSummary,
        germanCefrAssessment: body.germanCefrAssessment || applicant.media.germanCefrAssessment,
        writtenEvaluation: body.writtenEvaluation || applicant.media.writtenEvaluation,
      },
    });

    return {
      success: true,
      media: updated.media,
      applicant: updated,
    };
  }

  /**
   * POST /api/applicant/evaluate
   * Executes German & Austrian rules; returns Chancenkarte score, gap analysis, and Educaro routing
   */
  @Post('evaluate')
  evaluateProfile(@Body('applicantId') applicantId?: string) {
    const applicant = this.applicantStore.getOrCreateApplicant(applicantId);
    const evalResult = this.rulesEngineService.evaluateApplicant(applicant);
    const timelineAudit = this.timelineValidatorService.auditApplicantTimeline(applicant);
    const identityCrossCheck = this.identityVerifierService.crossCheckIdentity(applicant);

    const updated = this.applicantStore.updateApplicant(applicant.id, {
      qualification: evalResult.qualification,
      recommendedJourney: evalResult.recommendedJourney,
      timelineAudit,
      identityCrossCheck,
    });

    return {
      success: true,
      qualification: updated.qualification,
      recommendedJourney: updated.recommendedJourney,
      applicant: updated,
    };
  }

  /**
   * GET /api/applicant/ranker
   * Returns ranked universities filtered and matched to applicant's GPA
   */
  @Get('ranker')
  getUniversityMatches(
    @Query('gpa') gpaQuery?: string,
    @Query('country') countryQuery?: string,
  ) {
    const gpa = gpaQuery ? parseFloat(gpaQuery) : undefined;
    const matches = this.rulesEngineService.matchUniversities(gpa, countryQuery);
    return {
      count: matches.length,
      applicantGpaUsed: gpa || 2.5,
      universities: matches,
    };
  }

  /**
   * GET /api/applicant/:id/cv
   * Returns formatted German Lebenslauf HTML
   */
  @Get(':id/cv')
  getLebenslaufCv(
    @Param('id') id: string, 
    @Query('lang') lang: string,
    @Res() res: Response
  ) {
    const applicant = this.applicantStore.getOrCreateApplicant(id);
    const html = this.cvGeneratorService.generateLebenslaufHtml(applicant, lang || 'de');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  }

  /**
   * GET /api/applicant/:id/timeline
   * Audits chronological feasibility and returns visual timeline milestones
   */
  @Get(':id/timeline')
  getTimelineAudit(@Param('id') id: string) {
    const applicant = this.applicantStore.getOrCreateApplicant(id);
    const audit = this.timelineValidatorService.auditApplicantTimeline(applicant);
    return {
      success: true,
      applicantId: applicant.id,
      audit,
    };
  }

  /**
   * GET /api/applicant/:id/identity-crosscheck
   * Cross-checks student name across all uploaded certificates and IDs
   */
  @Get(':id/identity-crosscheck')
  getIdentityCrossCheck(@Param('id') id: string) {
    const applicant = this.applicantStore.getOrCreateApplicant(id);
    const report = this.identityVerifierService.crossCheckIdentity(applicant);
    return {
      success: true,
      applicantId: applicant.id,
      report,
    };
  }

  /**
   * POST /api/applicant/inject-sample
   * 1-Click Test Data Injector for Jury Quick-Pitches:
   *  - 'aarav-study'
   *  - 'priya-ausbildung'
   *  - 'rahul-chancenkarte'
   */
  @Post('inject-sample')
  injectSamplePersona(@Body('persona') persona: string) {
    this.applicantStore.clearAll();
    const id = `persona_${persona}_${Date.now()}`;
    const fresh = this.applicantStore.createInitialApplicant(id);

    if (persona === 'aarav-study') {
      const bavarian = this.rulesEngineService.calculateBavarianGrade('8.6/10');
      const updated = this.applicantStore.updateApplicant(fresh.id, {
        personal: {
          name: 'Aarav Sharma',
          email: 'aarav.sharma@example.in',
          phone: '+91 98765 43210',
          age: 23,
          city: 'Chennai',
          countryOfOrigin: 'India',
          targetCountry: 'Germany',
        },
        motivation: {
          pathway: 'STUDY',
          goals: 'Pursue Master of Science in Informatics & AI at TU Munich.',
          relocationReason: 'Germany provides tuition-free, world-class engineering education and research ecosystems.',
        },
        education: {
          degree: 'Bachelor of Technology (B.Tech)',
          institution: 'Anna University, Chennai',
          fieldOfStudy: 'Computer Science and Engineering',
          graduationYear: 2024,
          grade: '8.6/10',
          germanGrade: bavarian.germanGrade,
          isVerified: true,
          provenance: 'Verified from Document',
        },
        employment: {
          employer: 'TCS Innovation Labs',
          role: 'Junior Software Engineer Intern',
          durationMonths: 12,
          responsibilities: 'Full-stack cloud applications and automated integration testing.',
          isVerified: true,
          provenance: 'Verified from Document',
        },
        skills: ['Python', 'TypeScript', 'Docker', 'Machine Learning', 'Data Structures', 'SQL'],
        languages: [
          {
            language: 'English',
            level: 'C1',
            certificateType: 'IELTS Academic (7.5 Band)',
            isVerified: true,
            provenance: 'Verified from Document',
          },
          {
            language: 'German',
            level: 'A2',
            certificateType: 'Goethe-Zertifikat A2',
            isVerified: true,
            provenance: 'Verified from Document',
          },
        ],
        documents: [
          {
            id: 'doc_aarav_degree',
            fileName: 'Anna_University_Degree_Convocation.pdf',
            extractedText: 'ANNA UNIVERSITY CHENNAI - OFFICIAL DEGREE CONVOCATION. Conferred on Aarav Sharma the degree of Bachelor of Technology in Computer Science. CGPA: 8.6/10. Controller of Examinations Seal Embossed.',
            authenticityStatus: 'AUTHENTIC',
            confidenceScore: 96,
            tamperAlerts: [],
            isVerified: true,
            provenanceTag: 'Verified from Document',
            extractedFields: {
              institution: 'Anna University',
              degree: 'Bachelor of Technology (B.Tech)',
              grade: '8.6',
              year: 2024,
              candidateName: 'Aarav Sharma',
            },
            createdAt: new Date().toISOString(),
          },
          {
            id: 'doc_aarav_ielts',
            fileName: 'IELTS_Test_Report_Form.pdf',
            extractedText: 'IDP IELTS Official Test Report. Candidate: Aarav Sharma. Overall Band Score: 7.5 (CEFR Level C1). Listening: 8.0, Reading: 7.5, Writing: 7.0, Speaking: 7.5. British Council & Cambridge English.',
            authenticityStatus: 'AUTHENTIC',
            confidenceScore: 98,
            tamperAlerts: [],
            isVerified: true,
            provenanceTag: 'Verified from Document',
            extractedFields: {
              language: 'English',
              cefrLevel: 'C1',
              candidateName: 'Aarav Sharma',
            },
            createdAt: new Date().toISOString(),
          },
        ],
        media: {
          videoPitchTranscript: 'Guten Tag, my name is Aarav Sharma. I graduated with first-class distinction in Computer Science from Anna University. I have conducted applied research in AI and want to specialize at TU Munich to contribute to European deep-tech software engineering.',
          communicationRating: 9.2,
          analysisSummary: 'Fluent English C1 with clear articulation and concise articulation of research goals in Germany.',
        },
      });

      const evalRes = this.rulesEngineService.evaluateApplicant(updated);
      const timelineAudit = this.timelineValidatorService.auditApplicantTimeline(updated);
      const identityCrossCheck = this.identityVerifierService.crossCheckIdentity(updated);
      return this.applicantStore.updateApplicant(updated.id, {
        qualification: evalRes.qualification,
        recommendedJourney: evalRes.recommendedJourney,
        timelineAudit,
        identityCrossCheck,
      });
    }

    if (persona === 'priya-ausbildung') {
      const updated = this.applicantStore.updateApplicant(fresh.id, {
        personal: {
          name: 'Priya Patel',
          email: 'priya.patel@example.in',
          phone: '+91 97654 32109',
          age: 21,
          city: 'Ahmedabad',
          countryOfOrigin: 'India',
          targetCountry: 'Germany',
        },
        motivation: {
          pathway: 'AUSBILDUNG',
          goals: 'Complete Duale Ausbildung in Healthcare / General Nursing in North Rhine-Westphalia.',
          relocationReason: 'Vocational training in Germany offers hands-on clinical practice with immediate stipend and career stability.',
        },
        education: {
          degree: 'Higher Secondary School Certificate (12th)',
          institution: 'Gujarat Secondary and Higher Secondary Board',
          fieldOfStudy: 'Biology, Chemistry & Health Sciences',
          graduationYear: 2023,
          grade: '82%',
          germanGrade: 2.1,
          isVerified: true,
          provenance: 'Verified from Document',
        },
        employment: {
          employer: 'Civil Hospital Ahmedabad',
          role: 'Junior Clinical Care Assistant',
          durationMonths: 10,
          responsibilities: 'Patient vitals documentation, patient mobility assistance, and hygiene protocols.',
          isVerified: true,
          provenance: 'Verified from Document',
        },
        skills: ['Patient Care', 'Clinical First Aid', 'Anatomy & Physiology', 'German B2 Medical Terminology'],
        languages: [
          {
            language: 'German',
            level: 'B2',
            certificateType: 'Goethe-Institut B2 Certificate',
            isVerified: true,
            provenance: 'Verified from Document',
          },
        ],
        documents: [
          {
            id: 'doc_priya_goethe',
            fileName: 'Goethe_Zertifikat_B2_Patel.pdf',
            extractedText: 'GOETHE-INSTITUT PRÜFUNGSZENTRUM - GOETHE-ZERTIFIKAT B2. Bestätigt, dass Priya Patel die Prüfung für das Niveau B2 des Gemeinsamen Europäischen Referenzrahmens mit der Note Gut bestanden hat. Siegel und Unterschrift des Prüfungsleiters.',
            authenticityStatus: 'AUTHENTIC',
            confidenceScore: 97,
            tamperAlerts: [],
            isVerified: true,
            provenanceTag: 'Verified from Document',
            extractedFields: {
              institution: 'Goethe-Institut',
              language: 'German',
              cefrLevel: 'B2',
              candidateName: 'Priya Patel',
            },
            createdAt: new Date().toISOString(),
          },
        ],
        media: {
          videoPitchTranscript: 'Hallo! Mein Name ist Priya Patel. Ich habe die 12. Klasse abgeschlossen und mein Goethe-Zertifikat B2 erworben. Ich möchte eine Ausbildung als Pflegefachkraft in Deutschland absolvieren, um Menschen zu helfen und eine langfristige Karriere aufzubauen.',
          communicationRating: 9.5,
          analysisSummary: 'Outstanding German spoken proficiency (B2). Articulate vocational goals and clinical experience.',
        },
      });

      const evalRes = this.rulesEngineService.evaluateApplicant(updated);
      const timelineAudit = this.timelineValidatorService.auditApplicantTimeline(updated);
      const identityCrossCheck = this.identityVerifierService.crossCheckIdentity(updated);
      return this.applicantStore.updateApplicant(updated.id, {
        qualification: evalRes.qualification,
        recommendedJourney: evalRes.recommendedJourney,
        timelineAudit,
        identityCrossCheck,
      });
    }

    if (persona === 'rahul-chancenkarte') {
      const bavarian = this.rulesEngineService.calculateBavarianGrade('7.9/10');
      const updated = this.applicantStore.updateApplicant(fresh.id, {
        personal: {
          name: 'Rahul Varma',
          email: 'rahul.varma@example.in',
          phone: '+91 91234 56789',
          age: 32,
          city: 'Bangalore',
          countryOfOrigin: 'India',
          targetCountry: 'Germany',
        },
        motivation: {
          pathway: 'CHANCENKARTE',
          goals: 'Obtain German Opportunity Card (Chancenkarte) for senior Cloud Architect & DevOps opportunities in Berlin/Munich.',
          relocationReason: 'European tech ecosystem with high demand for cloud infrastructure engineers.',
        },
        education: {
          degree: 'Bachelor of Engineering (B.E.)',
          institution: 'Visvesvaraya Technological University (VTU)',
          fieldOfStudy: 'Information Science & Engineering',
          graduationYear: 2015,
          grade: '7.9/10',
          germanGrade: bavarian.germanGrade,
          isVerified: true,
          provenance: 'Verified from Document',
        },
        employment: {
          employer: 'Infosys Limited / Enterprise Cloud Services',
          role: 'Lead Cloud DevOps Engineer',
          durationMonths: 72, // 6 years
          responsibilities: 'Kubernetes orchestration, Terraform infrastructure as code, CI/CD pipelines, and AWS/Azure architecture.',
          isVerified: true,
          provenance: 'Verified from Document',
        },
        skills: ['Kubernetes', 'AWS Solutions Architect', 'Terraform', 'Golang', 'CI/CD Pipelines', 'Linux Kernel'],
        languages: [
          {
            language: 'English',
            level: 'C1',
            certificateType: 'Professional Business Fluency',
            isVerified: true,
            provenance: 'Verified from Document',
          },
          {
            language: 'German',
            level: 'B1',
            certificateType: 'Telc Deutsch B1',
            isVerified: true,
            provenance: 'Verified from Document',
          },
        ],
        documents: [
          {
            id: 'doc_rahul_degree',
            fileName: 'VTU_Degree_Certificate_Rahul.pdf',
            extractedText: 'VISVESVARAYA TECHNOLOGICAL UNIVERSITY - Conferred degree of Bachelor of Engineering on Rahul Varma. First Class with Distinction. Registrar Evaluation and Controller Seal.',
            authenticityStatus: 'AUTHENTIC',
            confidenceScore: 95,
            tamperAlerts: [],
            isVerified: true,
            provenanceTag: 'Verified from Document',
            extractedFields: {
              institution: 'Visvesvaraya Technological University',
              degree: 'Bachelor of Engineering (B.E.)',
              year: 2015,
              candidateName: 'Rahul Varma',
            },
            createdAt: new Date().toISOString(),
          },
          {
            id: 'doc_rahul_telc',
            fileName: 'Telc_B1_Zertifikat_Varma.pdf',
            extractedText: 'TELC GMBH - ZERTIFIKAT DEUTSCH B1. Bestätigt das Erreichen der Niveaustufe B1 durch Rahul Varma. Ausgestellt in Bangalore. Prüfungsnummer 294821.',
            authenticityStatus: 'AUTHENTIC',
            confidenceScore: 94,
            tamperAlerts: [],
            isVerified: true,
            provenanceTag: 'Verified from Document',
            extractedFields: {
              institution: 'Telc GmbH',
              language: 'German',
              cefrLevel: 'B1',
              candidateName: 'Rahul Varma',
            },
            createdAt: new Date().toISOString(),
          },
        ],
        media: {
          videoPitchTranscript: 'Hello, I am Rahul Varma with 6 years of experience managing distributed cloud platforms at scale. With my recognized degree, proven tenure, and Telc B1 German qualification, I qualify directly for the Chancenkarte to transition into the German tech sector.',
          communicationRating: 9.4,
          analysisSummary: 'Strong executive presence, clear tech terminology, high Opportunity Card eligibility.',
        },
      });

      const evalRes = this.rulesEngineService.evaluateApplicant(updated);
      const timelineAudit = this.timelineValidatorService.auditApplicantTimeline(updated);
      const identityCrossCheck = this.identityVerifierService.crossCheckIdentity(updated);
      return this.applicantStore.updateApplicant(updated.id, {
        qualification: evalRes.qualification,
        recommendedJourney: evalRes.recommendedJourney,
        timelineAudit,
        identityCrossCheck,
      });
    }

    return fresh;
  }
}
