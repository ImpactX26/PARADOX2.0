export interface ApplicantPersonal {
  name: string;
  email: string;
  phone: string;
  age: number;
  city: string;
  countryOfOrigin: string;
  targetCountry: string; // 'Germany' | 'Austria'
  professionalProfileUrl?: string;
  profileAuthenticityScore?: number;
  profileAuthenticityStatus?: 'VERIFIED_HIGH' | 'MODERATE' | 'UNVERIFIED' | 'AUTHENTIC' | 'SUSPECT';
}

export interface ApplicantEducation {
  degree: string;
  institution: string;
  fieldOfStudy: string;
  graduationYear: number;
  grade: string;
  germanGrade?: number;
  isVerified: boolean;
  provenance: 'Verified from Document' | 'Verified from Uploaded CV' | 'Applicant-Provided Claim';
}

export interface ApplicantEmployment {
  employer: string;
  role: string;
  durationMonths: number;
  responsibilities: string;
  isVerified: boolean;
  provenance: 'Verified from Document' | 'Verified from Uploaded CV' | 'Applicant-Provided Claim';
}

export interface ApplicantLanguage {
  language: string;
  level: string;
  certificateType?: string;
  isVerified: boolean;
  provenance: 'Verified from Document' | 'Verified from Uploaded CV' | 'Applicant-Provided Claim';
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
  targetAusbildungTrade?: string;
}

export interface GermanCefrScore {
  assessedLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  typeTokenRatio: number;
  grammaticalComplexity: number;
  spokenFluencyWpm: number;
  a1MarkersCount: number;
  a2MarkersCount: number;
  b1MarkersCount: number;
  b2MarkersCount: number;
  feedback: string[];
}

export interface WrittenEvaluationData {
  motivationScore: number;
  professionalFitScore: number;
  financialCulturalScore: number;
  overallCoherenceScore: number;
  lixIndex: number;
  typeTokenRatio: number;
  detectedKeywords: string[];
  feedbackPills: string[];
  answers: {
    motivation: string;
    professionalFit: string;
    financialCultural: string;
  };
}

export interface ProctoringSummaryData {
  yawPitchStatus: string;
  voiceSyncStatus: string;
  infractionsCount: number;
  tabSwitches: number;
  lookingAwaySeconds: number;
  overallTrustLevel: 'High Trust' | 'Moderate Trust' | 'Flagged for Review';
  infractionLog: Array<{ timestamp: string; message: string; severity: 'low' | 'medium' | 'high' }>;
}

export interface ApplicantMedia {
  videoPitchTranscript: string;
  communicationRating: number;
  analysisSummary?: string;
  integrityTrustScore?: number;
  proctoringSummary?: ProctoringSummaryData;
  germanCefrAssessment?: GermanCefrScore;
  writtenEvaluation?: WrittenEvaluationData;
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
  universityShortlist?: string[];
  targetAusbildungTrade?: string;
  chancenkartePoints?: number;
  timelineAudit?: TimelineAuditResult;
  identityCrossCheck?: IdentityCrossCheckReport;
}

export interface UniversityMatchResult {
  id: string;
  name: string;
  country: 'Germany' | 'Austria';
  city: string;
  qsRank: number;
  theRank: number;
  cheRating: 'Top Tier' | 'Middle Tier' | 'Standard';
  tuitionFeeEuro: number;
  minGermanGpa: number;
  languageRequirement: string;
  popularFields: string[];
  matchStatus: 'High Match' | 'Moderate Match' | 'Reach' | 'Ineligible';
  matchScore: number;
  gpaComparison: string;
}

export interface GermanCourse {
  id: string;
  courseName: string;
  degreeType: 'B.Sc.' | 'M.Sc.' | 'State Exam';
  university: string;
  city: string;
  state: string;
  language: '100% English' | 'German' | 'Bilingual (DE/EN)';
  tuitionFee: '€0 Public (Semester fee €150-€350 only)' | 'Tuition Charging';
  tuitionFeeEuro: number;
  ectCredits: number; // 180 or 120
  officialRankings: {
    cheRating: 'Top-Tier' | 'Middle-Tier' | 'Standard';
    qsEuropeRank: number;
    theRank: number;
  };
  minAdmissionGpa: number; // 1.5 to 2.8
  applicationDeadlines: {
    winter: string; // e.g. "July 15"
    summer: string; // e.g. "January 15"
  };
  tu9: boolean;
  fieldCategory: 'Informatics & AI' | 'Automotive & Mechanical' | 'Data Science' | 'Biomedical & Healthcare' | 'Business & Management' | 'Renewable Energy';
  description: string;
  admissionRequirements: string[];
}

export interface ExtractedCVData {
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  city?: string;
  degree?: string;
  institution?: string;
  fieldOfStudy?: string;
  grade?: string;
  graduationYear?: number;
  role?: string;
  employer?: string;
  durationMonths?: number;
  responsibilities?: string;
  languages?: Array<{ language: string; level: string; certificateType?: string }>;
  skills?: string[];
  rawText: string;
}

export interface TimelineMilestone {
  title: string;
  year: number;
  month?: number;
  category: 'BIRTH' | 'SECONDARY' | 'HIGHER_SECONDARY' | 'BACHELOR_START' | 'BACHELOR_GRADUATION' | 'EMPLOYMENT_START' | 'EMPLOYMENT_END' | 'TARGET_INTAKE';
  description: string;
  sourceDoc?: string;
  isVerified: boolean;
}

export interface TimelineAuditResult {
  birthYear?: number;
  highSchoolPassingYear?: number;
  bachelorStartYear?: number;
  bachelorGraduationYear?: number;
  employmentStartYear?: number;
  employmentDurationMonths?: number;
  ageAtGraduation?: number;
  gapMonths: number;
  unexplainedGapDetected: boolean;
  feasibilityViolations: string[];
  advisoryAlerts: string[];
  milestones: TimelineMilestone[];
}

export interface CrossDocumentIdentityMatch {
  documentId: string;
  fileName: string;
  extractedName: string;
  normalizedName: string;
  similarityScore: number; // 0 to 100
  matchStatus: 'EXACT_MATCH' | 'MINOR_VARIANCE' | 'CRITICAL_MISMATCH';
  notes: string;
}

export interface IdentityCrossCheckReport {
  primaryName: string;
  overallMatchScore: number;
  overallStatus: 'VERIFIED' | 'MINOR_VARIANCE' | 'CRITICAL_FRAUD';
  documentMatches: CrossDocumentIdentityMatch[];
  warningMessage?: string;
}

export interface AdmissionsConsultantReportData {
  originalCgpa: string;
  convertedGermanGpa: number;
  gradeBracket: {
    germanTitle: string;
    englishTitle: string;
    description: string;
    targetUniversities: string;
  };
  apsGatekeeper: {
    required: boolean;
    status: 'VERIFIED' | 'PENDING' | 'EXEMPT';
    message: string;
    actionLabel: string;
  };
  ectsAlignment: {
    isConsecutiveMatch: boolean;
    branchSwitchDetected: boolean;
    sourceField: string;
    targetField: string;
    compatibilityNotes: string;
  };
  admissionProbability: 'High Match (Public Tuition-Free)' | 'Moderate Match' | 'Bridge Program / Preparatory Needed';
  identifiedVulnerabilities: string[];
  strategicActionPlan: Array<{
    step: number;
    title: string;
    description: string;
    timing: string;
  }>;
}


