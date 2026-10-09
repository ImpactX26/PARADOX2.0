import React, { useState } from 'react';
import { 
  Briefcase, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Euro, 
  ShieldCheck, 
  Sparkles, 
  HelpCircle, 
  Calendar, 
  User, 
  Globe2, 
  ArrowRight,
  TrendingUp,
  FileCheck2,
  ExternalLink,
  Search,
  Filter,
  Building,
  Clock,
  Layers,
  Info
} from 'lucide-react';
import { ApplicantRecord } from '../types';

interface ChancenkartePortalProps {
  applicant: ApplicantRecord | null;
  onUpdateQualification?: (score: number) => void;
}

interface JobPortal {
  id: string;
  name: string;
  category: 'FEDERAL' | 'GENERAL' | 'NETWORKING' | 'INTERNSHIP';
  categoryLabel: string;
  badge: string;
  url: string;
  description: string;
  features: string[];
  chancenkarteFriendly: boolean;
  language: 'English & German' | 'German-focused' | 'Primarily English';
}

export const ChancenkartePortal: React.FC<ChancenkartePortalProps> = ({
  applicant,
  onUpdateQualification,
}) => {
  // Configurable Criteria States based on § 20a AufenthG
  const [hasRecognizedDegree, setHasRecognizedDegree] = useState<boolean>(
    Boolean(applicant?.education?.degree && applicant.education.isVerified) || true
  );
  const [workExperienceYears, setWorkExperienceYears] = useState<number>(
    applicant?.employment?.durationMonths ? Math.round(applicant.employment.durationMonths / 12) : 3
  );
  const [germanLevel, setGermanLevel] = useState<string>(
    applicant?.languages?.find(l => l.language.toLowerCase().includes('german'))?.level || 'A2'
  );
  const [hasEnglishC1, setHasEnglishC1] = useState<boolean>(true);
  const [age, setAge] = useState<number>(applicant?.personal?.age || 27);
  const [isShortageOccupation, setIsShortageOccupation] = useState<boolean>(true);
  const [hasPreviousStayInGermany, setHasPreviousStayInGermany] = useState<boolean>(false);

  // Job Search / Portals State
  const [portalCategoryFilter, setPortalCategoryFilter] = useState<string>('ALL');
  const [portalSearchQuery, setPortalSearchQuery] = useState<string>('');

  // 1. Calculate Statutory Points (§ 20a AufenthG)
  // 4 pts: Foreign university degree recognized in Anabin (H+)
  const degreePoints = hasRecognizedDegree ? 4 : 0;

  // 3 pts: Professional work experience >= 5 yrs (or 2 pts for 2-4 yrs)
  let expPoints = 0;
  if (workExperienceYears >= 5) expPoints = 3;
  else if (workExperienceYears >= 2) expPoints = 2;

  // 3 pts: German B2 (or 2 pts for B1, 1 pt for A2 + English C1)
  let langPoints = 0;
  if (['B2', 'C1', 'C2', 'Fluent'].includes(germanLevel)) {
    langPoints = 3;
  } else if (germanLevel === 'B1') {
    langPoints = 2;
  } else if (germanLevel === 'A2' && hasEnglishC1) {
    langPoints = 1;
  } else if (germanLevel === 'A2') {
    langPoints = 1;
  }

  // 2 pts: Age under 35 (or 1 pt for 35-40)
  let agePoints = 0;
  if (age < 35 && age > 0) agePoints = 2;
  else if (age >= 35 && age <= 40) agePoints = 1;

  // 1 pt: Shortage occupation (IT, STEM, Healthcare)
  const shortagePoints = isShortageOccupation ? 1 : 0;

  // 1 pt: Previous legitimate stay in Germany (min 6 months)
  const stayPoints = hasPreviousStayInGermany ? 1 : 0;

  const totalPoints = degreePoints + expPoints + langPoints + agePoints + shortagePoints + stayPoints;
  const isQualified = totalPoints >= 6;

  // Verified German Job & Internship Portals Directory
  const jobPortals: JobPortal[] = [
    {
      id: 'arbeitsagentur',
      name: 'Bundesagentur für Arbeit (BA Jobsuche)',
      category: 'FEDERAL',
      categoryLabel: 'Official Federal Agency',
      badge: 'Official Federal Job Exchange',
      url: 'https://www.arbeitsagentur.de/jobsuche/',
      description: 'The German Federal Employment Agency’s national job registry with over 1.8M verified job vacancies across all 16 federal states. Directly integrated with immigration authorities.',
      features: ['Official Government Register', 'Minijob & Secondary Work Listings', 'Direct Federal Employer Links'],
      chancenkarteFriendly: true,
      language: 'English & German'
    },
    {
      id: 'make_it_in_germany',
      name: 'Make it in Germany',
      category: 'FEDERAL',
      categoryLabel: 'Official Federal Agency',
      badge: 'Federal Qualified Professionals Portal',
      url: 'https://www.make-it-in-germany.com/en/',
      description: 'The Federal Government’s portal for international qualified professionals. Features curated vacancies from employers open to sponsoring international talents and accepting the Opportunity Card.',
      features: ['Chancenkarte Pre-Approved Roles', 'Visa Integration Guidance', 'Verified German Corporate Hosts'],
      chancenkarteFriendly: true,
      language: 'English & German'
    },
    {
      id: 'stepstone',
      name: 'StepStone Deutschland',
      category: 'GENERAL',
      categoryLabel: 'Commercial Portal',
      badge: 'Tech & English-Speaking Filter Hub',
      url: 'https://www.stepstone.de/',
      description: 'Leading German professional employment engine with dedicated filters for English-speaking jobs, Chancenkarte visa holders, tech startups, and engineering roles.',
      features: ['Salary Benchmarks (*Gehaltsvergleich*)', '1-Click Fast Applications', 'Direct Recruiter Outreach'],
      chancenkarteFriendly: true,
      language: 'English & German'
    },
    {
      id: 'xing',
      name: 'Xing Jobs',
      category: 'NETWORKING',
      categoryLabel: 'DACH Professional Network',
      badge: 'Premier DACH Network',
      url: 'https://www.xing.com/jobs',
      description: 'The dominant professional career network for the DACH region (Germany, Austria, Switzerland). Essential for mid-to-senior engineering, business consulting, and German corporate hires.',
      features: ['DACH Regional Exclusives', 'Headhunter Direct Messaging', 'German CV / Profil Synchronizer'],
      chancenkarteFriendly: true,
      language: 'German-focused'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn Jobs Germany',
      category: 'NETWORKING',
      categoryLabel: 'Global Network',
      badge: 'Tech & Startup Ecosystem',
      url: 'https://www.linkedin.com/jobs/',
      description: 'Primary platform for international scale-ups, Berlin/Munich tech hubs, and multinational DAX enterprises hiring English-fluent software engineers, AI specialists, and data scientists.',
      features: ['English-Only Role Filters', 'Remote & Hybrid Options in DE', 'Alumni & University Connections'],
      chancenkarteFriendly: true,
      language: 'Primarily English'
    },
    {
      id: 'meinpraktikum',
      name: 'MeinPraktikum & Praktikum.info',
      category: 'INTERNSHIP',
      categoryLabel: 'Internships & Trial Work',
      badge: 'Verified Trial Work Engine',
      url: 'https://www.meinpraktikum.de/',
      description: 'Premier national engine for short-term internships, 2-week trial work (*Probearbeit*) placements, and entry-level positions permitted under § 20a AufenthG statutory work rights.',
      features: ['2-Week Probearbeit Placement', 'Student & Graduate Internships', 'Employer Reviews & Stipends'],
      chancenkarteFriendly: true,
      language: 'German-focused'
    }
  ];

  const filteredPortals = jobPortals.filter(p => {
    const matchesCategory = portalCategoryFilter === 'ALL' || p.category === portalCategoryFilter;
    const matchesSearch = 
      p.name.toLowerCase().includes(portalSearchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(portalSearchQuery.toLowerCase()) ||
      p.badge.toLowerCase().includes(portalSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950">
            <Sparkles className="w-3.5 h-3.5" /> AufenthG § 20a • Chancenkarte (Opportunity Card)
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            German Opportunity Card Points Simulator & Employment Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Under Germany's Skilled Immigration Act (*Fachkräfteeinwanderungsgesetz* § 20a AufenthG), qualified candidates can enter Germany for up to <strong>12 months</strong> to secure qualified employment. Score at least <strong>6 points</strong> on the statutory gauge to qualify.
          </p>

          <div className="flex flex-wrap gap-3 pt-2 text-xs">
            <span className="bg-white/10 px-3 py-1 rounded-lg flex items-center gap-1.5 border border-white/10">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Minimum Pass: ≥ 6 Points
            </span>
            <span className="bg-white/10 px-3 py-1 rounded-lg flex items-center gap-1.5 border border-white/10">
              <Clock className="w-3.5 h-3.5 text-sky-400" /> 20 Hrs/Week Secondary Work
            </span>
            <span className="bg-white/10 px-3 py-1 rounded-lg flex items-center gap-1.5 border border-white/10">
              <Briefcase className="w-3.5 h-3.5 text-amber-400" /> 2-Week Trial Work (Probearbeit)
            </span>
          </div>
        </div>
      </div>

      {/* Statutory Work Rights Callout Box (§ 20a AufenthG) */}
      <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-slate-50 border-2 border-amber-400/50 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              §
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Statutory Work Rights While Searching for Employment (§ 20a AufenthG)
              </h2>
              <p className="text-xs text-slate-600">Official Federal rights granted immediately upon Opportunity Card visa activation</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
            Legal Entitlement
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-white border border-amber-200/80 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>20 Hours/Week Secondary Employment</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Holders are legally entitled to engage in secondary employment for up to <strong>20 hours per week</strong> or take up a <strong>Minijob (€538/month)</strong> in any sector (retail, hospitality, logistics, tech support) while actively seeking qualified permanent employment.
            </p>
            <div className="text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md inline-block">
              ✓ Provides immediate cashflow to offset living costs
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-amber-200/80 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
              <Briefcase className="w-4 h-4 text-amber-600" />
              <span>2-Week Trial Work (*Probearbeit*)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Allows you to carry out work on a trial basis for up to <strong>2 consecutive weeks per employer</strong> with prospective German enterprises. No separate work permit from the Foreigners Authority (*Ausländerbehörde*) is required.
            </p>
            <div className="text-[11px] font-mono font-medium text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md inline-block">
              ✓ Fast-track conversion into a full EU Blue Card or § 18b permit
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: 6-Point Gauge & Interactive Scorecard */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Points Criteria Inputs */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Statutory 6-Point Criteria Simulator</h3>
                <p className="text-xs text-slate-500">Calculate points as codified in § 20a AufenthG schedule</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800">
                Threshold: ≥ 6 Points
              </span>
            </div>

            {/* Criteria 1: Degree Recognition */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span>1. University Degree Recognition (Anabin H+)</span>
                </div>
                <span className="font-bold font-mono text-xs text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full">
                  +{degreePoints} / 4 Pts
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Foreign university degree fully or conditionally recognized as equivalent to a German Bachelor's or Master's degree in the official Anabin database.
              </p>
              <div className="flex flex-wrap gap-4 pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="radio"
                    name="degreeRadio"
                    checked={hasRecognizedDegree}
                    onChange={() => {
                      setHasRecognizedDegree(true);
                      onUpdateQualification?.(degreePoints + expPoints + langPoints + agePoints + shortagePoints + stayPoints);
                    }}
                    className="accent-purple-600"
                  />
                  <span>Recognized Degree (Anabin H+ or ZAB Statement) (+4 Pts)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="radio"
                    name="degreeRadio"
                    checked={!hasRecognizedDegree}
                    onChange={() => setHasRecognizedDegree(false)}
                    className="accent-purple-600"
                  />
                  <span>Non-Recognized Degree (0 Pts)</span>
                </label>
              </div>
            </div>

            {/* Criteria 2: Experience */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-purple-600" />
                  <span>2. Professional Work Experience (in qualification field)</span>
                </div>
                <span className="font-bold font-mono text-xs text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full">
                  +{expPoints} / 3 Pts
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Selected Experience: <strong className="text-slate-900">{workExperienceYears} Years</strong></span>
                  <span className="text-[11px] text-slate-500">≥5 yrs = 3 pts | 2–4 yrs = 2 pts | &lt;2 yrs = 0 pts</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  value={workExperienceYears}
                  onChange={(e) => setWorkExperienceYears(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Criteria 3: Languages */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <Globe2 className="w-4 h-4 text-purple-600" />
                  <span>3. Language Competency (German & English)</span>
                </div>
                <span className="font-bold font-mono text-xs text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full">
                  +{langPoints} / 3 Pts
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] text-slate-500 font-bold block mb-1">German CEFR Level:</label>
                  <select
                    value={germanLevel}
                    onChange={(e) => setGermanLevel(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium"
                  >
                    <option value="None">None / Below A2 (0 Pts)</option>
                    <option value="A2">German A2 (+1 Pt with Eng C1 or standalone)</option>
                    <option value="B1">German B1 (+2 Pts)</option>
                    <option value="B2">German B2 or higher (+3 Pts)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-bold block mb-1">English Proficiency:</label>
                  <label className="flex items-center gap-2 p-2 bg-white border border-slate-300 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasEnglishC1}
                      onChange={(e) => setHasEnglishC1(e.target.checked)}
                      className="accent-purple-600"
                    />
                    <span>English C1 (IELTS 7.0+ / TOEFL 95+)</span>
                  </label>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    *German A2 + English C1 qualifies for +1 pt
                  </span>
                </div>
              </div>
            </div>

            {/* Criteria 4: Age */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-purple-600" />
                  <span>4. Applicant Age at Application Date</span>
                </div>
                <span className="font-bold font-mono text-xs text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full">
                  +{agePoints} / 2 Pts
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Current Age: <strong className="text-slate-900">{age || 27} Years</strong></span>
                  <span className="text-[11px] text-slate-500">&lt;35 yrs = 2 pts | 35–40 yrs = 1 pt | &gt;40 yrs = 0 pts</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="50"
                  value={age || 27}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Criteria 5 & 6: Bonus Points */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">5. Shortage Occupation</span>
                  <span className="font-bold font-mono text-xs text-purple-800">+{shortagePoints} Pt</span>
                </div>
                <p className="text-[11px] text-slate-500">STEM, IT Specialists, Healthcare, Engineering</p>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={isShortageOccupation}
                    onChange={(e) => setIsShortageOccupation(e.target.checked)}
                    className="accent-purple-600"
                  />
                  <span>Matches Bottleneck List (*Engpassberufe*)</span>
                </label>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">6. Previous Stay in Germany</span>
                  <span className="font-bold font-mono text-xs text-purple-800">+{stayPoints} Pt</span>
                </div>
                <p className="text-[11px] text-slate-500">Continuous legal stay in Germany for min. 6 months</p>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={hasPreviousStayInGermany}
                    onChange={(e) => setHasPreviousStayInGermany(e.target.checked)}
                    className="accent-purple-600"
                  />
                  <span>Verified 6+ Months Prior Stay</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Real-Time Pass Gauge */}
        <div className="space-y-5">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">
                Official Points Gauge
              </span>
              <Award className="w-5 h-5 text-purple-600" />
            </div>

            {/* Radial / Counter Display */}
            <div className="text-center py-2 space-y-2">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-36 h-36 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={isQualified ? "text-emerald-500 transition-all duration-500" : "text-amber-500 transition-all duration-500"}
                    strokeDasharray={`${Math.min(100, Math.round((totalPoints / 6) * 100))}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-4xl font-black text-slate-900 tracking-tight">{totalPoints}</span>
                  <span className="block text-[11px] font-bold text-slate-400">/ 6 TARGET</span>
                </div>
              </div>

              <div>
                <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold ${
                  isQualified
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}>
                  {isQualified ? '🟢 QUALIFIED: ≥ 6 Points Passed' : `🔴 DEFICIT: Need ${6 - totalPoints} More Point(s)`}
                </span>
              </div>
            </div>

            {/* Detailed Point Breakdown */}
            <div className="bg-slate-50 rounded-xl p-3.5 text-xs space-y-1.5 font-mono border border-slate-200/80">
              <div className="flex justify-between"><span>Anabin H+ Degree:</span><strong>+{degreePoints} pts</strong></div>
              <div className="flex justify-between"><span>Work Experience:</span><strong>+{expPoints} pts</strong></div>
              <div className="flex justify-between"><span>Languages (DE/EN):</span><strong>+{langPoints} pts</strong></div>
              <div className="flex justify-between"><span>Age Scoring:</span><strong>+{agePoints} pts</strong></div>
              <div className="flex justify-between"><span>Shortage Occupation:</span><strong>+{shortagePoints} pt</strong></div>
              <div className="flex justify-between"><span>Previous German Stay:</span><strong>+{stayPoints} pt</strong></div>
              <div className="flex justify-between pt-2 border-t border-slate-200 font-black text-slate-900 text-sm">
                <span>Total Accumulated:</span><span>{totalPoints} / 6</span>
              </div>
            </div>

            {isQualified ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 space-y-1">
                <strong>✓ Statutory Visa Readiness:</strong>
                <p className="text-[11px] text-emerald-800 leading-snug">
                  You are eligible to file the Opportunity Card application at your local German mission or VFS Global center.
                </p>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 space-y-1">
                <strong>Bridge the Gap:</strong>
                <p className="text-[11px] text-amber-800 leading-snug">
                  Advance German to B1 (+2 pts) or B2 (+3 pts), or achieve verified C1 English with A2 German (+1 pt).
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Embedded Job & Internship Directory */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Verified German Employment & Internship Portals Directory
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Curated official federal platforms and DACH employment engines supporting Opportunity Card applicants and trial work
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'ALL', label: 'All Portals' },
              { id: 'FEDERAL', label: '🏛️ Official Federal' },
              { id: 'GENERAL', label: '💼 StepStone / Tech' },
              { id: 'NETWORKING', label: '🤝 DACH Networks' },
              { id: 'INTERNSHIP', label: '🎯 Trial Work / Probearbeit' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setPortalCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  portalCategoryFilter === cat.id
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by portal name, keyword (e.g. trial work, tech, federal, DACH)..."
            value={portalSearchQuery}
            onChange={(e) => setPortalSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Grid of Portals */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPortals.map((portal) => (
            <div
              key={portal.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                    {portal.badge}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {portal.language}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                    {portal.name}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">
                    {portal.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-1">
                  {portal.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <a
                  href={portal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>Launch Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
