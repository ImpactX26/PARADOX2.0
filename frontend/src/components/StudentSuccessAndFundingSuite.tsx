import React, { useState } from 'react';
import { 
  Award, 
  GraduationCap, 
  Landmark, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Search, 
  Sparkles, 
  Coins, 
  Percent, 
  ArrowRight, 
  BookOpen, 
  ShieldCheck, 
  FileText, 
  TrendingUp,
  HelpCircle,
  Clock
} from 'lucide-react';
import { ApplicantRecord } from '../types';

interface StudentSuccessAndFundingSuiteProps {
  applicant?: ApplicantRecord | null;
}

interface ScholarshipRecord {
  id: string;
  name: string;
  provider: string;
  amount: string;
  cycle: string;
  degreeLevels: string[];
  eligibility: string;
  url: string;
  badge: string;
  coverage: string[];
}

interface LoanProviderRecord {
  id: string;
  name: string;
  type: 'INDIAN_NBFC' | 'INDIAN_PSU' | 'INTERNATIONAL_FINTECH';
  typeLabel: string;
  maxAmount: string;
  interestRate: string;
  collateralRequired: 'Collateral Required' | 'Collateral-Free (No Cosigner)' | 'Optional Collateral';
  sperrkontoPreVisaDisbursement: boolean;
  url: string;
  keyFeatures: string[];
}

export const StudentSuccessAndFundingSuite: React.FC<StudentSuccessAndFundingSuiteProps> = ({
  applicant,
}) => {
  const [activeTab, setActiveTab] = useState<'dmat' | 'scholarships' | 'loans'>('dmat');

  // --- dMAT EVALUATOR STATE ---
  // Official g.a.s.t. dMAT score scale: 0 to 200 (Mean = 100, Standard Deviation = 20)
  const [coreScore, setCoreScore] = useState<number>(115);
  const [subjectScore, setSubjectScore] = useState<number>(128);
  const [selectedSubjectModule, setSelectedSubjectModule] = useState<string>(
    'Engineering & Technical Sciences'
  );

  const averageScore = Math.round((coreScore + subjectScore) / 2);

  // Standing Rating Logic based on German admissions percentiles
  const getDMatStanding = () => {
    if (averageScore >= 125 || (coreScore >= 125 && subjectScore >= 120)) {
      return {
        level: 'TU9_PRIORITY',
        label: '🏆 TU9 Elite & High-Demand Master’s Priority',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        textColor: 'text-emerald-700',
        description: 'Top 10th percentile performance nationwide. Highly competitive standing for restricted admission (NC) programs at TU Munich (TUM), RWTH Aachen, KIT, and TU Berlin.',
        percentileEstimate: 'Top 8–10% of global test-takers'
      };
    } else if (averageScore >= 100) {
      return {
        level: 'QUALIFIED_PUBLIC',
        label: '🟢 Qualified for German Public Universities',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
        textColor: 'text-blue-700',
        description: 'Solid average or above-average performance. Satisfies standard direct admission criteria across German comprehensive state universities and Universities of Applied Sciences (HAW).',
        percentileEstimate: '50th to 80th percentile'
      };
    } else {
      return {
        level: 'BELOW_AVERAGE',
        label: '⚠️ Below Average standing (Deficit Advisory)',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
        textColor: 'text-amber-700',
        description: 'Below the benchmark standard score of 100. German admission committees may view this score critically for competitive engineering or computer science seats.',
        percentileEstimate: 'Below 50th percentile (Retake recommended)'
      };
    }
  };

  const standing = getDMatStanding();

  // --- SCHOLARSHIPS DIRECTORY DATA ---
  const scholarships: ScholarshipRecord[] = [
    {
      id: 'daad',
      name: 'DAAD All-Disciplines Study Scholarship',
      provider: 'Deutscher Akademischer Austauschdienst (German Academic Exchange Service)',
      amount: '€934 / month + Health Insurance + Travel Lump Sum',
      cycle: 'Annual Intake (Applications close Oct/Nov)',
      degreeLevels: ["Master's", "Ph.D."],
      eligibility: 'Above-average Bachelor degree (German GPA ≤ 2.0 / Indian 8.0+ CGPA), well-founded study project.',
      url: 'https://www.daad.de/',
      badge: 'Premier German Federal Grant',
      coverage: ['€934/mo monthly stipend', 'Annual study allowance €460', 'Health & accident insurance', 'Travel allowance']
    },
    {
      id: 'deutschlandstipendium',
      name: 'Deutschlandstipendium (National Merit Grant)',
      provider: 'Federal Ministry of Education and Research (BMBF) + University Private Sponsors',
      amount: '€300 / month (Paid directly during enrolled studies)',
      cycle: 'Semester-based university application',
      degreeLevels: ["Bachelor's", "Master's"],
      eligibility: 'Open to enrolled students of all nationalities with outstanding academic records and societal engagement.',
      url: 'https://www.deutschlandstipendium.de/',
      badge: 'Public-Private Co-Financed',
      coverage: ['€300/mo cash grant without blocked account clawback', 'Exclusive corporate networking mentors']
    },
    {
      id: 'boell',
      name: 'Heinrich Böll Foundation Grants',
      provider: 'Heinrich Böll Stiftung (Green Party Affiliated Foundation)',
      amount: '€934 / month + €300 variable allowances',
      cycle: 'Biannual (March 1 & September 1 deadlines)',
      degreeLevels: ["Master's", "Ph.D."],
      eligibility: 'High academic performance, social and political engagement, alignment with sustainability and democratic values.',
      url: 'https://www.boell.de/en/scholarships',
      badge: 'Political Foundation',
      coverage: ['Full monthly living stipend', 'Individual mentoring and workshop program']
    },
    {
      id: 'kas',
      name: 'Konrad-Adenauer-Stiftung (KAS) Scholarship',
      provider: 'Konrad-Adenauer-Stiftung',
      amount: '€934 / month + Health & Family allowances',
      cycle: 'Annual (Deadline mid-July)',
      degreeLevels: ["Master's", "Ph.D."],
      eligibility: 'Excellent academic standing, broad civic engagement, commitment to democratic dialogue. German B2 recommended.',
      url: 'https://www.kas.de/',
      badge: 'Political Foundation',
      coverage: ['Full living allowance', 'Extensive alumni seminar network across Germany']
    },
    {
      id: 'fes',
      name: 'Friedrich Ebert Stiftung (FES) Scholarships',
      provider: 'Friedrich-Ebert-Stiftung',
      amount: 'Up to €934 / month + Health Insurance subsidies',
      cycle: 'Year-round depending on intake',
      degreeLevels: ["Bachelor's", "Master's", "Ph.D."],
      eligibility: 'Commitment to social democracy and progressive societal values, above-average academic performance.',
      url: 'https://www.fes.de/',
      badge: 'Oldest Political Foundation',
      coverage: ['Monthly base grant', 'Health insurance supplement', 'Seminars on politics and civil rights']
    },
    {
      id: 'erasmus',
      name: 'Erasmus+ Mobility Grants',
      provider: 'European Commission',
      amount: '€450 – €600 / month for exchange semesters / internships',
      cycle: 'Through German Host University International Office',
      degreeLevels: ["Bachelor's", "Master's"],
      eligibility: 'Enrolled students completing an exchange semester or industrial internship in another European partner country.',
      url: 'https://erasmus-plus.ec.europa.eu/',
      badge: 'EU-Wide Mobility Grant',
      coverage: ['Mobility travel grant', 'Zero host university tuition fees across Europe']
    }
  ];

  // --- EDUCATION LOANS HUB DATA ---
  const loanProviders: LoanProviderRecord[] = [
    {
      id: 'hdfc_credila',
      name: 'HDFC Credila Financial Services',
      type: 'INDIAN_NBFC',
      typeLabel: 'Indian Specialist NBFC',
      maxAmount: 'Up to ₹1.5 Crore (€165,000)',
      interestRate: '10.25% – 12.50% p.a.',
      collateralRequired: 'Optional Collateral',
      sperrkontoPreVisaDisbursement: true,
      url: 'https://www.hdfccredila.com/',
      keyFeatures: [
        'Direct pre-visa disbursement to Fintiba / Expatrio / Coracle blocked accounts',
        'Covers 100% of education costs, flight tickets, and German health insurance',
        'Tax deduction under Section 80E of Indian Income Tax Act on interest paid'
      ]
    },
    {
      id: 'sbi_edvantage',
      name: 'SBI Global Ed-Vantage (State Bank of India)',
      type: 'INDIAN_PSU',
      typeLabel: 'Premier Indian Public Sector Bank',
      maxAmount: 'Up to ₹1.5 Crore (Tangible Collateral Required)',
      interestRate: '8.50% – 9.65% p.a. (Subsidized Public Rate)',
      collateralRequired: 'Collateral Required',
      sperrkontoPreVisaDisbursement: true,
      url: 'https://sbi.co.in/',
      keyFeatures: [
        'Lowest public sector interest rates for German higher education',
        '0.50% concession for female applicants',
        'Repayment holiday: Course duration + 6 months'
      ]
    },
    {
      id: 'prodigy_finance',
      name: 'Prodigy Finance',
      type: 'INTERNATIONAL_FINTECH',
      typeLabel: 'International Borderless Fintech',
      maxAmount: 'Up to 100% of Cost of Attendance (USD / EUR denominated)',
      interestRate: 'EURIBOR / SOFR base + variable margin',
      collateralRequired: 'Collateral-Free (No Cosigner)',
      sperrkontoPreVisaDisbursement: true,
      url: 'https://prodigyfinance.com/',
      keyFeatures: [
        'Zero collateral, zero family co-signer requirement in India',
        'Direct EUR/USD funds transfer accepted by German visa authorities',
        'Underwritten based on future earning potential post-graduation'
      ]
    },
    {
      id: 'mpower_financing',
      name: 'MPOWER Financing',
      type: 'INTERNATIONAL_FINTECH',
      typeLabel: 'US / Global Cross-Border Lender',
      maxAmount: 'Up to $100,000 total (~€92,000)',
      interestRate: 'Fixed interest rates from 12.99%',
      collateralRequired: 'Collateral-Free (No Cosigner)',
      sperrkontoPreVisaDisbursement: true,
      url: 'https://www.mpowerfinancing.com/',
      keyFeatures: [
        'No credit history, cosigner, or physical collateral needed',
        'Visa support letter issued within 48 hours for German Consular appointment',
        'Includes free career counseling and job placement support in Europe'
      ]
    },
    {
      id: 'avanse',
      name: 'Avanse Financial Services',
      type: 'INDIAN_NBFC',
      typeLabel: 'Indian Education-Focused NBFC',
      maxAmount: 'Up to ₹1.0 Crore (€110,000)',
      interestRate: '10.75% – 12.75% p.a.',
      collateralRequired: 'Optional Collateral',
      sperrkontoPreVisaDisbursement: true,
      url: 'https://www.avanse.com/',
      keyFeatures: [
        'Fast-track 72-hour sanction letter for German VFS appointments',
        'Customized Blocked Account (*Sperrkonto*) funding packages',
        'Flexible repayment tenures up to 15 years'
      ]
    }
  ];

  const [scholarshipFilter, setScholarshipFilter] = useState<string>('ALL');
  const [loanCollateralFilter, setLoanCollateralFilter] = useState<string>('ALL');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950">
            <Sparkles className="w-3.5 h-3.5" /> Official g.a.s.t. dMAT • DAAD • Blocked Account Financing
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Official dMAT Evaluator, Scholarships & Education Loans Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Evaluate your standardized German scholastic aptitude exam (<strong>dMAT / TestAS</strong>) on the official 0–200 scale, explore fully funded DAAD and merit scholarships, and access verified pre-visa education loans for your €11,904 blocked account (*Sperrkonto*).
          </p>

          <div className="flex flex-wrap gap-3 pt-2 text-xs">
            <span className="bg-white/10 px-3 py-1 rounded-lg flex items-center gap-1.5 border border-white/10">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> g.a.s.t. 0–200 Scale Benchmark
            </span>
            <span className="bg-white/10 px-3 py-1 rounded-lg flex items-center gap-1.5 border border-white/10">
              <Coins className="w-3.5 h-3.5 text-amber-400" /> 6 Verified German Scholarships
            </span>
            <span className="bg-white/10 px-3 py-1 rounded-lg flex items-center gap-1.5 border border-white/10">
              <Landmark className="w-3.5 h-3.5 text-sky-400" /> Pre-Visa Blocked Account Loans
            </span>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('dmat')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'dmat'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4 text-emerald-400" />
          <span>1. Official dMAT Exam Performance Evaluator</span>
        </button>

        <button
          onClick={() => setActiveTab('scholarships')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'scholarships'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-amber-400" />
          <span>2. Verified Scholarships Directory (DAAD / Foundations)</span>
        </button>

        <button
          onClick={() => setActiveTab('loans')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'loans'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Landmark className="w-4 h-4 text-sky-400" />
          <span>3. Student Education Loans Hub (Sperrkonto Funding)</span>
        </button>
      </div>

      {/* ===================== TAB 1: dMAT EVALUATOR ===================== */}
      {activeTab === 'dmat' && (
        <div className="space-y-6">
          {/* Statutory Context Box */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  g.a.s.t. / APS India dMAT Standard Score Evaluator
                </h3>
                <p className="text-xs text-slate-500">
                  The digital Test for Academic Studies (dMAT / TestAS) is normed with an official <strong>average of 100</strong> and standard deviation of 20 (scale: 0–200).
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                Norm Scale: 0 – 200
              </span>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Score Input Sliders */}
              <div className="space-y-5 bg-slate-50/60 p-5 rounded-2xl border border-slate-200">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    Select Subject-Specific Module:
                  </label>
                  <select
                    value={selectedSubjectModule}
                    onChange={(e) => setSelectedSubjectModule(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-800"
                  >
                    <option value="Engineering & Technical Sciences">Engineering & Technical Sciences (Ingenieurwissenschaften)</option>
                    <option value="Mathematics, Computer Science & Natural Sciences">Mathematics, Computer Science & Natural Sciences (MINT)</option>
                    <option value="Economics & Business Studies">Economics & Business Studies (Wirtschaftswissenschaften)</option>
                    <option value="Humanities, Cultural & Social Sciences">Humanities, Cultural & Social Sciences (Geisteswissenschaften)</option>
                  </select>
                </div>

                {/* Core Module Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">1. Core Test Module Score (All Candidates):</span>
                    <span className="font-mono font-black text-sm text-sky-700">{coreScore} / 200</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="150"
                    value={coreScore}
                    onChange={(e) => setCoreScore(Number(e.target.value))}
                    className="w-full accent-sky-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Min (60)</span>
                    <span className="font-bold text-slate-600">Benchmark Avg: 100</span>
                    <span>Max (150+)</span>
                  </div>
                </div>

                {/* Subject Module Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">2. Subject Module Score:</span>
                    <span className="font-mono font-black text-sm text-emerald-700">{subjectScore} / 200</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="150"
                    value={subjectScore}
                    onChange={(e) => setSubjectScore(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Min (60)</span>
                    <span className="font-bold text-slate-600">Benchmark Avg: 100</span>
                    <span>Max (150+)</span>
                  </div>
                </div>
              </div>

              {/* Standing Gauge & Feedback Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-2xs">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Composite Evaluation
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-700">
                      Average: {averageScore} / 200
                    </span>
                  </div>

                  <div className="mt-3 text-center">
                    <div className="text-4xl font-black text-slate-900 tracking-tight">
                      {averageScore}
                      <span className="text-sm font-bold text-slate-400 ml-1">Std Score</span>
                    </div>
                    <div className="mt-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold border ${standing.badgeColor}`}>
                        {standing.label}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mt-4">
                    {standing.description}
                  </p>

                  <div className="mt-3 bg-slate-50 rounded-xl p-3 text-[11px] font-mono text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Percentile Estimate:</span>
                      <strong className={standing.textColor}>{standing.percentileEstimate}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Core Reasoning Standing:</span>
                      <strong>{coreScore >= 100 ? 'Above Benchmark (≥100)' : 'Below Benchmark (<100)'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Subject Specific Mastery:</span>
                      <strong>{subjectScore >= 125 ? 'TU9 Competitive (≥125)' : subjectScore >= 100 ? 'Standard Public (100-124)' : 'Deficit (<100)'}</strong>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 italic text-center">
                  *Standard scores are officially normalized by g.a.s.t. e.V. (Bochum) for the German Rectors’ Conference.
                </div>
              </div>
            </div>
          </div>

          {/* Official Preparation Links Directory */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Direct dMAT Test Centers, Mocks & Preparation Portals
                </h4>
                <p className="text-xs text-slate-500">Official registration, free diagnostic tests, and preparation portals</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Verified Direct Links
              </span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
              <a
                href="https://www.d-mat.de/en/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:border-emerald-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Official Exam Host
                  </span>
                  <h5 className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 transition-colors mt-2">
                    Official g.a.s.t. dMAT Center
                  </h5>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Register for computer-based dMAT test dates across test centers in India and globally.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 mt-3">
                  <span>d-mat.de/en/</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </a>

              <a
                href="https://prep.edmaster.co/language-tests/free-test/dmat/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:border-emerald-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                    Free Diagnostic Mock
                  </span>
                  <h5 className="font-bold text-xs text-slate-900 group-hover:text-sky-700 transition-colors mt-2">
                    Edmaster Free Diagnostic Test
                  </h5>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    100% free timed practice questions replicating official Core and Engineering dMAT modules.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-sky-700 mt-3">
                  <span>Take Free Mock Test</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </a>

              <a
                href="https://aps-india.de/dmat/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:border-emerald-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                    Embassy Guidelines
                  </span>
                  <h5 className="font-bold text-xs text-slate-900 group-hover:text-purple-700 transition-colors mt-2">
                    APS India dMAT Guidelines
                  </h5>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    APS New Delhi official bulletin regarding test validity and certificate integration.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-purple-700 mt-3">
                  <span>aps-india.de/dmat</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </a>

              <a
                href="https://www.jamboreeindia.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:border-emerald-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    Preparation Partner
                  </span>
                  <h5 className="font-bold text-xs text-slate-900 group-hover:text-amber-700 transition-colors mt-2">
                    Jamboree India Prep Hub
                  </h5>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Structured test coaching, question banks, and verbal/quantitative logic masterclasses.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700 mt-3">
                  <span>jamboreeindia.com</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: SCHOLARSHIPS DIRECTORY ===================== */}
      {activeTab === 'scholarships' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Verified German Public & Foundation Scholarships Directory
                </h3>
                <p className="text-xs text-slate-500">
                  Merit grants and monthly stipends available for international Bachelor, Master, and Doctoral candidates
                </p>
              </div>

              {/* Degree Filter */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                {[
                  { id: 'ALL', label: 'All Grants' },
                  { id: "Master's", label: 'Master’s Degree' },
                  { id: "Bachelor's", label: 'Bachelor’s Degree' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setScholarshipFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      scholarshipFilter === f.id
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {scholarships
                .filter(s => scholarshipFilter === 'ALL' || s.degreeLevels.includes(scholarshipFilter))
                .map((scholarship) => (
                  <div
                    key={scholarship.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {scholarship.badge}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          {scholarship.degreeLevels.join(' / ')}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {scholarship.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {scholarship.provider}
                        </p>
                      </div>

                      <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-1">
                        <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block">Award Amount:</span>
                        <strong className="text-xs text-emerald-950 font-black block font-mono">
                          {scholarship.amount}
                        </strong>
                      </div>

                      <div className="space-y-1 text-xs">
                        <span className="text-[11px] font-bold text-slate-700 block">Key Coverage:</span>
                        {scholarship.coverage.map((c, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{c}</span>
                          </div>
                        ))}
                      </div>

                      <div className="text-[11px] text-slate-500 pt-1">
                        <strong>Eligibility: </strong>{scholarship.eligibility}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <a
                        href={scholarship.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <span>Apply on Official Portal</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 3: EDUCATION LOANS HUB ===================== */}
      {activeTab === 'loans' && (
        <div className="space-y-6">
          {/* Statutory Sperrkonto Callout */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">
                  German Blocked Account (*Sperrkonto*) Pre-Visa Financing
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-lg border border-emerald-400/20">
                Official Amount: €11,904
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              To obtain a German Student Visa under § 16b AufenthG, international applicants must show proof of financial subsistence by depositing <strong>€11,904</strong> into an accredited blocked account (such as Fintiba, Expatrio, or Coracle). The verified loan providers below specialize in <strong>pre-visa direct disbursements</strong>, issuing the required consular financial sanction certificate within 48–72 hours.
            </p>
          </div>

          {/* Loan Providers Grid */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Verified German Student Education Loan Partners
                </h4>
                <p className="text-xs text-slate-500">Compare interest rates, collateral requirements, and blocked account disbursement speeds</p>
              </div>

              {/* Collateral Filter */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                {[
                  { id: 'ALL', label: 'All Lenders' },
                  { id: 'NO_COLLATERAL', label: 'Collateral-Free (No Cosigner)' },
                  { id: 'COLLATERAL', label: 'Low-Interest PSU / NBFC' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setLoanCollateralFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      loanCollateralFilter === f.id
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {loanProviders
                .filter(l => {
                  if (loanCollateralFilter === 'NO_COLLATERAL') return l.collateralRequired.includes('Collateral-Free');
                  if (loanCollateralFilter === 'COLLATERAL') return !l.collateralRequired.includes('Collateral-Free');
                  return true;
                })
                .map((provider) => (
                  <div
                    key={provider.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          provider.collateralRequired.includes('Collateral-Free')
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}>
                          {provider.collateralRequired}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {provider.typeLabel}
                        </span>
                      </div>

                      <div>
                        <h5 className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                          {provider.name}
                        </h5>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-mono font-bold text-slate-800">
                            Max: {provider.maxAmount}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500 text-[11px]">Interest Rate:</span>
                          <strong className="text-slate-900 font-mono">{provider.interestRate}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 text-[11px]">Sperrkonto Transfer:</span>
                          <span className="font-bold text-emerald-700">✓ Pre-Visa Approved</span>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs">
                        {provider.keyFeatures.map((feat, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                            <CheckCircle2 className="w-3 h-3 text-sky-600 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <a
                        href={provider.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <span>Check Eligibility & Apply</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
