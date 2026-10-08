import { Injectable, Logger } from '@nestjs/common';
import { ApplicantRecord } from '../store/applicant.store';

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

@Injectable()
export class TimelineValidatorService {
  private readonly logger = new Logger(TimelineValidatorService.name);

  /**
   * Harvests chronological dates across applicant profile and uploaded documents
   * and audits chronological feasibility per German visa & DAAD standards.
   */
  public auditApplicantTimeline(applicant: ApplicantRecord): TimelineAuditResult {
    const currentYear = 2026;
    const currentMonth = 10; // Current October 2026

    // 1. Harvest Dates
    let birthYear: number | undefined;
    if (applicant.personal?.age && applicant.personal.age > 0) {
      birthYear = currentYear - applicant.personal.age;
    }

    // Check extracted documents for explicit birth years or passing dates
    for (const doc of applicant.documents || []) {
      const text = doc.extractedText || '';
      // DOB checks
      const dobMatch = text.match(/(?:dob|date\s*of\s*birth|born\s*on|geburtsdatum)[:\s]*([0-9]{1,2})[\/\-\.]([0-9]{1,2})[\/\-\.](199[0-9]|200[0-9])/i);
      if (dobMatch && !birthYear) {
        birthYear = parseInt(dobMatch[3], 10);
      }
    }

    // Graduation & High School Years
    let bachelorGraduationYear: number | undefined = applicant.education?.graduationYear;
    let bachelorStartYear: number | undefined;
    let highSchoolPassingYear: number | undefined;

    // Scan docs for 10th/12th / secondary years
    for (const doc of applicant.documents || []) {
      const text = doc.extractedText || '';
      const textLower = text.toLowerCase();

      // 12th / High School
      const hsMatch = text.match(/(?:12th|hsc|higher\s*secondary|intermediate|cbse\s*12th|class\s*xii)[\s\S]{0,50}\b(201[0-9]|202[0-5])\b/i);
      if (hsMatch) {
        highSchoolPassingYear = parseInt(hsMatch[1], 10);
      }

      // Bachelor start or convocation
      const bGradMatch = text.match(/(?:graduated|passed|conferred|convocation|year\s*of\s*passing)[:\s]*\b(201[5-9]|202[0-6])\b/i);
      if (bGradMatch && !bachelorGraduationYear) {
        bachelorGraduationYear = parseInt(bGradMatch[1], 10);
      }
    }

    // Infer Bachelor start year if not directly specified (Standard 4-year B.Tech / 3-year B.Sc)
    if (bachelorGraduationYear) {
      const isThreeYear = (applicant.education?.degree || '').toLowerCase().includes('b.sc') && !(applicant.education?.degree || '').toLowerCase().includes('b.tech');
      bachelorStartYear = bachelorGraduationYear - (isThreeYear ? 3 : 4);
    }

    // Default High School to Bachelor start - 0/1 year if not harvested
    if (bachelorStartYear && !highSchoolPassingYear) {
      highSchoolPassingYear = bachelorStartYear;
    }

    // Employment dates
    const durationMonths = applicant.employment?.durationMonths || 0;
    let employmentStartYear: number | undefined;
    if (durationMonths > 0) {
      const expYears = Math.ceil(durationMonths / 12);
      employmentStartYear = currentYear - expYears;
    }

    // 2. Feasibility Checks
    const feasibilityViolations: string[] = [];
    const advisoryAlerts: string[] = [];

    // Rule A: Birth vs Graduation (Age at graduation >= 20)
    let ageAtGraduation: number | undefined;
    if (birthYear && bachelorGraduationYear) {
      ageAtGraduation = bachelorGraduationYear - birthYear;
      if (ageAtGraduation < 20) {
        feasibilityViolations.push(
          `CHRONOLOGICAL ANOMALY: Calculated age at Bachelor graduation is ${ageAtGraduation} (Born ${birthYear}, Graduated ${bachelorGraduationYear}). German standard minimum graduation age is 20-21.`
        );
      }
    }

    // Rule B: 12th vs Bachelor Start
    if (highSchoolPassingYear && bachelorStartYear) {
      if (bachelorStartYear < highSchoolPassingYear) {
        feasibilityViolations.push(
          `INCONSISTENT EDUCATION TIMELINE: Bachelor degree start year (${bachelorStartYear}) precedes 12th/High School completion year (${highSchoolPassingYear}).`
        );
      }
    }

    // Rule C: Degree vs Employment (prior to graduation = Internship/Student Part-Time)
    if (bachelorGraduationYear && employmentStartYear) {
      if (employmentStartYear < bachelorGraduationYear) {
        advisoryAlerts.push(
          `EMPLOYMENT CLASSIFICATION: Work experience starting in ${employmentStartYear} precedes graduation in ${bachelorGraduationYear}. Must be formally designated as 'Student Internship / Dual Working Student' for German Embassy.`
        );
      }
    }

    // Rule D: Education Gap Detection
    let gapMonths = 0;
    let unexplainedGapDetected = false;
    if (bachelorGraduationYear) {
      const totalMonthsSinceGraduation = Math.max(0, (currentYear - bachelorGraduationYear) * 12 + (currentMonth - 6));
      gapMonths = Math.max(0, totalMonthsSinceGraduation - durationMonths);

      if (gapMonths >= 12) {
        unexplainedGapDetected = true;
        advisoryAlerts.push(
          `⚠️ UNEXPLAINED GAP OF ${gapMonths} MONTHS: German Embassy requires proof (Gap Explanation Letter / Internship Certificates / German Language Course receipts) between ${bachelorGraduationYear} and ${currentYear} to prevent Section 16b / 20a visa refusal.`
        );
      }
    }

    // 3. Assemble Milestones
    const milestones: TimelineMilestone[] = [];

    if (birthYear) {
      milestones.push({
        title: 'Birth Year',
        year: birthYear,
        category: 'BIRTH',
        description: `Born ${birthYear} (${applicant.personal?.countryOfOrigin || 'India'})`,
        isVerified: true,
      });
    }

    if (highSchoolPassingYear) {
      milestones.push({
        title: 'Higher Secondary (12th Grade / Abitur Eq.)',
        year: highSchoolPassingYear,
        category: 'HIGHER_SECONDARY',
        description: 'Completed 10+2 Secondary Education qualifying for German University Entrance (HZB).',
        isVerified: true,
      });
    }

    if (bachelorStartYear) {
      milestones.push({
        title: 'Commenced Higher Education',
        year: bachelorStartYear,
        category: 'BACHELOR_START',
        description: `Enrolled in ${applicant.education?.degree || 'Bachelor Degree'} at ${applicant.education?.institution || 'Recognized University'}.`,
        isVerified: applicant.education?.isVerified || false,
      });
    }

    if (bachelorGraduationYear) {
      milestones.push({
        title: 'Bachelor Degree Awarded',
        year: bachelorGraduationYear,
        category: 'BACHELOR_GRADUATION',
        description: `Conferred ${applicant.education?.degree || 'Degree'} with CGPA ${applicant.education?.grade || 'First Class'}.`,
        isVerified: applicant.education?.isVerified || false,
      });
    }

    if (employmentStartYear && durationMonths > 0) {
      milestones.push({
        title: 'Professional Employment',
        year: employmentStartYear,
        category: 'EMPLOYMENT_START',
        description: `${applicant.employment?.role || 'Engineer'} at ${applicant.employment?.employer || 'Enterprise'} (${Math.round(durationMonths / 12)} years).`,
        isVerified: applicant.employment?.isVerified || false,
      });
    }

    milestones.push({
      title: 'Target Germany Intake',
      year: 2026,
      category: 'TARGET_INTAKE',
      description: `Planned Departure: Winter Semester 2026 / 2027 (${applicant.motivation?.pathway || 'Academic Study'}).`,
      isVerified: true,
    });

    // Sort chronologically
    milestones.sort((a, b) => a.year - b.year);

    return {
      birthYear,
      highSchoolPassingYear,
      bachelorStartYear,
      bachelorGraduationYear,
      employmentStartYear,
      employmentDurationMonths: durationMonths,
      ageAtGraduation,
      gapMonths,
      unexplainedGapDetected,
      feasibilityViolations,
      advisoryAlerts,
      milestones,
    };
  }
}
