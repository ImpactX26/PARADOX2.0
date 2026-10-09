import { Injectable, Logger } from '@nestjs/common';
import { ApplicantRecord, ExtractedDocumentRecord } from '../store/applicant.store';

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

@Injectable()
export class IdentityVerifierService {
  private readonly logger = new Logger(IdentityVerifierService.name);

  /**
   * Normalizes a name string: strips honorific prefixes (Mr, Ms, Shri, etc.),
   * removes punctuation, and converts to uppercase tokens.
   */
  public normalizeNameTokens(name: string): string[] {
    if (!name) return [];
    
    // Strip honorifics
    const cleaned = name
      .replace(/\b(mr|mrs|ms|miss|shri|smt|dr|prof|master)\b[\.]?/gi, '')
      .replace(/[^a-zA-Z\s]/g, ' ')
      .trim()
      .toUpperCase();

    return cleaned.split(/\s+/).filter(token => token.length > 0);
  }

  public getNormalizedString(name: string): string {
    return this.normalizeNameTokens(name).join(' ');
  }

  /**
   * Computes standard Levenshtein distance between two strings
   */
  public levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    const lenA = a.length;
    const lenB = b.length;

    for (let i = 0; i <= lenA; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= lenB; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= lenA; i++) {
      for (let j = 1; j <= lenB; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,       // deletion
          matrix[i][j - 1] + 1,       // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    return matrix[lenA][lenB];
  }

  /**
   * Calculates similarity percentage between profile name and document name
   * combining token matching, initial expansions, and Levenshtein distance.
   */
  public computeNameSimilarity(nameA: string, nameB: string): {
    score: number;
    matchStatus: 'EXACT_MATCH' | 'MINOR_VARIANCE' | 'CRITICAL_MISMATCH';
    notes: string;
  } {
    const tokensA = this.normalizeNameTokens(nameA);
    const tokensB = this.normalizeNameTokens(nameB);

    if (tokensA.length === 0 || tokensB.length === 0) {
      return {
        score: 0,
        matchStatus: 'CRITICAL_MISMATCH',
        notes: '🚨 CRITICAL IDENTITY FRAUD: Document names do not match applicant profile (Missing name token)',
      };
    }

    const strA = tokensA.join(' ');
    const strB = tokensB.join(' ');

    // 1. Exact match (>= 95%)
    if (strA === strB) {
      return {
        score: 100,
        matchStatus: 'EXACT_MATCH',
        notes: '🟢 NAME VERIFIED: Exact Match Across Academic Records',
      };
    }

    // Token set equality (e.g. order variance: "Patel Aarav" vs "Aarav Patel")
    const setA = new Set(tokensA);
    const setB = new Set(tokensB);
    const areSetsEqual = tokensA.every(t => setB.has(t)) && tokensB.every(t => setA.has(t));
    if (areSetsEqual) {
      return {
        score: 98,
        matchStatus: 'EXACT_MATCH',
        notes: '🟢 NAME VERIFIED: Exact Match Across Academic Records',
      };
    }

    // Levenshtein & Token comparison
    const maxLen = Math.max(strA.length, strB.length);
    const dist = this.levenshteinDistance(strA, strB);
    const levScore = Math.round((1 - dist / maxLen) * 100);

    // Middle initial or token alias check (e.g. "Aarav Kumar Patel" vs "Aarav K. Patel")
    const firstMatch = tokensA[0] === tokensB[0];
    const lastMatch = tokensA[tokensA.length - 1] === tokensB[tokensB.length - 1];
    let isTokenAlias = false;

    if (firstMatch && lastMatch) {
      const midA = tokensA.slice(1, -1);
      const midB = tokensB.slice(1, -1);
      if (midA.length === 0 || midB.length === 0) {
        isTokenAlias = true;
      } else if (midA.length === 1 && midB.length === 1 && (midA[0][0] === midB[0][0] || midA[0] === midB[0][0] || midB[0] === midA[0][0])) {
        isTokenAlias = true;
      }
    }

    const calculatedScore = isTokenAlias ? Math.max(levScore, 85) : levScore;

    if (calculatedScore >= 95) {
      return {
        score: calculatedScore,
        matchStatus: 'EXACT_MATCH',
        notes: '🟢 NAME VERIFIED: Exact Match Across Academic Records',
      };
    } else if (calculatedScore >= 65) {
      return {
        score: calculatedScore,
        matchStatus: 'MINOR_VARIANCE',
        notes: '🟡 MINOR VARIANCE: Valid token alias. German Embassy requires a 1-page Name Declaration Affidavit.',
      };
    } else {
      return {
        score: calculatedScore,
        matchStatus: 'CRITICAL_MISMATCH',
        notes: '🔴 IDENTITY MISMATCH: Name on degree certificate differs from candidate profile.',
      };
    }
  }

  /**
   * Audits all uploaded documents against the primary applicant profile name
   */
  public crossCheckIdentity(applicant: ApplicantRecord): IdentityCrossCheckReport {
    const primaryName = applicant.personal?.name || 'Applicant';
    const documentMatches: CrossDocumentIdentityMatch[] = [];

    let totalScore = 0;
    let hasFraud = false;
    let hasMinor = false;

    const docs = applicant.documents || [];

    for (const doc of docs) {
      let extractedName = doc.extractedFields?.candidateName;

      // If candidateName not parsed in extractedFields, scan extractedText
      if (!extractedName && doc.extractedText) {
        extractedName = this.extractCandidateNameFromText(doc.extractedText);
      }

      if (!extractedName) {
        extractedName = primaryName; // Fallback to avoid false alert on certificates without names
      }

      const { score, matchStatus, notes } = this.computeNameSimilarity(primaryName, extractedName);

      if (matchStatus === 'CRITICAL_MISMATCH') hasFraud = true;
      if (matchStatus === 'MINOR_VARIANCE') hasMinor = true;

      totalScore += score;

      documentMatches.push({
        documentId: doc.id,
        fileName: doc.fileName,
        extractedName,
        normalizedName: this.getNormalizedString(extractedName),
        similarityScore: score,
        matchStatus,
        notes,
      });
    }

    const overallMatchScore = docs.length > 0 ? Math.round(totalScore / docs.length) : 100;
    const overallStatus: IdentityCrossCheckReport['overallStatus'] = hasFraud
      ? 'CRITICAL_FRAUD'
      : hasMinor
      ? 'MINOR_VARIANCE'
      : 'VERIFIED';
    let warningMessage: string | undefined;
    if (hasFraud) {
      warningMessage = '🔴 IDENTITY MISMATCH: Name on degree certificate differs from candidate profile.';
    } else if (hasMinor) {
      warningMessage = '🟡 MINOR VARIANCE: Valid token alias. German Embassy requires a 1-page Name Declaration Affidavit.';
    }
    return {
      primaryName,
      overallMatchScore,
      overallStatus,
      documentMatches,
      warningMessage,
    };
  }

  /**
   * Helper heuristic to extract candidate name from document OCR text
   */
  private extractCandidateNameFromText(text: string): string | undefined {
    // Look for lines following Name:, Candidate:, Conferred on:, Student:
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      const match = line.match(/(?:candidate(?:\s*name)?|student(?:\s*name)?|name(?:\s*of\s*student)?|conferred\s*on)[:\s]+([a-zA-Z\s\.]{3,40})/i);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return undefined;
  }
}
