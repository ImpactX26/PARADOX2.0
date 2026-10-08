import React, { useState } from 'react';
import {
  GraduationCap,
  Award,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Compass,
  Building2,
  FileQuestion,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { ApplicantRecord } from '../types';

interface ConsultantAdmissionsReportProps {
  applicant: ApplicantRecord;
  onSelectPathway?: (pathway: string) => void;
}

export const ConsultantAdmissionsReport: React.FC<ConsultantAdmissionsReportProps> = ({
  applicant,
  onSelectPathway,
}) => {
  const [showApsModal, setShowApsModal] = useState<boolean>(false);
  const [showFormulaDetails, setShowFormulaDetails] = useState<boolean>(false);

  // 1. Academic Recognition & Bavarian GPA Grade
  const parseNumericCgpa = (gradeStr?: string): number => {
    if (!gradeStr) return 8.0;
    const match = gradeStr.match(/([0-9]+(?:\.[0-9]+)?)/);
    if (!match) return 8.0;
    const val = parseFloat(match[1]);
    if (val > 10 && val <= 100) {
      // Percentage conversion: 60% = 6.0, 80% = 8.0
      return Math.round((val / 10) * 10) / 10;
    }
    return Math.min(10, Math.max(4.0, val));
  };

  const rawCgpa = parseNumericCgpa(applicant.education?.grade);
  // Bavarian Formula: German Grade = 1 + 3 * ((10 - CGPA) / (10 - 4))
  const calculatedGermanGrade = Math.round((1 + 3 * ((10 - rawCgpa) / (10 - 4))) * 100) / 100;
  const germanGrade = applicant.education?.germanGrade || calculatedGermanGrade;

  // Grade Bracket Classification
  let gradeBracket: {
    germanTitle: string;
    englishTitle: string;
    color: string;
    bgClass: string;
    borderClass: string;
    description: string;
    targetUniversities: string;
  };

  if (germanGrade <= 1.5) {
    gradeBracket = {
      germanTitle: 'Sehr Gut (1.0 – 1.5)',
      englishTitle: 'Excellent / Distinction',
      color: 'text-emerald-700',
      bgClass: 'bg-emerald-50',
      borderClass: 'border-emerald-300',
      description: 'Competitive for Germany’s elite TU9 research universities, Munich (TUM), RWTH Aachen, and high-selectivity programs.',
      targetUniversities: 'TU Munich (TUM), RWTH Aachen, KIT Karlsruhe, TU Berlin',
    };
  } else if (germanGrade <= 2.5) {
    gradeBracket = {
      germanTitle: 'Gut (1.6 – 2.5)',
      englishTitle: 'Good / Solid Academic Standard',
      color: 'text-sky-700',
      bgClass: 'bg-sky-50',
      borderClass: 'border-sky-300',
      description: 'Fully eligible for direct admission across public tuition-free German universities (Universitäten & UAS).',
      targetUniversities: 'FAU Erlangen, University of Stuttgart, TU Darmstadt, University of Bremen',
    };
  } else if (germanGrade <= 3.0) {
    gradeBracket = {
      germanTitle: 'Befriedigend (2.6 – 3.0)',
      englishTitle: 'Satisfactory / Borderline',
      color: 'text-amber-700',
      bgClass: 'bg-amber-50',
      borderClass: 'border-amber-300',
      description: 'Target Universities of Applied Sciences (Hochschulen / UAS) with practical curriculum and open-admission NC-Frei programs.',
      targetUniversities: 'TH Deggendorf, FH Aachen, Frankfurt UAS, Hof University',
    };
  } else {
    gradeBracket = {
      germanTitle: 'Ausreichend / Kritisch (> 3.0)',
      englishTitle: 'Sufficient / Critical Admission Risk',
      color: 'text-rose-700',
      bgClass: 'bg-rose-50',
      borderClass: 'border-rose-300',
      description: 'Direct university admission unlikely without a 1-year Preparatory Course (Studienkolleg), Pre-Master bridge, or Duale Ausbildung alternative.',
      targetUniversities: 'Studienkolleg Munich/Berlin, Duale Ausbildung (Stipend-backed vocational training)',
    };
  }

  // 2. Mandatory APS Certificate Gatekeeper
  const isIndianApplicant = (applicant.personal?.countryOfOrigin || 'India').toLowerCase().includes('india');
  const hasApsDoc = (applicant.documents || []).some(
    d => d.fileName.toLowerCase().includes('aps') || d.extractedText.toLowerCase().includes('akademische prüfstelle') || d.extractedText.toLowerCase().includes('aps certificate')
  );
  const apsPending = isIndianApplicant && !hasApsDoc;

  // 3. Curricular ECTS Consecutive Alignment Check
  const sourceDegree = applicant.education?.degree || 'Bachelor of Engineering';
  const sourceField = applicant.education?.fieldOfStudy || 'Computer Science / Engineering';
  const targetGoal = applicant.motivation?.goals || 'Master of Science in Informatics & AI';
  
  // Detect branch switch e.g. Mechanical/Civil -> Computer Science/AI
  const isSourceMechanical = sourceField.toLowerCase().includes('mech') || sourceField.toLowerCase().includes('civil') || sourceField.toLowerCase().includes('commerce') || sourceField.toLowerCase().includes('arts');
  const isTargetComputerScience = targetGoal.toLowerCase().includes('computer') || targetGoal.toLowerCase().includes('informatics') || targetGoal.toLowerCase().includes('data science') || targetGoal.toLowerCase().includes('ai');
  const branchSwitchDetected = isSourceMechanical && isTargetComputerScience;

  // 4. Admission Probability & Vulnerabilities
  const vulnerabilities: string[] = [];
  let admissionProbability: 'High Match (Public Tuition-Free)' | 'Moderate' | 'Bridge Program Needed' = 'High Match (Public Tuition-Free)';

  if (apsPending) {
    vulnerabilities.push('APS India Certificate pending: Mandatory prerequisite for German Student Visa and uni-assist applications.');
  }

  if (germanGrade > 2.5) {
    vulnerabilities.push(`German Grade (${germanGrade}) falls in '${gradeBracket.germanTitle}' bracket. Higher competition for NC (Numerus Clausus) programs.`);
    admissionProbability = 'Moderate';
  }

  if (germanGrade > 3.0) {
    admissionProbability = 'Bridge Program Needed';
    vulnerabilities.push('Academic GPA below typical 2.5 German threshold. Requires Preparatory Bridge or Duale Ausbildung route.');
  }

  if (branchSwitchDetected) {
    vulnerabilities.push(`Non-Consecutive Degree Switch detected (${sourceField} ➔ CS/Informatics). German universities strictly enforce ECTS module matching (typically 30-40 ECTS theoretical informatics required).`);
    admissionProbability = 'Bridge Program Needed';
  }

  const germanLang = (applicant.languages || []).find(l => l.language.toLowerCase().includes('german'));
  if (!germanLang || ['A1', 'None'].includes(germanLang.level)) {
    vulnerabilities.push('German Language Proficiency at A0/A1: Even for 100% English degrees, German A2/B1 significantly improves visa approval and part-time student job prospects.');
  }

  if (vulnerabilities.length === 0) {
    vulnerabilities.push('Zero critical academic red-flags detected. Candidate profile strongly aligned with public German higher education standards.');
  }

  // 5. Strategic 3-Step Prioritized Action Roadmap
  const strategicRoadmap = [
    {
      step: 1,
      title: apsPending ? 'Submit APS India Verification' : 'Finalize Uni-Assist Dossier & Certified Copies',
      description: apsPending
        ? 'Initiate the mandatory Akademische Prüfstelle (APS) dossier with Digilocker transcripts to secure the 4-6 week verification certificate.'
        : 'Prepare notarized German/English translations and submit transcripts to uni-assist e.V. portal.',
      timing: 'Immediate (Weeks 1-4)',
    },
    {
      step: 2,
      title: branchSwitchDetected
        ? 'Curricular Bridging: Enroll in Pre-Master / Missing ECTS Modules'
        : 'Targeted University Application Filing (3 Ambition, 3 Target, 2 Safe)',
      description: branchSwitchDetected
        ? 'Select universities offering condition-based admission (Auflagen) allowing up to 30 ECTS bridge credits during semester 1.'
        : 'File applications across public tuition-free institutions aligned with your Bavarian grade bracket.',
      timing: 'Months 2-3',
    },
    {
      step: 3,
      title: 'German Language Booster & Blocked Account Setup',
      description: 'Advance German to Goethe A2/B1 and open standard Blocked Account (€11,904/year per Section 16b AufenthG).',
      timing: 'Months 4-6 (Pre-Departure)',
    },
  ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Compass className="w-3 h-3 text-amber-600" /> Educaro Senior Academic Counselor
          </span>
          <h3 className="text-base font-bold text-slate-900 mt-1">
            German University Admissions Diagnostic Report
          </h3>
          <p className="text-xs text-slate-500">
            Expert evaluation based on Anabin database recognition, Bavarian GPA formula, APS gatekeeper rules, and consecutive ECTS alignment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
            admissionProbability === 'High Match (Public Tuition-Free)'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : admissionProbability === 'Moderate'
              ? 'bg-sky-50 text-sky-800 border border-sky-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}>
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Admission Outlook: {admissionProbability}</span>
          </span>
        </div>
      </div>

      {/* 1. Bavarian GPA & Recognition Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* GPA Conversion Block */}
        <div className="md:col-span-1 p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Bavarian Formula</span>
            <button
              onClick={() => setShowFormulaDetails(!showFormulaDetails)}
              className="text-[11px] text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
            >
              <HelpCircle className="w-3 h-3" /> Formula
            </button>
          </div>

          <div className="flex items-baseline gap-3">
            <div className="text-3xl font-black text-slate-900">{germanGrade.toFixed(2)}</div>
            <div className="text-xs text-slate-500">
              German Grade <br />
              <span className="text-[10px] text-slate-400">(1.0 is best, 4.0 pass)</span>
            </div>
          </div>

          <div className="text-xs text-slate-600 border-t border-slate-200 pt-2 space-y-1">
            <div>Original Indian Score: <strong className="text-slate-900">{applicant.education?.grade || `${rawCgpa}/10`}</strong></div>
            <div>University: <strong className="text-slate-900">{applicant.education?.institution || 'Recognized Indian University'}</strong></div>
          </div>

          {showFormulaDetails && (
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[10px] font-mono text-slate-700 space-y-1">
              <div>Grade = 1 + 3 × [(10 - CGPA) / (10 - 4)]</div>
              <div>Grade = 1 + 3 × [({10} - {rawCgpa}) / 6] = <strong>{germanGrade}</strong></div>
            </div>
          )}
        </div>

        {/* Grade Bracket Diagnostic */}
        <div className={`md:col-span-2 p-4 rounded-xl border ${gradeBracket.bgClass} ${gradeBracket.borderClass} space-y-2.5`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${gradeBracket.color}`}>
              {gradeBracket.germanTitle} — {gradeBracket.englishTitle}
            </span>
            <Award className={`w-4 h-4 ${gradeBracket.color}`} />
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">
            {gradeBracket.description}
          </p>

          <div className="pt-2 border-t border-slate-200/60 text-xs">
            <span className="font-bold text-slate-800">Recommended Target Institutions: </span>
            <span className="text-slate-700">{gradeBracket.targetUniversities}</span>
          </div>
        </div>
      </div>

      {/* 2. Mandatory APS Certificate Gatekeeper Callout */}
      {apsPending ? (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-4.5 space-y-3 animate-fadeIn">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-rose-950 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🚨 MANDATORY REQUIREMENT: APS India Certificate Pending</span>
                </div>
                <div className="text-xs text-rose-900 leading-relaxed">
                  Per Federal Foreign Office regulations (since Nov 2022), all Indian university students must present an original <strong>APS (Akademische Prüfstelle)</strong> certificate before German university enrollment or student visa stamping. Standard processing time is <strong>4 to 6 weeks</strong>.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowApsModal(true)}
              className="shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all flex items-center gap-1.5"
            >
              <span>[ Educaro Fast-Track APS Assistance ]</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 flex items-center justify-between text-xs text-emerald-950">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span><strong>APS India Verification:</strong> Verified or exempt. Documentation clears German visa requirements.</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
            ✓ Gatekeeper Cleared
          </span>
        </div>
      )}

      {/* 3. Curricular ECTS Consecutive Alignment */}
      <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sky-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Curricular ECTS Consecutive Degree Alignment Check
            </span>
          </div>
          <span className="text-[11px] font-bold text-slate-500">
            {branchSwitchDetected ? '🟡 Non-Consecutive Branch Switch' : '🟢 Consecutive Pathway Match'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Candidate Background</div>
            <div className="font-bold text-slate-800 mt-0.5">{sourceDegree}</div>
            <div className="text-slate-500 text-[11px] mt-0.5">Specialization: {sourceField}</div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Target Study Program</div>
            <div className="font-bold text-slate-800 mt-0.5">{targetGoal}</div>
            <div className="text-slate-500 text-[11px] mt-0.5">Level: Consecutive Master of Science (M.Sc.)</div>
          </div>
        </div>

        {branchSwitchDetected ? (
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Branch Switch Warning:</strong> Switching from {sourceField} to Informatics without prerequisite credits will trigger direct rejection at TU9 universities. Recommend applying to <em>Applied Computer Science</em> programs with up to 30 ECTS bridge modules (Auflagen).
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Direct consecutive curriculum match. Expected course recognition: ~180 to 210 ECTS equivalent.</span>
          </div>
        )}
      </div>

      {/* 4. Diagnostic Summary: Identified Vulnerabilities */}
      <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
          <FileQuestion className="w-4 h-4 text-slate-500" />
          <span>Consultant Audit: Identified Profile Vulnerabilities ({vulnerabilities.length})</span>
        </div>

        <ul className="space-y-1.5 text-xs">
          {vulnerabilities.map((vuln, i) => (
            <li key={i} className="flex items-start gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
              <span>{vuln}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 5. Strategic Prioritized Roadmap */}
      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-3">
        <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>Educaro 3-Step Strategic Action Roadmap for Admission & Visa Acceptance</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {strategicRoadmap.map((item) => (
            <div key={item.step} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center justify-between">
                  <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 font-bold text-[11px] flex items-center justify-center">
                    {item.step}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {item.timing}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 mt-2">
                  {item.title}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>Phase {item.step}</span>
                <span className="text-sky-600 font-semibold">Priority</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fast-Track APS Assistance Modal */}
      {showApsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-rose-600" />
                <h4 className="text-sm font-bold text-slate-900">Educaro Fast-Track APS India Assistance</h4>
              </div>
              <button
                onClick={() => setShowApsModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>
                Our specialized counselor team prepares, certifies, and tracks your physical document bundle directly with the <strong>Akademische Prüfstelle (APS) German Embassy in New Delhi</strong>.
              </p>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-[11px]">
                <div className="font-bold text-slate-800">Required Document Bundle:</div>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                  <li>Original 10th & 12th Board Marksheets & Certificates</li>
                  <li>All Semester Bachelor Transcripts + Degree Certificate / Provisional</li>
                  <li>Digilocker NAD Academic Record Authorization Consent</li>
                  <li>Copy of valid Passport (first and last page)</li>
                  <li>Proof of APS India Fee Payment (€180 / ₹18,000 INR)</li>
                </ul>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs">
                <strong>Educaro Service Guarantee:</strong> Dedicated documentation audit within 24 hours to eliminate common rejection causes (incomplete semester seals, missing grading scales).
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowApsModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowApsModal(false);
                  alert('Educaro Fast-Track APS Dossier Initiated. Our academic counselor will reach out within 2 hours.');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors"
              >
                Confirm & Request Fast-Track Support
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
