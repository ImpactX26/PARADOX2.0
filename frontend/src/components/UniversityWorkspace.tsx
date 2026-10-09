import React, { useState } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Globe2, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  Award, 
  Calculator, 
  Layers, 
  FileCheck, 
  ExternalLink, 
  Search, 
  Filter, 
  Compass, 
  ArrowRight,
  TrendingUp,
  BookmarkPlus,
  Coins,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import { ApplicantRecord, TranscriptModule } from '../types';
import { DegreeLevel, GeographicRegion } from './PathwaySelector';
import { TranscriptAuditCalculator } from './TranscriptAuditCalculator';
import { UniversityRanker } from './UniversityRanker';

interface UniversityWorkspaceProps {
  initialLevel?: DegreeLevel;
  initialRegion?: GeographicRegion;
  applicant: ApplicantRecord | null;
  onUpdateApplicant?: (updates: Partial<ApplicantRecord>) => void;
  onBackToSelector?: () => void;
}

export const UniversityWorkspace: React.FC<UniversityWorkspaceProps> = ({
  initialLevel = 'masters_phd',
  initialRegion = 'germany',
  applicant,
  onUpdateApplicant,
  onBackToSelector,
}) => {
  const [level, setLevel] = useState<DegreeLevel>(initialLevel);
  const [region, setRegion] = useState<GeographicRegion>(initialRegion);

  // Sub-tabs for Germany Masters Track
  const [germanyMastersTab, setGermanyMastersTab] = useState<'TRANSCRIPT' | 'BAVARIAN_RANKER' | 'DMAT'>('TRANSCRIPT');

  // Sub-tabs for Europe Masters Track
  const [europeMastersTab, setEuropeMastersTab] = useState<'INSTITUTIONS' | 'SCHOLARSHIPS' | 'BOLOGNA_ECTS'>('INSTITUTIONS');

  // --- UNDERGRADUATE TRACK STATE (GERMANY) ---
  const [indianBoard, setIndianBoard] = useState<'CBSE_ISC' | 'STATE_BOARD'>('CBSE_ISC');
  const [boardPercentage, setBoardPercentage] = useState<number>(85);
  const [isJeeAdvancedQualified, setIsJeeAdvancedQualified] = useState<boolean>(false);
  const [hasCompletedOneYearUni, setHasCompletedOneYearUni] = useState<boolean>(false);
  const [germanLanguageLevel, setGermanLanguageLevel] = useState<string>('B1');

  // High School Equivalence Auditor Logic (12-year India vs. 13-year German Abitur)
  const getUndergradGermanyEvaluation = () => {
    if (isJeeAdvancedQualified) {
      return {
        qualificationType: 'DIRECT_ADMISSION',
        badge: '🟢 DIRECT ENTRY ELIGIBLE (JEE Advanced Exemption)',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        title: 'Direct University Admissions (*Direkter Hochschulzugang*)',
        description: 'Under the Central Office for Foreign Education (ZAB) regulations, candidates who have passed the JEE Advanced rank list receive direct general admission to German university technical/STEM bachelor degrees without attending a Studienkolleg.',
        requiredNextStep: 'Achieve Goethe/TestDaF B2/C1 German (or enroll in 100% English-taught Bachelor) + APS Certificate.',
        studienkollegNeeded: false
      };
    } else if (hasCompletedOneYearUni) {
      return {
        qualificationType: 'DIRECT_ADMISSION',
        badge: '🟢 DIRECT ENTRY ELIGIBLE (1-Year University Exemption)',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        title: 'Direct University Admissions via 1-Year Indian Bachelor Study',
        description: 'Completion of 1 successful academic year (min. 60 ECTS equivalent) at a recognized Indian H+ university in the same discipline bridges the 12-to-13-year schooling deficit, granting direct admission.',
        requiredNextStep: 'Provide 1st year university transcripts + APS Certificate.',
        studienkollegNeeded: false
      };
    } else {
      return {
        qualificationType: 'STUDIENKOLLEG_REQUIRED',
        badge: '🟡 STUDIENKOLLEG & FSP EXAM REQUIRED',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
        title: 'Preparatory College (*Studienkolleg*) + Feststellungsprüfung (FSP)',
        description: 'Indian 12-year Higher Secondary School Certificates (CBSE/ISC/State) correspond to 12 years of education, while the German Abitur requires 13 years. You must attend a 1-year public Studienkolleg and pass the FSP state examination.',
        courses: [
          { code: 'T-Kurs', target: 'Technical & Engineering degrees (Math, Physics, Chemistry, Informatics)' },
          { code: 'M-Kurs', target: 'Medicine, Biology, Pharmacy & Biochemistry' },
          { code: 'W-Kurs', target: 'Economics, Business Administration & Social Sciences' },
          { code: 'G/S-Kurs', target: 'Humanities, German Philology, Arts & Social Sciences' }
        ],
        requiredNextStep: 'Minimum Goethe B1 or B2 German required to sit for the Studienkolleg entrance exam (*Aufnahmeprüfung*).',
        studienkollegNeeded: true
      };
    }
  };

  const undergradDeEval = getUndergradGermanyEvaluation();

  // --- UNDERGRADUATE TRACK STATE (EUROPE) ---
  const [selectedEuroCountry, setSelectedEuroCountry] = useState<string>('Netherlands');

  const euroUndergradMatrix: Record<string, {
    title: string;
    institutions: string;
    recognition: string;
    foundationRequired: boolean;
    englishBenchmark: string;
    notes: string;
  }> = {
    'Netherlands': {
      title: 'Netherlands (Research WO vs Applied Sciences HBO)',
      institutions: 'TU Delft, Univ of Amsterdam, Erasmus Rotterdam, Fontys, Saxion',
      recognition: 'CBSE/ISC with 75%+ recognized for HBO (UAS). Research Universities (WO) usually require 3-4 AP subjects (score 3+) or 1 year university study.',
      foundationRequired: false,
      englishBenchmark: 'IELTS 6.0 (HBO) / 6.5 (WO) • TOEFL 80–90 • Zero Dutch required',
      notes: 'Distinct dual system: WO (scientific research, 3 yrs) vs HBO (professional, 4 yrs with integrated internships).'
    },
    'Ireland': {
      title: 'Ireland (NFQ Level 8 Honours Bachelors)',
      institutions: 'Trinity College Dublin, UCD, Univ of Galway, UCC',
      recognition: 'Direct recognition of CBSE & ISC with 75%–85% aggregate across 5 academic subjects. High demand for Software Engineering & Data Science.',
      foundationRequired: false,
      englishBenchmark: 'IELTS 6.5 (min 6.0 in each band) • Duolingo 120+',
      notes: '2-year post-study work visa (Stamp 1G) granted automatically upon bachelor graduation.'
    },
    'Sweden': {
      title: 'Sweden & Finland (Nordic University Admissions)',
      institutions: 'Lund University, KTH, Uppsala, Aalto University, Univ of Helsinki',
      recognition: 'Indian 12th recognized with Upper Secondary School Mathematics 4 / Physics 2 requirements for engineering programs.',
      foundationRequired: false,
      englishBenchmark: 'English 6 proficiency: IELTS 6.5 (no band below 5.5) / TOEFL 90',
      notes: 'Tuition fees apply for non-EU students (~€12,000–€16,000/yr), but generous merit waiver scholarships exist.'
    },
    'Norway': {
      title: 'Norway (GSU Higher Education Entrance Qualification)',
      institutions: 'Univ of Oslo, NTNU Trondheim, Univ of Bergen',
      recognition: 'Official GSU-list rule: Indian students must complete 12 years high school PLUS 1 full year of recognized university education.',
      foundationRequired: true,
      englishBenchmark: 'IELTS 6.0 / TOEFL 80',
      notes: 'Public universities have introduced tuition for non-EU students since 2023 (~€10,000–€14,000/yr).'
    },
    'United Kingdom': {
      title: 'United Kingdom (England & Scotland)',
      institutions: 'Univ of Edinburgh, Manchester, Imperial, UCL, King’s College',
      recognition: 'England: CBSE/ISC 80%–90% accepted for direct 3-year bachelor; otherwise 1-year International Foundation Year required. Scotland: 4-year Honours degrees directly admit Indian 12th.',
      foundationRequired: false,
      englishBenchmark: 'IELTS 6.0–7.0 depending on university tier',
      notes: '2-Year Graduate Route Visa for post-study employment.'
    }
  };

  // --- POSTGRADUATE TRACK STATE (EUROPE DIRECTORY) ---
  const euroPostgradInstitutions = [
    {
      country: 'Netherlands',
      flag: '🇳🇱',
      name: 'TU Delft (Delft University of Technology)',
      degrees: 'M.Sc. Computer Science, Aerospace Engineering, Robotics',
      ects: '120 ECTS (2 Years)',
      tuitionNonEu: '€20,500 / year',
      url: 'https://www.tudelft.nl/en/'
    },
    {
      country: 'Netherlands',
      flag: '🇳🇱',
      name: 'University of Amsterdam (UvA)',
      degrees: 'M.Sc. Artificial Intelligence, Data Science, Business',
      ects: '120 ECTS (2 Years)',
      tuitionNonEu: '€16,000 / year',
      url: 'https://www.uva.nl/en'
    },
    {
      country: 'Switzerland',
      flag: '🇨🇭',
      name: 'ETH Zurich (Swiss Federal Institute of Technology)',
      degrees: 'Master in Cyber Security, Data Science, Mechanical Eng',
      ects: '120 ECTS (2 Years)',
      tuitionNonEu: 'CHF 730 / semester (~€760/sem - Highly Subsidized)',
      url: 'https://ethz.ch/en.html'
    },
    {
      country: 'Switzerland',
      flag: '🇨🇭',
      name: 'EPFL (École Polytechnique Fédérale de Lausanne)',
      degrees: 'M.Sc. Computer Science, Microengineering, Biotech',
      ects: '120 ECTS (2 Years)',
      tuitionNonEu: 'CHF 780 / semester (~€810/sem)',
      url: 'https://www.epfl.ch/en/'
    },
    {
      country: 'Austria',
      flag: '🇦🇹',
      name: 'TU Wien (Vienna University of Technology)',
      degrees: 'Diplom-Ingenieur (M.Sc.) Informatics, Technical Physics',
      ects: '120 ECTS (2 Years)',
      tuitionNonEu: '€726 / semester (~€1,452/year)',
      url: 'https://www.tuwien.at/en/'
    },
    {
      country: 'Ireland',
      flag: '🇮🇪',
      name: 'Trinity College Dublin (TCD)',
      degrees: 'M.Sc. Computer Science (Intelligent Systems), Quantum Tech',
      ects: '90 ECTS (1 Year Intensive)',
      tuitionNonEu: '€24,500 total',
      url: 'https://www.tcd.ie/'
    },
    {
      country: 'Sweden',
      flag: '🇸🇪',
      name: 'KTH Royal Institute of Technology',
      degrees: 'M.Sc. Software Engineering of Distributed Systems, Machine Learning',
      ects: '120 ECTS (2 Years)',
      tuitionNonEu: 'SEK 165,000 / year (~€14,500/yr)',
      url: 'https://www.kth.se/en'
    },
    {
      country: 'Finland',
      flag: '🇫🇮',
      name: 'Aalto University',
      degrees: 'Master’s in Computer, Communication and Information Sciences',
      ects: '120 ECTS (2 Years)',
      tuitionNonEu: '€15,000 / year (100% scholarships available)',
      url: 'https://www.aalto.fi/en'
    },
    {
      country: 'United Kingdom',
      flag: '🇬🇧',
      name: 'University of Edinburgh',
      degrees: 'M.Sc. Artificial Intelligence, High Performance Computing',
      ects: '180 UK Credits = 90 ECTS (1 Year)',
      tuitionNonEu: '£38,500 total',
      url: 'https://www.ed.ac.uk/'
    }
  ];

  // Ambient Color Palettes
  // Germany: Brandenburg dark navy ambient theme (slate-950 via blue-950 to slate-900 with gold accents)
  // Europe: Starry midnight-sapphire European theme (slate-950 via indigo-950 to blue-950 with golden stars)
  const isGermany = region === 'germany';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Ambient Hero Banner */}
      <div className={`rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden transition-all duration-500 ${
        isGermany 
          ? 'bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 border border-blue-900/50' 
          : 'bg-gradient-to-r from-slate-950 via-indigo-950 to-blue-950 border border-indigo-900/50'
      }`}>
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              isGermany ? 'bg-amber-400 text-slate-950' : 'bg-amber-300 text-indigo-950'
            }`}>
              {isGermany ? '🇩🇪 BRANDENBURG ACADEMIC STANDARD' : '🇪🇺 EUROPEAN BOLOGNA FRAMEWORK'}
            </span>
            <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-slate-200">
              {level === 'undergrad' ? 'Undergraduate Track' : 'Postgraduate Masters & PhD'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            {isGermany 
              ? (level === 'undergrad' ? 'German Undergraduate & Studienkolleg Admissions' : 'German Public Universities & ECTS Deficit Engine')
              : (level === 'undergrad' ? 'Pan-European Undergraduate Admissions Matrix' : 'European Masters & Bologna 120-ECTS Ecosystem')}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            {isGermany 
              ? 'Screen your Indian secondary/tertiary credentials against the official Standing Conference of Education Ministers (KMK), evaluate ECTS credit gaps, and compute Bavarian GPA cutoffs.' 
              : 'Explore English-taught Bachelor and Master pathways across the Netherlands, Switzerland, Ireland, the Nordics, and the UK with direct credit equivalence.'}
          </p>

          {/* Dual Toggle Pills Bar (Level + Region) */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* Degree Level Switcher */}
            <div className="bg-black/30 p-1 rounded-xl flex items-center border border-white/10 text-xs font-bold">
              <button
                onClick={() => setLevel('undergrad')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  level === 'undergrad' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                🎓 Undergrad (Bachelors)
              </button>
              <button
                onClick={() => setLevel('masters_phd')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  level === 'masters_phd' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                🏛️ Masters + PhD
              </button>
            </div>

            {/* Region Switcher */}
            <div className="bg-black/30 p-1 rounded-xl flex items-center border border-white/10 text-xs font-bold">
              <button
                onClick={() => setRegion('germany')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  region === 'germany' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>🇩🇪</span> Germany
              </button>
              <button
                onClick={() => setRegion('europe')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  region === 'europe' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>🇪🇺</span> Europe
              </button>
            </div>

            {onBackToSelector && (
              <button
                onClick={onBackToSelector}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all ml-auto"
              >
                ← Back to Pathways
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. UNDERGRADUATE TRACK (level === 'undergrad')                             */}
      {/* ========================================================================= */}
      {level === 'undergrad' && (
        <div className="space-y-6">
          {/* GERMANY UNDERGRADUATE TRACK */}
          {region === 'germany' ? (
            <div className="space-y-6">
              {/* High School Equivalence Auditor Card */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">KMK Anabin Regulation</span>
                    <h2 className="text-lg font-bold text-slate-900">
                      Indian 12-Year Higher Secondary vs. German 13-Year Abitur Auditor
                    </h2>
                  </div>
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                    APS & ZAB Verification Standard
                  </span>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Interactive Inputs */}
                  <div className="space-y-4 bg-slate-50/60 p-5 rounded-2xl border border-slate-200 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Indian School Board:</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setIndianBoard('CBSE_ISC')}
                          className={`p-2.5 rounded-xl border font-bold transition-all ${
                            indianBoard === 'CBSE_ISC' ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-2xs' : 'border-slate-200 bg-white text-slate-700'
                          }`}
                        >
                          CBSE / ISC (All-India)
                        </button>
                        <button
                          onClick={() => setIndianBoard('STATE_BOARD')}
                          className={`p-2.5 rounded-xl border font-bold transition-all ${
                            indianBoard === 'STATE_BOARD' ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-2xs' : 'border-slate-200 bg-white text-slate-700'
                          }`}
                        >
                          State Secondary Board (HSC)
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-700">12th Standard Aggregate Score:</span>
                        <span className="font-mono font-bold text-blue-700 text-sm">{boardPercentage}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={boardPercentage}
                        onChange={(e) => setBoardPercentage(Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <span className="font-bold text-slate-700 block">Direct Exemption Qualifiers:</span>
                      
                      <label className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isJeeAdvancedQualified}
                          onChange={(e) => setIsJeeAdvancedQualified(e.target.checked)}
                          className="accent-blue-600"
                        />
                        <div>
                          <span className="font-bold text-slate-800">JEE Advanced Qualified (Rank List Holder)</span>
                          <span className="text-[10px] text-slate-500 block">Waives Studienkolleg for STEM/Technical degrees nationwide</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasCompletedOneYearUni}
                          onChange={(e) => setHasCompletedOneYearUni(e.target.checked)}
                          className="accent-blue-600"
                        />
                        <div>
                          <span className="font-bold text-slate-800">Completed 1 Year of Indian Bachelor (H+ University)</span>
                          <span className="text-[10px] text-slate-500 block">60 ECTS equivalent bridges the 12th-to-13th year deficit</span>
                        </div>
                      </label>
                    </div>

                    <div className="pt-2">
                      <label className="font-bold text-slate-700 block mb-1">German Language Proficiency:</label>
                      <select
                        value={germanLanguageLevel}
                        onChange={(e) => setGermanLanguageLevel(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 font-semibold text-slate-800"
                      >
                        <option value="A1">A1 Beginner</option>
                        <option value="A2">A2 Elementary</option>
                        <option value="B1">B1 Intermediate (Min for Studienkolleg entrance)</option>
                        <option value="B2">B2 Upper Intermediate (Recommended)</option>
                        <option value="C1">C1 Advanced (Direct Bachelor lectures)</option>
                      </select>
                    </div>
                  </div>

                  {/* Real-time Result Card */}
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Statutory Equivalence Ruling
                        </span>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${undergradDeEval.badgeColor}`}>
                          {undergradDeEval.badge}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-slate-900">
                        {undergradDeEval.title}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {undergradDeEval.description}
                      </p>

                      {undergradDeEval.studienkollegNeeded && (
                        <div className="space-y-2 pt-2 border-t border-slate-200">
                          <span className="text-[11px] font-bold text-slate-800 block">Applicable Studienkolleg Track (Kursarten):</span>
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            {undergradDeEval.courses?.map((c) => (
                              <div key={c.code} className="p-2 rounded-lg bg-white border border-slate-200">
                                <strong className="text-blue-700 font-bold block">{c.code}</strong>
                                <span className="text-slate-500 text-[10px]">{c.target}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-xs space-y-1">
                        <strong className="text-blue-950 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>Mandatory Next Step:</span>
                        </strong>
                        <p className="text-[11px] text-blue-900 leading-snug">
                          {undergradDeEval.requiredNextStep}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 text-[10px] text-slate-400 italic">
                      Ruling codified according to KMK Anabin "Indien - Sekundarabschlüsse" decree.
                    </div>
                  </div>
                </div>
              </div>

              {/* Mandatory Indian APS Certificate Checklist */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-amber-400" />
                    <h3 className="text-base font-bold text-white">
                      Mandatory APS India Certification Checklist for Undergraduates
                    </h3>
                  </div>
                  <a
                    href="https://aps-india.de/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <span>aps-india.de</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="grid md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                    <span className="font-bold text-amber-300 block">1. DigiLocker & Aadhaar</span>
                    <p className="text-slate-300 text-[11px]">Digital verification via DigiLocker linked to candidate Aadhaar number.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                    <span className="font-bold text-amber-300 block">2. 10th & 12th Marks</span>
                    <p className="text-slate-300 text-[11px]">Color scanned copies of CBSE/ISC/HSC certificates with school contact.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                    <span className="font-bold text-amber-300 block">3. Verification Fee</span>
                    <p className="text-slate-300 text-[11px]">Statutory ₹18,000 online fee paid to Embassy of Germany New Delhi.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                    <span className="font-bold text-amber-300 block">4. Lead Time</span>
                    <p className="text-slate-300 text-[11px]">Average 3 to 5 weeks processing before digital APS certificate is issued.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* EUROPE UNDERGRADUATE TRACK */
            <div className="space-y-6">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">European Admissions Registry</span>
                    <h2 className="text-lg font-bold text-slate-900">
                      Country-Specific Undergraduate Entry Matrix (CBSE/ISC vs Foundation)
                    </h2>
                  </div>
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-indigo-100 text-indigo-800">
                    Bachelors in English • No Foreign Language Prerequisite
                  </span>
                </div>

                {/* Country Filter Tabs */}
                <div className="flex flex-wrap items-center gap-2">
                  {Object.keys(euroUndergradMatrix).map((countryKey) => (
                    <button
                      key={countryKey}
                      onClick={() => setSelectedEuroCountry(countryKey)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        selectedEuroCountry === countryKey
                          ? 'bg-indigo-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {countryKey}
                    </button>
                  ))}
                </div>

                {/* Detailed Country Dossier */}
                {(() => {
                  const countryData = euroUndergradMatrix[selectedEuroCountry];
                  return (
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-base text-slate-900">{countryData.title}</h3>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                          countryData.foundationRequired ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {countryData.foundationRequired ? 'Foundation Year Required' : 'Direct CBSE/ISC Entry'}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 text-xs">
                        <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                          <strong className="text-slate-700 block">Top Target Institutions:</strong>
                          <span className="text-slate-900 font-medium">{countryData.institutions}</span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                          <strong className="text-slate-700 block">English Language Benchmark:</strong>
                          <span className="text-indigo-900 font-bold">{countryData.englishBenchmark}</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                        <strong className="text-slate-700 block">Indian Credential Recognition Policy:</strong>
                        <p className="text-slate-600 leading-relaxed">{countryData.recognition}</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950">
                        <strong>Academic Structure & Visa Notes: </strong>{countryData.notes}
                      </div>
                    </div>
                  );
                })()}

                {/* Comparative Matrix Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Country</th>
                        <th className="p-3">CBSE / ISC Direct Entry</th>
                        <th className="p-3">Degree Duration</th>
                        <th className="p-3">Post-Study Work Visa</th>
                        <th className="p-3">Foreign Language Needed?</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      <tr>
                        <td className="p-3 font-bold text-slate-900">Netherlands (HBO)</td>
                        <td className="p-3 text-emerald-700 font-semibold">✓ Yes (70%+)</td>
                        <td className="p-3">4 Years (240 ECTS)</td>
                        <td className="p-3">1 Year (Zoekjaar)</td>
                        <td className="p-3 font-semibold text-emerald-700">None (100% English)</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-900">Ireland</td>
                        <td className="p-3 text-emerald-700 font-semibold">✓ Yes (75%–85%)</td>
                        <td className="p-3">3 or 4 Years (Honours)</td>
                        <td className="p-3">2 Years (Stamp 1G)</td>
                        <td className="p-3 font-semibold text-emerald-700">None (English Native)</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-900">Sweden / Finland</td>
                        <td className="p-3 text-emerald-700 font-semibold">✓ Yes (With Math/Physics)</td>
                        <td className="p-3">3 Years (180 ECTS)</td>
                        <td className="p-3">1 to 2 Years</td>
                        <td className="p-3 font-semibold text-emerald-700">None (English)</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-900">Norway</td>
                        <td className="p-3 text-amber-700 font-semibold">⚠️ 1-Yr Uni Study Needed</td>
                        <td className="p-3">3 Years (180 ECTS)</td>
                        <td className="p-3">1 Year Job Search</td>
                        <td className="p-3 font-semibold text-emerald-700">None (English)</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-900">United Kingdom</td>
                        <td className="p-3 text-emerald-700 font-semibold">✓ Yes (Direct or Foundation)</td>
                        <td className="p-3">3 Yrs (Eng) / 4 Yrs (Scot)</td>
                        <td className="p-3">2 Years (Graduate Route)</td>
                        <td className="p-3 font-semibold text-emerald-700">None (English Native)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. POSTGRADUATE TRACK (level === 'masters_phd')                             */}
      {/* ========================================================================= */}
      {level === 'masters_phd' && (
        <div className="space-y-6">
          {/* GERMANY POSTGRADUATE TRACK */}
          {region === 'germany' ? (
            <div className="space-y-6">
              {/* Germany Sub-Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  onClick={() => setGermanyMastersTab('TRANSCRIPT')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    germanyMastersTab === 'TRANSCRIPT'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Calculator className="w-4 h-4 text-blue-400" />
                  <span>1. Dynamic Transcript & 1.5x ECTS Deficit Auditor</span>
                </button>

                <button
                  onClick={() => setGermanyMastersTab('BAVARIAN_RANKER')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    germanyMastersTab === 'BAVARIAN_RANKER'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>2. Bavarian GPA Formula & 420+ Public Universities</span>
                </button>

                <button
                  onClick={() => setGermanyMastersTab('DMAT')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    germanyMastersTab === 'DMAT'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>3. g.a.s.t. / APS India dMAT Evaluator</span>
                </button>
              </div>

              {/* SubTab 1: Transcript & ECTS Calculator */}
              {germanyMastersTab === 'TRANSCRIPT' && (
                <div className="space-y-6">
                  <TranscriptAuditCalculator applicant={applicant} />
                </div>
              )}

              {/* SubTab 2: Bavarian Formula & University Ranker */}
              {germanyMastersTab === 'BAVARIAN_RANKER' && (
                <div className="space-y-6">
                  <UniversityRanker applicant={applicant} selectedCountry="Germany" />
                </div>
              )}

              {/* SubTab 3: dMAT Evaluator */}
              {germanyMastersTab === 'DMAT' && (
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Official g.a.s.t. dMAT (Digital TestAS) Aptitude Evaluator
                      </h3>
                      <p className="text-xs text-slate-500">
                        Official German standardized exam (0–200 norm scale, benchmark average 100) for TU9 priority pooling.
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                      Standard Benchmark: 100
                    </span>
                  </div>

                  {/* Links Directory */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <a
                      href="https://www.d-mat.de/en/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all block group"
                    >
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Official Exam</span>
                      <h4 className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 mt-2">g.a.s.t. dMAT Center</h4>
                      <p className="text-[11px] text-slate-500 mt-1">Official test registration and international test dates.</p>
                      <span className="text-[10px] text-emerald-700 font-mono mt-2 block">d-mat.de →</span>
                    </a>

                    <a
                      href="https://prep.edmaster.co/language-tests/free-test/dmat/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all block group"
                    >
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">Diagnostic Test</span>
                      <h4 className="font-bold text-xs text-slate-900 group-hover:text-sky-700 mt-2">Edmaster Free Mock</h4>
                      <p className="text-[11px] text-slate-500 mt-1">Free timed practice tests replicating Core & Subject modules.</p>
                      <span className="text-[10px] text-sky-700 font-mono mt-2 block">Take Free Mock →</span>
                    </a>

                    <a
                      href="https://aps-india.de/dmat/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all block group"
                    >
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">Policy Bulletin</span>
                      <h4 className="font-bold text-xs text-slate-900 group-hover:text-purple-700 mt-2">APS India Guidelines</h4>
                      <p className="text-[11px] text-slate-500 mt-1">APS New Delhi bulletin regarding dMAT score validation.</p>
                      <span className="text-[10px] text-purple-700 font-mono mt-2 block">aps-india.de/dmat →</span>
                    </a>

                    <a
                      href="https://www.jamboreeindia.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all block group"
                    >
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">Coaching Hub</span>
                      <h4 className="font-bold text-xs text-slate-900 group-hover:text-amber-700 mt-2">Jamboree India Prep</h4>
                      <p className="text-[11px] text-slate-500 mt-1">Comprehensive coaching for engineering & quantitative modules.</p>
                      <span className="text-[10px] text-amber-700 font-mono mt-2 block">jamboreeindia.com →</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* EUROPE POSTGRADUATE TRACK */
            <div className="space-y-6">
              {/* Europe Sub-Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  onClick={() => setEuropeMastersTab('INSTITUTIONS')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    europeMastersTab === 'INSTITUTIONS'
                      ? 'bg-indigo-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  <span>1. Top European STEM & Business Institutions</span>
                </button>

                <button
                  onClick={() => setEuropeMastersTab('SCHOLARSHIPS')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    europeMastersTab === 'SCHOLARSHIPS'
                      ? 'bg-indigo-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>2. European Scholarships (Erasmus, Holland, Swedish Inst)</span>
                </button>

                <button
                  onClick={() => setEuropeMastersTab('BOLOGNA_ECTS')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    europeMastersTab === 'BOLOGNA_ECTS'
                      ? 'bg-indigo-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Layers className="w-4 h-4 text-sky-400" />
                  <span>3. 120-ECTS Bologna Master Structure Mapper</span>
                </button>
              </div>

              {/* SubTab 1: Institutions Directory */}
              {europeMastersTab === 'INSTITUTIONS' && (
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Top European STEM & Business Universities (English-Taught)
                      </h3>
                      <p className="text-xs text-slate-500">
                        World-ranked institutions across the Netherlands, Switzerland, Austria, Ireland, the Nordics, and the UK.
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {euroPostgradInstitutions.map((uni, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                              {uni.flag} {uni.country}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                              {uni.ects}
                            </span>
                          </div>

                          <h4 className="font-bold text-sm text-slate-900 group-hover:text-indigo-700 transition-colors">
                            {uni.name}
                          </h4>

                          <p className="text-xs text-slate-600 leading-snug">
                            {uni.degrees}
                          </p>

                          <div className="pt-2 text-[11px] text-slate-500 font-mono">
                            <span>Tuition: </span>
                            <strong className="text-slate-800">{uni.tuitionNonEu}</strong>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100">
                          <a
                            href={uni.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                          >
                            <span>Explore University</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SubTab 2: European Scholarships */}
              {europeMastersTab === 'SCHOLARSHIPS' && (
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Major Pan-European & National Government Scholarships
                      </h3>
                      <p className="text-xs text-slate-500">
                        Fully funded and tuition-waiver scholarships for international non-EU Master's candidates.
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          European Union Flagship
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-700">100% Fully Funded</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">
                        Erasmus Mundus Joint Master Degrees (EMJMD)
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Study across at least 2 to 3 different European countries. Covers 100% tuition fees, travel allowances, and €1,400/month living stipend for 24 months.
                      </p>
                      <a
                        href="https://erasmus-plus.ec.europa.eu/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline pt-1"
                      >
                        <span>Official Erasmus+ Portal</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800">
                          Netherlands Government
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-700">€5,000 Grant</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">
                        NL Scholarship (formerly Holland Scholarship)
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Financed by the Dutch Ministry of Education for international students outside the EEA doing a Bachelor or Master at participating Dutch research universities.
                      </p>
                      <a
                        href="https://www.studyinnl.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline pt-1"
                      >
                        <span>Study in NL Portal</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                          Swedish Government
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-700">Full Tuition + SEK 12,000/mo</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">
                        Swedish Institute Scholarships for Global Professionals (SISGP)
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Covers full tuition at top Swedish universities (KTH, Lund, Uppsala, Chalmers) + monthly living stipend of SEK 12,000 and travel grants.
                      </p>
                      <a
                        href="https://si.se/en/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline pt-1"
                      >
                        <span>Swedish Institute Portal</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800">
                          Swiss Confederation
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-700">CHF 1,920/mo + Waiver</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">
                        Swiss Government Excellence Scholarships
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Postgraduate research and PhD scholarships for foreign scholars and researchers at Swiss state universities and federal institutes (ETH / EPFL).
                      </p>
                      <span className="text-[11px] text-slate-500 font-mono block pt-1">
                        Administered via Federal Commission for Scholarships (FCS)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* SubTab 3: Bologna Structure */}
              {europeMastersTab === 'BOLOGNA_ECTS' && (
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Standard 120-ECTS European Master Degree Structure
                      </h3>
                      <p className="text-xs text-slate-500">
                        How European Master's programs are organized across four consecutive semesters.
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-4 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="font-bold text-indigo-700 block text-sm">Semester 1 (30 ECTS)</span>
                      <strong className="text-slate-900 block">Foundations & Theory</strong>
                      <p className="text-slate-600 text-[11px]">Core foundational coursework, theoretical models, and research methodologies.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="font-bold text-indigo-700 block text-sm">Semester 2 (30 ECTS)</span>
                      <strong className="text-slate-900 block">Specialization Electives</strong>
                      <p className="text-slate-600 text-[11px]">Domain specializations (e.g., Deep Learning, Distributed Systems, Biomechanics).</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="font-bold text-indigo-700 block text-sm">Semester 3 (30 ECTS)</span>
                      <strong className="text-slate-900 block">Advanced Lab / Internship</strong>
                      <p className="text-slate-600 text-[11px]">Industrial research project, enterprise internship, or international Erasmus exchange semester.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="font-bold text-indigo-700 block text-sm">Semester 4 (30 ECTS)</span>
                      <strong className="text-slate-900 block">Master Thesis & Defense</strong>
                      <p className="text-slate-600 text-[11px]">6-month independent research thesis (*Masterarbeit*) with oral academic defense.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
