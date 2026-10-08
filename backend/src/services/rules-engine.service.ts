import { Injectable, Logger } from '@nestjs/common';
import { ApplicantRecord, ApplicantQualification, RecommendedJourney } from '../store/applicant.store';

export interface UniversityProfile {
  id: string;
  name: string;
  country: 'Germany' | 'Austria';
  city: string;
  qsRank: number;
  theRank: number;
  cheRating: 'Top Tier' | 'Middle Tier' | 'Standard';
  tuitionFeeEuro: number;
  minGermanGpa: number; // Bavarian scale: 1.0 (best) to 4.0 (passing)
  languageRequirement: string;
  popularFields: string[];
  imageUrl?: string;
}

export interface UniversityMatchResult extends UniversityProfile {
  matchStatus: 'High Match' | 'Moderate Match' | 'Reach' | 'Ineligible';
  matchScore: number; // 0 - 100
  gpaComparison: string;
}

@Injectable()
export class RulesEngineService {
  private readonly logger = new Logger(RulesEngineService.name);

  // University Dataset with CHE, QS Europe, THE World
  private readonly universities: UniversityProfile[] = [
    {
      id: 'tum',
      name: 'Technical University of Munich (TUM)',
      country: 'Germany',
      city: 'Munich',
      qsRank: 28,
      theRank: 30,
      cheRating: 'Top Tier',
      tuitionFeeEuro: 0,
      minGermanGpa: 2.0,
      languageRequirement: 'English C1 / IELTS 6.5+ or German B2',
      popularFields: ['Computer Science', 'Mechanical Engineering', 'Data Engineering', 'Robotics']
    },
    {
      id: 'lmu',
      name: 'LMU Munich (Ludwig Maximilian University)',
      country: 'Germany',
      city: 'Munich',
      qsRank: 54,
      theRank: 38,
      cheRating: 'Top Tier',
      tuitionFeeEuro: 0,
      minGermanGpa: 2.2,
      languageRequirement: 'English IELTS 7.0 or German C1',
      popularFields: ['Data Science', 'Physics', 'Medicine', 'Economics']
    },
    {
      id: 'rwth',
      name: 'RWTH Aachen University',
      country: 'Germany',
      city: 'Aachen',
      qsRank: 99,
      theRank: 90,
      cheRating: 'Top Tier',
      tuitionFeeEuro: 0,
      minGermanGpa: 2.3,
      languageRequirement: 'English IELTS 6.5+ or German B2',
      popularFields: ['Automotive Engineering', 'Civil Engineering', 'Computer Science']
    },
    {
      id: 'heidelberg',
      name: 'Heidelberg University',
      country: 'Germany',
      city: 'Heidelberg',
      qsRank: 87,
      theRank: 47,
      cheRating: 'Top Tier',
      tuitionFeeEuro: 1500, // €1,500/semester for non-EU
      minGermanGpa: 2.1,
      languageRequirement: 'English IELTS 6.5+ or German C1',
      popularFields: ['Biotechnology', 'Translational Medical Research', 'Informatics']
    },
    {
      id: 'univie',
      name: 'University of Vienna',
      country: 'Austria',
      city: 'Vienna',
      qsRank: 130,
      theRank: 119,
      cheRating: 'Top Tier',
      tuitionFeeEuro: 726, // €726.72/semester
      minGermanGpa: 2.4,
      languageRequirement: 'German C1 or English IELTS 6.5',
      popularFields: ['Computer Science', 'Business Informatics', 'Data Analytics']
    },
    {
      id: 'tuwien',
      name: 'TU Wien (Vienna University of Technology)',
      country: 'Austria',
      city: 'Vienna',
      qsRank: 180,
      theRank: 200,
      cheRating: 'Top Tier',
      tuitionFeeEuro: 726,
      minGermanGpa: 2.5,
      languageRequirement: 'English IELTS 6.5 or German B2',
      popularFields: ['Software Engineering', 'Electrical Engineering', 'Telecommunications']
    }
  ];

  /**
   * Deterministic Bavarian Formula (Bayerische Formel)
   * Formula: German Grade = 1 + 3 * ((Nmax - Nd) / (Nmax - Nmin))
   * Where:
   *  Nmax = maximum achievable grade (e.g., 10.0 for 10-point CGPA, or 100 for percentage)
   *  Nmin = minimum passing grade (e.g., 4.0 for 10-point scale, or 40 for percentage)
   *  Nd   = applicant's grade
   * Range: 1.0 (Best) to 4.0 (Pass), > 4.0 (Fail)
   */
  public calculateBavarianGrade(rawGradeStr?: string): { germanGrade: number; explanation: string } {
    if (!rawGradeStr) {
      return { germanGrade: 2.5, explanation: 'Default assumed GPA (no grade parsed).' };
    }

    const cleaned = parseFloat(rawGradeStr.replace(/[^0-9.]/g, ''));
    if (isNaN(cleaned) || cleaned <= 0) {
      return { germanGrade: 2.5, explanation: 'Unparsable grade value, defaulted to 2.5' };
    }

    let nMax = 10.0;
    let nMin = 4.0;
    let nd = cleaned;

    // Detect if grade is in 100-point percentage scale (e.g. 78.5%)
    if (cleaned > 10.0) {
      nMax = 100.0;
      nMin = 40.0;
      nd = Math.min(100, cleaned);
    } else {
      nd = Math.min(10, cleaned);
    }

    // Protect against sub-passing grade
    if (nd < nMin) {
      return {
        germanGrade: 4.5,
        explanation: `Calculated German Grade: 4.5 (Failed minimum pass threshold of ${nMin}).`
      };
    }

    const calculated = 1 + 3 * ((nMax - nd) / (nMax - nMin));
    const rounded = Math.round(calculated * 100) / 100;
    const clamped = Math.max(1.0, Math.min(4.0, rounded));

    return {
      germanGrade: clamped,
      explanation: `Bavarian Formula [1 + 3 * ((${nMax} - ${nd}) / (${nMax} - ${nMin}))] = ${clamped.toFixed(2)} German GPA.`
    };
  }

  /**
   * Evaluate full applicant rules across Study, Ausbildung, Chancenkarte & Austria
   */
  public evaluateApplicant(applicant: ApplicantRecord): {
    qualification: ApplicantQualification;
    recommendedJourney: RecommendedJourney;
  } {
    const pathway = applicant.motivation.pathway || 'STUDY';
    const targetCountry = applicant.personal.targetCountry || 'Germany';
    const missing: string[] = [];
    const breakdown: ApplicantQualification['pointsBreakdown'] = [];

    // 1. German Chancenkarte Calculation
    let chancenkartePoints = 0;

    // Category: Degree (4 points for recognized Indian or foreign degree)
    const hasDegree = !!(applicant.education.degree && applicant.education.degree.trim().length > 0);
    if (hasDegree) {
      chancenkartePoints += 4;
      breakdown.push({
        category: 'Recognized Academic Degree',
        points: 4,
        maxPoints: 4,
        reason: `Recognized qualification: ${applicant.education.degree}`
      });
    } else {
      breakdown.push({
        category: 'Recognized Academic Degree',
        points: 0,
        maxPoints: 4,
        reason: 'No recognized university degree detected'
      });
    }

    // Category: Professional Experience (>= 5 years: 3 pts, 2-5 years: 2 pts)
    const expMonths = applicant.employment.durationMonths || 0;
    const expYears = expMonths / 12;
    if (expYears >= 5) {
      chancenkartePoints += 3;
      breakdown.push({
        category: 'Professional Experience',
        points: 3,
        maxPoints: 3,
        reason: `${expYears.toFixed(1)} years verified experience (>= 5 years standard)`
      });
    } else if (expYears >= 2) {
      chancenkartePoints += 2;
      breakdown.push({
        category: 'Professional Experience',
        points: 2,
        maxPoints: 3,
        reason: `${expYears.toFixed(1)} years experience (2 to 5 years bracket)`
      });
    } else {
      breakdown.push({
        category: 'Professional Experience',
        points: 0,
        maxPoints: 3,
        reason: 'Less than 2 years recognized experience'
      });
    }

    // Category: Language (German B2: 3 pts, B1: 2 pts, A2 or English C1: 1 pt)
    const germanLang = applicant.languages.find(l => l.language.toLowerCase().includes('german'));
    const englishLang = applicant.languages.find(l => l.language.toLowerCase().includes('english'));
    let langPoints = 0;
    let langReason = 'No qualifying language proficiency';

    const gLevel = germanLang?.level?.toUpperCase() || 'NONE';
    const eLevel = englishLang?.level?.toUpperCase() || 'NONE';

    if (gLevel === 'B2' || gLevel === 'C1' || gLevel === 'C2') {
      langPoints = 3;
      langReason = `German ${gLevel} proficiency (+3 pts)`;
    } else if (gLevel === 'B1') {
      langPoints = 2;
      langReason = 'German B1 certified (+2 pts)';
    } else if (gLevel === 'A2' || eLevel === 'C1' || eLevel === 'C2') {
      langPoints = 1;
      langReason = gLevel === 'A2' ? 'German A2 certified (+1 pt)' : 'English C1/C2 proficiency (+1 pt)';
    }

    chancenkartePoints += langPoints;
    breakdown.push({
      category: 'Language Skills (CEFR)',
      points: langPoints,
      maxPoints: 3,
      reason: langReason
    });

    // Category: Age (< 35 years: 2 pts, 35-40 years: 1 pt)
    const age = applicant.personal.age || 25;
    let agePoints = 0;
    let ageReason = 'Age 41+ (0 points)';
    if (age > 0 && age < 35) {
      agePoints = 2;
      ageReason = `Age ${age} (< 35 years gives maximum 2 pts)`;
    } else if (age >= 35 && age <= 40) {
      agePoints = 1;
      ageReason = `Age ${age} (35-40 years gives 1 pt)`;
    }
    chancenkartePoints += agePoints;
    breakdown.push({
      category: 'Age Factor',
      points: agePoints,
      maxPoints: 2,
      reason: ageReason
    });

    // 2. Austrian Rot-Weiß-Rot-Karte Points Calculation
    // Total max ~100 points, threshold 55 points
    let austriaPoints = 0;
    if (hasDegree) austriaPoints += 25;
    if (expYears >= 5) austriaPoints += 20;
    else if (expYears >= 2) austriaPoints += 10;
    if (langPoints >= 2) austriaPoints += 15;
    else if (langPoints === 1) austriaPoints += 10;
    if (age < 35) austriaPoints += 20;
    else if (age <= 40) austriaPoints += 15;

    // 3. Indian APS (Akademische Prüfstelle) Certificate Check
    // Mandatory for all Indian degree holders applying for German Universities
    const isIndian = (applicant.personal.countryOfOrigin || 'India').toLowerCase() === 'india';
    let apsRequired = false;
    let apsStatus: ApplicantQualification['apsStatus'] = 'NOT_APPLIED';

    if (isIndian && pathway === 'STUDY') {
      apsRequired = true;
      const hasApsDoc = applicant.documents.some(d => 
        d.extractedText.toUpperCase().includes('AKADEMISCHE') || 
        d.extractedText.toUpperCase().includes('APS')
      );
      apsStatus = hasApsDoc ? 'VERIFIED' : 'REQUIRED';
      if (!hasApsDoc) {
        missing.push('Mandatory German Embassy India APS Certificate (Akademische Prüfstelle) verification required.');
      }
    }

    // Pathway Specific Checks
    let status: ApplicantQualification['status'] = 'IN_PROGRESS';

    if (pathway === 'STUDY') {
      if (!hasDegree) {
        missing.push('Higher Secondary or Bachelor graduation transcript required for University admission.');
      }
      // Check IELTS / Language for University
      const hasValidEnglish = englishLang && ['B2', 'C1', 'C2'].includes(englishLang.level.toUpperCase());
      const hasValidGerman = germanLang && ['B2', 'C1', 'C2'].includes(germanLang.level.toUpperCase());
      if (!hasValidEnglish && !hasValidGerman) {
        missing.push('University Minimum Language: IELTS >= 6.5 or German B2 certificate.');
      }
      status = missing.length === 0 ? 'QUALIFIED' : 'CONDITIONAL';
    } else if (pathway === 'AUSBILDUNG') {
      // German Ausbildung requires at least 12th standard + German B1/B2
      const isGermanB1orAbove = germanLang && ['B1', 'B2', 'C1', 'C2'].includes(germanLang.level.toUpperCase());
      if (!isGermanB1orAbove) {
        missing.push('Mandatory German B1/B2 Certificate (Goethe-Institut / Telc / ÖSD) required for Ausbildung contract.');
      }
      status = missing.length === 0 ? 'QUALIFIED' : 'CONDITIONAL';
    } else if (pathway === 'CHANCENKARTE') {
      if (chancenkartePoints < 6) {
        missing.push(`Chancenkarte requires at least 6 points (Current: ${chancenkartePoints}/6). Improve German to B1/B2 or add experience.`);
        status = 'INELIGIBLE';
      } else {
        status = 'QUALIFIED';
      }
    }

    // 4. Construct Educaro Recommended Service and Journey Steps
    let suggestedService = 'Educaro Academic & Immigration Concierge';
    let serviceDesc = 'Comprehensive pathway guidance for university placement and visa processing.';
    let timeline = 6;
    const nextSteps: string[] = [];

    if (pathway === 'STUDY') {
      suggestedService = apsRequired && apsStatus !== 'VERIFIED'
        ? 'Educaro APS Express Concierge & University Placement'
        : 'Educaro Direct University Admission & Blocked Account Setup';
      serviceDesc = 'Full support with German university applications, APS expedited filing, and blocked account allocation.';
      timeline = 7;
      nextSteps.push('Verify Degree Transcripts via APS India');
      nextSteps.push('Apply to 3 matched German public universities via Uni-Assist');
      nextSteps.push('Set up €11,904 blocked account with statutory health insurance');
    } else if (pathway === 'AUSBILDUNG') {
      suggestedService = 'Educaro Duale Ausbildung Matchmaking & Visa Sponsorship';
      serviceDesc = 'Placement with certified German training hospitals or IT training enterprises with monthly stipend (€1,100-€1,400).';
      timeline = 5;
      nextSteps.push('Attain Goethe-Institut B2 German certification');
      nextSteps.push('Complete German interview prep module');
      nextSteps.push('Sign training contract (*Ausbildungsvertrag*) with employer partner');
    } else {
      suggestedService = 'Educaro Chancenkarte Fast-Track Immigration Kit';
      serviceDesc = 'Point tally validation, ZAB degree equivalence verification, and visa appointment dossier preparation.';
      timeline = 3;
      nextSteps.push('Submit ZAB Statement of Comparability for Bachelor degree');
      nextSteps.push('Book Opportunity Card visa appointment at German Consulate');
      nextSteps.push('Prepare accommodation & relocation sponsorship in Germany');
    }

    return {
      qualification: {
        chancenkartePoints,
        austriaPoints,
        apsRequired,
        apsStatus,
        status,
        missingRequirements: missing,
        pointsBreakdown: breakdown,
      },
      recommendedJourney: {
        suggestedEducaroService: suggestedService,
        serviceDescription: serviceDesc,
        estimatedTimelineMonths: timeline,
        nextSteps,
      }
    };
  }

  /**
   * University Ranker with Dynamic Applicant GPA Matching
   */
  public matchUniversities(applicantGermanGpa?: number, targetCountry?: string): UniversityMatchResult[] {
    const applicantGpa = applicantGermanGpa && applicantGermanGpa > 0 ? applicantGermanGpa : 2.5;

    return this.universities
      .filter(u => !targetCountry || u.country.toLowerCase() === targetCountry.toLowerCase() || targetCountry === 'ALL')
      .map(uni => {
        // In German GPA scale: 1.0 is highest, 4.0 is passing.
        // If applicant GPA is <= uni.minGermanGpa, applicant meets or exceeds minimum!
        const diff = uni.minGermanGpa - applicantGpa;
        let matchStatus: UniversityMatchResult['matchStatus'] = 'Moderate Match';
        let matchScore = 75;

        if (diff >= 0.3) {
          matchStatus = 'High Match';
          matchScore = 95;
        } else if (diff >= -0.1) {
          matchStatus = 'Moderate Match';
          matchScore = 80;
        } else {
          matchStatus = 'Reach';
          matchScore = 55;
        }

        const gpaComparison = `Applicant German GPA ${applicantGpa.toFixed(2)} vs University Requirement ${uni.minGermanGpa.toFixed(1)}`;

        return {
          ...uni,
          matchStatus,
          matchScore,
          gpaComparison,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }
}
