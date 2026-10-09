import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface ApplicantPersonal {
  name: string;
  email: string;
  phone: string;
  age: number;
  city: string;
  countryOfOrigin: string;
  targetCountry: string; // 'Germany' | 'Austria'
}

export interface ApplicantEducation {
  degree: string;
  institution: string;
  fieldOfStudy: string;
  graduationYear: number;
  grade: string;
  germanGrade?: number;
  isVerified: boolean;
  provenance: 'Verified from Document' | 'Applicant-Provided Claim';
}

export interface ApplicantEmployment {
  employer: string;
  role: string;
  durationMonths: number;
  responsibilities: string;
  isVerified: boolean;
  provenance: 'Verified from Document' | 'Applicant-Provided Claim';
}

export interface ApplicantLanguage {
  language: string;
  level: string; // 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Native'
  certificateType?: string; // 'Goethe-Institut' | 'Telc' | 'IELTS' | 'TestDaF' | 'None'
  isVerified: boolean;
  provenance: 'Verified from Document' | 'Applicant-Provided Claim';
}

export interface ExtractedDocumentRecord {
  id: string;
  fileName: string;
  fileUrl?: string;
  extractedText: string;
  authenticityStatus: 'AUTHENTIC' | 'SUSPECT' | 'UNVERIFIED';
  confidenceScore: number;
  tamperAlerts: string[];
  isVerified: boolean;
  provenanceTag: string;
  extractedFields: {
    institution?: string;
    degree?: string;
    grade?: string;
    year?: number;
    language?: string;
    cefrLevel?: string;
    candidateName?: string;
  };
  createdAt: string;
}

export interface ApplicantMotivation {
  pathway: 'STUDY' | 'AUSBILDUNG' | 'CHANCENKARTE';
  goals: string;
  relocationReason: string;
}

export interface ApplicantMedia {
  videoPitchTranscript: string;
  communicationRating: number; // 0 to 10
  analysisSummary?: string;
  integrityTrustScore?: number;
  proctoringSummary?: any;
  germanCefrAssessment?: any;
  writtenEvaluation?: any;
}

export interface ApplicantQualification {
  chancenkartePoints: number;
  austriaPoints: number;
  apsRequired: boolean;
  apsStatus: 'NOT_APPLIED' | 'REQUIRED' | 'VERIFIED' | 'EXEMPT';
  status: 'QUALIFIED' | 'CONDITIONAL' | 'INELIGIBLE' | 'IN_PROGRESS';
  missingRequirements: string[];
  pointsBreakdown: {
    category: string;
    points: number;
    maxPoints: number;
    reason: string;
  }[];
}

export interface RecommendedJourney {
  suggestedEducaroService: string;
  serviceDescription: string;
  estimatedTimelineMonths: number;
  nextSteps: string[];
}

export interface ApplicantRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  personal: ApplicantPersonal;
  education: ApplicantEducation;
  employment: ApplicantEmployment;
  skills: string[];
  languages: ApplicantLanguage[];
  documents: ExtractedDocumentRecord[];
  motivation: ApplicantMotivation;
  media: ApplicantMedia;
  qualification: ApplicantQualification;
  recommendedJourney: RecommendedJourney;
  timelineAudit?: any;
  identityCrossCheck?: any;
  transcriptModules?: any[];
  ectsMultiplier?: number;
  dynamicMilestones?: any;
  universityShortlist?: string[];
  targetAusbildungTrade?: string;
  chancenkartePoints?: number;
}
@Injectable()
export class ApplicantStore {
  private readonly logger = new Logger(ApplicantStore.name);
  private applicants: Map<string, ApplicantRecord> = new Map();
  private cacheFilePath: string;

  constructor() {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (e) {
        // Fallback to process cwd if write restricted
      }
    }
    this.cacheFilePath = path.join(dataDir, 'applicants-cache.json');
    this.loadFromCache();
  }

  private loadFromCache(): void {
    try {
      if (fs.existsSync(this.cacheFilePath)) {
        const raw = fs.readFileSync(this.cacheFilePath, 'utf-8');
        const list: ApplicantRecord[] = JSON.parse(raw);
        for (const item of list) {
          this.applicants.set(item.id, item);
        }
        this.logger.log(`Loaded ${this.applicants.size} applicants from resilient JSON cache.`);
      }
    } catch (err) {
      this.logger.warn(`Failed reading offline cache, running pure in-memory: ${err.message}`);
    }
  }

  private saveToCache(): void {
    try {
      const list = Array.from(this.applicants.values());
      fs.writeFileSync(this.cacheFilePath, JSON.stringify(list, null, 2), 'utf-8');
    } catch (err) {
      this.logger.warn(`Failed writing offline cache: ${err.message}`);
    }
  }

  public createInitialApplicant(id?: string): ApplicantRecord {
    const applicantId = id || `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newRecord: ApplicantRecord = {
      id: applicantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      personal: {
        name: '',
        email: '',
        phone: '',
        age: 0,
        city: '',
        countryOfOrigin: 'India',
        targetCountry: 'Germany',
      },
      education: {
        degree: '',
        institution: '',
        fieldOfStudy: '',
        graduationYear: 0,
        grade: '',
        germanGrade: undefined,
        isVerified: false,
        provenance: 'Applicant-Provided Claim',
      },
      employment: {
        employer: '',
        role: '',
        durationMonths: 0,
        responsibilities: '',
        isVerified: false,
        provenance: 'Applicant-Provided Claim',
      },
      skills: [],
      languages: [],
      documents: [],
      motivation: {
        pathway: 'STUDY',
        goals: '',
        relocationReason: '',
      },
      media: {
        videoPitchTranscript: '',
        communicationRating: 0,
        analysisSummary: 'No media uploaded yet.',
      },
      qualification: {
        chancenkartePoints: 0,
        austriaPoints: 0,
        apsRequired: false,
        apsStatus: 'NOT_APPLIED',
        status: 'IN_PROGRESS',
        missingRequirements: [],
        pointsBreakdown: [],
      },
      recommendedJourney: {
        suggestedEducaroService: 'Educaro Academic & Immigration Pre-Check',
        serviceDescription: 'Start your dynamic qualification intake to match with German & Austrian programs.',
        estimatedTimelineMonths: 6,
        nextSteps: ['Complete personal profile', 'Upload educational degree or language certificate'],
      },
    };

    this.applicants.set(applicantId, newRecord);
    this.saveToCache();
    return newRecord;
  }

  public getApplicant(id: string): ApplicantRecord | undefined {
    return this.applicants.get(id);
  }

  public getAllApplicants(): ApplicantRecord[] {
    return Array.from(this.applicants.values());
  }

  public getOrCreateApplicant(id?: string): ApplicantRecord {
    if (id && this.applicants.has(id)) {
      return this.applicants.get(id)!;
    }
    // If there's already an active applicant, return the latest or create one
    if (!id && this.applicants.size > 0) {
      const all = Array.from(this.applicants.values());
      return all[all.length - 1];
    }
    return this.createInitialApplicant(id);
  }

  public updateApplicant(id: string, updates: Partial<ApplicantRecord>): ApplicantRecord {
    const existing = this.getOrCreateApplicant(id);
    const updated: ApplicantRecord = {
      ...existing,
      ...updates,
      personal: updates.personal ? { ...existing.personal, ...updates.personal } : existing.personal,
      education: updates.education ? { ...existing.education, ...updates.education } : existing.education,
      employment: updates.employment ? { ...existing.employment, ...updates.employment } : existing.employment,
      skills: updates.skills ? updates.skills : existing.skills,
      languages: updates.languages ? updates.languages : existing.languages,
      documents: updates.documents ? updates.documents : existing.documents,
      motivation: updates.motivation ? { ...existing.motivation, ...updates.motivation } : existing.motivation,
      media: updates.media ? { ...existing.media, ...updates.media } : existing.media,
      qualification: updates.qualification ? { ...existing.qualification, ...updates.qualification } : existing.qualification,
      recommendedJourney: updates.recommendedJourney ? { ...existing.recommendedJourney, ...updates.recommendedJourney } : existing.recommendedJourney,
      updatedAt: new Date().toISOString(),
    };

    this.applicants.set(id, updated);
    this.saveToCache();
    return updated;
  }

  public addDocument(applicantId: string, doc: ExtractedDocumentRecord): ApplicantRecord {
    const applicant = this.getOrCreateApplicant(applicantId);
    applicant.documents.push(doc);
    applicant.updatedAt = new Date().toISOString();
    this.applicants.set(applicant.id, applicant);
    this.saveToCache();
    return applicant;
  }

  public clearAll(): void {
    this.applicants.clear();
    this.saveToCache();
  }
}
