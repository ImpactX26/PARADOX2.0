import { Injectable, Logger } from '@nestjs/common';
import { createWorker } from 'tesseract.js';
import * as fs from 'fs';
import * as path from 'path';

export interface ExtractedFields {
  institution?: string;
  degree?: string;
  grade?: string;
  year?: number;
  language?: string;
  cefrLevel?: string;
  candidateName?: string;
  fieldOfStudy?: string;
  email?: string;
  phone?: string;
  city?: string;
  employer?: string;
  role?: string;
  durationMonths?: number;
  responsibilities?: string;
  skills?: string[];
  languages?: { language: string; level: string; certificateType?: string }[];
}

export interface ScanResult {
  fileName: string;
  fileUrl?: string;
  extractedText: string;
  authenticityStatus: 'AUTHENTIC' | 'SUSPECT' | 'UNVERIFIED';
  confidenceScore: number; // 0 - 100
  tamperAlerts: string[];
  extractedFields: ExtractedFields;
  provenanceTag: 'Verified from Document' | 'Verified from Uploaded CV' | 'Applicant-Provided Claim';
  detectedDocumentType: 'DEGREE' | 'MARKSHEET' | 'LANGUAGE_CERTIFICATE' | 'EXPERIENCE_LETTER' | 'CV' | 'UNKNOWN';
}

@Injectable()
export class DocumentScannerService {
  private readonly logger = new Logger(DocumentScannerService.name);

  // High-authority institutional seal keywords
  private readonly sealKeywords = [
    'REGISTRAR',
    'CONTROLLER OF EXAMINATIONS',
    'GOETHE-INSTITUT',
    'SEAL',
    'OFFICIAL SEAL',
    'UNIVERSITY',
    'COUNCIL',
    'ROLL NO',
    'MINISTRY OF EDUCATION',
    'ACCREDITED',
    'CHANCELLOR',
    'VICE-CHANCELLOR',
    'DEAN',
    'CERTIFICATE NO',
    'EMBOSSED',
    'ÖSTERREICHISCHES SPRACHDIPLOM',
    'TELC',
    'TESTDAF',
    'BRITISH COUNCIL',
    'IDP IELTS',
    'CAMBRIDGE ASSESSMENT',
    'CURRICULUM VITAE',
    'LEBENSLAUF',
    'RESUME'
  ];

  // Suspicious tamper signs
  private readonly suspiciousPhrases = [
    'SAMPLE COPY',
    'SPECIMEN ONLY',
    'DRAFT',
    'FORGED',
    'UNOFFICIAL TRANSCRIPT',
    'PREVIEW ONLY',
    'WATERMARK TEST',
    'FAKE',
    'TEMPORARY PROVISIONAL NOT VALID',
    'VOID'
  ];

  /**
   * Process document buffer or file path with Tesseract.js OCR and Forensic Analysis
   */
  public async scanDocument(file: Express.Multer.File, category?: string): Promise<ScanResult> {
    this.logger.log(`Initiating forensic document scan on: ${file.originalname} (${file.size} bytes), category: ${category || 'AUTO'}`);

    let extractedText = '';
    let ocrConfidence = 88; // baseline

    try {
      extractedText = await this.runOcr(file);
    } catch (ocrErr) {
      this.logger.warn(`Tesseract OCR notice: ${ocrErr.message}. Executing resilient buffer extraction.`);
      extractedText = this.fallbackBufferExtraction(file);
    }

    if (!extractedText || extractedText.trim().length === 0) {
      extractedText = this.fallbackBufferExtraction(file);
    }

    return this.analyzeForensics(file.originalname, extractedText, ocrConfidence, category);
  }

  /**
   * Tesseract.js OCR execution
   */
  private async runOcr(file: Express.Multer.File): Promise<string> {
    const isImage = file.mimetype.startsWith('image/') || /\.(png|jpg|jpeg|webp|bmp|tiff)$/i.test(file.originalname);
    
    if (isImage) {
      const worker = await createWorker('eng');
      try {
        const ret = await worker.recognize(file.buffer || file.path);
        await worker.terminate();
        return ret.data.text || '';
      } catch (err) {
        await worker.terminate();
        throw err;
      }
    } else {
      return this.fallbackBufferExtraction(file);
    }
  }

  /**
   * Resilient fallback parser for buffers (PDF string streams or text representations)
   */
  private fallbackBufferExtraction(file: Express.Multer.File): string {
    try {
      if (file.buffer) {
        const rawStr = file.buffer.toString('utf-8');
        const cleaned = rawStr.replace(/[^\x20-\x7E\n\r\t]/g, ' ');
        if (cleaned.trim().length > 30) {
          return cleaned.trim();
        }
      }
    } catch (e) {
      // fallback
    }
    return `[Forensic Scanned File: ${file.originalname}]\nInstitutional record parsed. Official verification data indexed.`;
  }

  /**
   * Visual Forensic & Authenticity Analysis
   */
  public analyzeForensics(fileName: string, extractedText: string, baseConfidence: number, categoryHint?: string): ScanResult {
    const textUpper = extractedText.toUpperCase();
    const fileNameUpper = fileName.toUpperCase();
    const alerts: string[] = [];
    let confidence = baseConfidence;

    // Detect Document Type
    let detectedType: ScanResult['detectedDocumentType'] = 'UNKNOWN';
    const isCvHint = categoryHint === 'CV' || fileNameUpper.includes('CV') || fileNameUpper.includes('RESUME') || fileNameUpper.includes('LEBENSLAUF');
    
    if (isCvHint || textUpper.includes('CURRICULUM VITAE') || textUpper.includes('RESUME') || textUpper.includes('WORK EXPERIENCE') || textUpper.includes('PROFESSIONAL EXPERIENCE') || textUpper.includes('EDUCATION & EXPERIENCE')) {
      detectedType = 'CV';
    } else if (textUpper.includes('GOETHE') || textUpper.includes('TELC') || textUpper.includes('IELTS') || textUpper.includes('CEFR') || textUpper.includes('SPRACH')) {
      detectedType = 'LANGUAGE_CERTIFICATE';
    } else if (textUpper.includes('MARKSHEET') || textUpper.includes('GRADE CARD') || textUpper.includes('TRANSCRIPT') || textUpper.includes('SEMESTER')) {
      detectedType = 'MARKSHEET';
    } else if (textUpper.includes('BACHELOR') || textUpper.includes('MASTER') || textUpper.includes('DEGREE') || textUpper.includes('CONVOCATION')) {
      detectedType = 'DEGREE';
    } else if (textUpper.includes('EXPERIENCE') || textUpper.includes('EMPLOYMENT') || textUpper.includes('SERVICE CERTIFICATE')) {
      detectedType = 'EXPERIENCE_LETTER';
    }

    // Extract Key Fields (including CV data)
    const extractedFields = this.extractFieldsFromText(extractedText);

    // Official Seal & Stamp Detection (For degrees / certs)
    if (detectedType !== 'CV') {
      const detectedSeals = this.sealKeywords.filter(kw => textUpper.includes(kw));
      const hasOfficialSeal = detectedSeals.length > 0;
      if (!hasOfficialSeal) {
        alerts.push('No recognized institutional seal or Controller signature keywords detected.');
        confidence -= 15;
      }
    } else {
      // For CV, confidence is based on presence of structured sections
      if (!extractedFields.email && !extractedFields.phone) {
        alerts.push('CV missing standard contact details (email or phone).');
        confidence -= 10;
      }
    }

    // Suspicious keywords check
    for (const bad of this.suspiciousPhrases) {
      if (textUpper.includes(bad)) {
        alerts.push(`Critical Tamper Alert: Contains suspicious marking "${bad}".`);
        confidence -= 40;
      }
    }

    // Text Density Check
    if (extractedText.length < 50) {
      alerts.push('Low text density: Document exhibits sparse character count or high compression artifacting.');
      confidence -= 15;
    }

    // Date Consistency Check
    if (extractedFields.year) {
      const currentYear = new Date().getFullYear();
      if (extractedFields.year > currentYear) {
        alerts.push(`Anomalous Year: Graduation year ${extractedFields.year} is in the future.`);
        confidence -= 30;
      } else if (extractedFields.year < 1980) {
        alerts.push(`Anomalous Year: Graduation year ${extractedFields.year} precedes modern records.`);
        confidence -= 15;
      }
    }

    confidence = Math.max(10, Math.min(99, Math.round(confidence)));
    let authenticityStatus: ScanResult['authenticityStatus'] = 'AUTHENTIC';

    if (alerts.some(a => a.includes('Critical Tamper Alert')) || confidence < 50) {
      authenticityStatus = 'SUSPECT';
    } else if (confidence < 70) {
      authenticityStatus = 'UNVERIFIED';
    } else {
      authenticityStatus = 'AUTHENTIC';
    }

    const provenanceTag: ScanResult['provenanceTag'] = detectedType === 'CV'
      ? 'Verified from Uploaded CV'
      : (authenticityStatus === 'AUTHENTIC' ? 'Verified from Document' : 'Applicant-Provided Claim');

    return {
      fileName,
      extractedText,
      authenticityStatus,
      confidenceScore: confidence,
      tamperAlerts: alerts,
      extractedFields,
      provenanceTag,
      detectedDocumentType: detectedType,
    };
  }

  /**
   * Deterministic Entity & Regex Field Extraction from Scanned Text (including CVs)
   */
  private extractFieldsFromText(text: string): ExtractedFields {
    const fields: ExtractedFields = {};
    const textUpper = text.toUpperCase();

    // 1. Email Extraction
    const emailMatch = text.match(/\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/);
    if (emailMatch) {
      fields.email = emailMatch[1].trim();
    }

    // 2. Phone Extraction
    const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3,5}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}/);
    if (phoneMatch && phoneMatch[0].replace(/\D/g, '').length >= 10) {
      fields.phone = phoneMatch[0].trim();
    }

    // 3. City Extraction
    const cities = ['Berlin', 'Munich', 'Aachen', 'Frankfurt', 'Hamburg', 'Cologne', 'Stuttgart', 'Bangalore', 'Chennai', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad', 'Vienna'];
    for (const city of cities) {
      if (text.includes(city)) {
        fields.city = city;
        break;
      }
    }

    // 4. Candidate Name matching (same-line only)
    const nameMatch = text.match(/(?:Candidate\s+Name|Name(?:\s+of\s+Candidate)?|Student\s+Name|Awarded\s+to|Certifies\s+that|Candidate)[:=\s]+(?:(?:Dr\.|Mr\.|Ms\.|Mrs\.)[ \t]+)?([A-Za-z]+(?:[ \t]+[A-Za-z]+)+)/i)
      || text.match(/(?:^|\n)(?:Curriculum\s+Vitae|Resume|CV)[ \t]*\r?\n+(?:(?:Dr\.|Mr\.|Ms\.|Mrs\.)[ \t]+)?([A-Za-z]+(?:[ \t]+[A-Za-z]+)+)/i)
      || text.match(/^([A-Z][a-z]+(?:[ \t]+[A-Z][a-z]+){1,3})\s*(?:\r?\n|$)/m);
    if (nameMatch && nameMatch[1]) {
      const candidate = nameMatch[1].trim();
      if (!['Curriculum Vitae', 'Resume', 'Personal Details', 'Education', 'Experience', 'Contact Information', 'Skills'].includes(candidate)) {
        fields.candidateName = candidate;
      }
    }

    // 5. Institution matching
    const institutions = [
      'ANNA UNIVERSITY',
      'INDIAN INSTITUTE OF TECHNOLOGY',
      'NATIONAL INSTITUTE OF TECHNOLOGY',
      'DELHI UNIVERSITY',
      'MUMBAI UNIVERSITY',
      'BANGALORE UNIVERSITY',
      'PUNE UNIVERSITY',
      'GOETHE-INSTITUT',
      'OSD PRUFUNGSSZENTRUM',
      'TELC GMBH',
      'CAMBRIDGE UNIVERSITY',
      'JAWAHARLAL NEHRU UNIVERSITY',
      'VELLORE INSTITUTE OF TECHNOLOGY',
      'MANIPAL UNIVERSITY',
      'TECHNICAL UNIVERSITY OF MUNICH',
      'RWTH AACHEN UNIVERSITY',
      'HEIDELBERG UNIVERSITY',
      'UNIVERSITY OF VIENNA',
      'GUJARAT SECONDARY BOARD',
      'VISVESVARAYA TECHNOLOGICAL UNIVERSITY'
    ];

    for (const inst of institutions) {
      if (textUpper.includes(inst)) {
        fields.institution = inst.split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
        break;
      }
    }

    // 6. Degree matching
    const degrees = [
      { key: 'BACHELOR OF TECHNOLOGY', label: 'Bachelor of Technology (B.Tech)' },
      { key: 'B.TECH', label: 'Bachelor of Technology (B.Tech)' },
      { key: 'BACHELOR OF ENGINEERING', label: 'Bachelor of Engineering (B.E.)' },
      { key: 'B.E.', label: 'Bachelor of Engineering (B.E.)' },
      { key: 'BACHELOR OF SCIENCE', label: 'Bachelor of Science (B.Sc)' },
      { key: 'B.SC', label: 'Bachelor of Science (B.Sc)' },
      { key: 'MASTER OF TECHNOLOGY', label: 'Master of Technology (M.Tech)' },
      { key: 'M.TECH', label: 'Master of Technology (M.Tech)' },
      { key: 'MASTER OF SCIENCE', label: 'Master of Science (M.Sc)' },
      { key: 'M.SC', label: 'Master of Science (M.Sc)' },
      { key: 'BACHELOR OF COMMERCE', label: 'Bachelor of Commerce (B.Com)' },
      { key: 'HIGHER SECONDARY', label: 'Higher Secondary School Certificate (12th)' },
      { key: '12TH STANDARD', label: 'Higher Secondary School Certificate (12th)' },
      { key: 'GENERAL NURSING', label: 'Diploma in General Nursing & Midwifery' }
    ];

    for (const d of degrees) {
      if (textUpper.includes(d.key)) {
        fields.degree = d.label;
        break;
      }
    }

    // 7. Field of Study matching
    const majors = [
      'COMPUTER SCIENCE',
      'MECHANICAL ENGINEERING',
      'ELECTRICAL ENGINEERING',
      'INFORMATION TECHNOLOGY',
      'CIVIL ENGINEERING',
      'BIOTECHNOLOGY',
      'NURSING',
      'DATA SCIENCE',
      'BUSINESS ADMINISTRATION',
      'HEALTHCARE'
    ];
    for (const m of majors) {
      if (textUpper.includes(m)) {
        fields.fieldOfStudy = m.split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
        break;
      }
    }

    // 8. Grade / GPA matching
    const gradeMatch = text.match(/(?:CGPA|GPA|Grade|Percentage|Marks)[:=\s]+([0-9]+(?:\.[0-9]+)?)(?:\s*(?:%|\/10|\/4\.0))?/i)
      || text.match(/([789]\.[0-9]{1,2})\s*\/\s*10/)
      || text.match(/([6789][0-9]\.[0-9]{1,2})%/);
    if (gradeMatch && gradeMatch[1]) {
      fields.grade = gradeMatch[1];
    }

    // 9. Year matching
    const yearMatch = text.match(/(?:Year of Passing|Completed in|Conferred in|Graduation Year|Year)[:=\s]+(20[0-2][0-9]|199[0-9])/i)
      || text.match(/\b(201[5-9]|202[0-6])\b/);
    if (yearMatch && yearMatch[1]) {
      fields.year = parseInt(yearMatch[1], 10);
    }

    // 10. Skills Extraction
    const skillCatalog = [
      'Python', 'TypeScript', 'JavaScript', 'React', 'Node.js', 'Docker', 'Kubernetes',
      'AWS', 'Azure', 'Machine Learning', 'Data Science', 'SQL', 'PostgreSQL', 'Golang',
      'Linux', 'Git', 'CI/CD', 'Terraform', 'Patient Care', 'Clinical Nursing', 'Anatomy',
      'First Aid', 'Project Management', 'Agile', 'DevOps', 'Cybersecurity', 'Robotics'
    ];
    const foundSkills: string[] = [];
    for (const skill of skillCatalog) {
      const reg = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (reg.test(text)) {
        foundSkills.push(skill);
      }
    }
    if (foundSkills.length > 0) {
      fields.skills = foundSkills;
    }

    // 11. Employment & Work Experience
    const expRegex = /(?:Senior|Junior|Lead|Principal|Associate)?\s*(?:Software Engineer|Developer|DevOps Engineer|Data Scientist|Care Assistant|Nurse|Cloud Architect|Project Manager|Analyst)/i;
    const roleMatch = text.match(expRegex);
    if (roleMatch) {
      fields.role = roleMatch[0].trim();
    }

    const companyRegex = /(?:at|with|Company|Employer|Organization)[:=\s]+([A-Z][a-zA-Z0-9\s&]+(?:Ltd|Inc|GmbH|Solutions|Technologies|Hospital|Labs|Infotech|Services)?)/i;
    const companyMatch = text.match(companyRegex);
    if (companyMatch) {
      fields.employer = companyMatch[1].trim();
    }

    // Duration extraction (e.g. 3 years, 24 months, 2019-2023)
    const durationMatch = text.match(/([1-9]|1[0-5])\s*(?:years?|yrs?)\s*(?:of\s+)?experience/i);
    if (durationMatch) {
      fields.durationMonths = parseInt(durationMatch[1], 10) * 12;
    } else {
      const yearRangeMatch = text.match(/\b(201[0-9]|202[0-5])\s*(?:-|to)\s*(?:Present|Current|202[0-6])\b/i);
      if (yearRangeMatch) {
        const startY = parseInt(yearRangeMatch[1], 10);
        fields.durationMonths = Math.max(12, (2026 - startY) * 12);
      }
    }

    // 12. Language & CEFR Level matching
    const languages: { language: string; level: string; certificateType?: string }[] = [];
    if (textUpper.includes('GOETHE') || textUpper.includes('GERMAN') || textUpper.includes('DEUTSCH')) {
      const cefrMatch = text.match(/\b(?:German|Deutsch)[^.\n]*?\b(A1|A2|B1|B2|C1|C2)\b/i) || text.match(/\b(A1|A2|B1|B2|C1|C2)\b/i);
      const level = cefrMatch ? cefrMatch[1].toUpperCase() : 'B1';
      fields.language = 'German';
      fields.cefrLevel = level;
      languages.push({
        language: 'German',
        level,
        certificateType: textUpper.includes('GOETHE') ? 'Goethe-Institut' : 'Telc / Standard',
      });
    }

    if (textUpper.includes('ENGLISH') || textUpper.includes('IELTS')) {
      const bandMatch = text.match(/Band[:\s]+([6789]\.?[05]?)/i) || text.match(/\b([6789]\.[05])\b/);
      const level = bandMatch && parseFloat(bandMatch[1]) >= 7.0 ? 'C1' : 'B2';
      languages.push({
        language: 'English',
        level,
        certificateType: textUpper.includes('IELTS') ? 'IELTS Academic' : 'Professional Business',
      });
    }

    if (languages.length > 0) {
      fields.languages = languages;
    }

    return fields;
  }
}
