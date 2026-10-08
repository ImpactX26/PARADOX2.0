import React from 'react';
import { 
  Compass, 
  GraduationCap, 
  Mic, 
  Calculator, 
  Users, 
  ShieldCheck, 
  Sparkles, 
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  ChevronDown,
  BookOpen
} from 'lucide-react';
import { ApplicantRecord } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  applicant: ApplicantRecord | null;
  applicants?: ApplicantRecord[];
  onSwitchApplicant?: (id: string) => void;
  onCreateNewApplicant?: () => void;
  onInjectSample: (persona: string) => void;
  onReset: () => void;
  onCountryToggle: (country: 'Germany' | 'Austria') => void;
  selectedCountry: 'Germany' | 'Austria';
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  applicant,
  applicants = [],
  onSwitchApplicant,
  onCreateNewApplicant,
  onInjectSample,
  onReset,
  onCountryToggle,
  selectedCountry,
}) => {
  // Calculate profile completeness
  let filledFields = 0;
  const totalFields = 8;
  if (applicant?.personal?.name) filledFields++;
  if (applicant?.personal?.email) filledFields++;
  if (applicant?.education?.degree) filledFields++;
  if (applicant?.education?.grade) filledFields++;
  if (applicant?.languages && applicant.languages.length > 0) filledFields++;
  if (applicant?.documents && applicant.documents.length > 0) filledFields++;
  if (applicant?.media?.videoPitchTranscript) filledFields++;
  if (applicant?.skills && applicant.skills.length > 0) filledFields++;

  const completenessPercent = Math.round((filledFields / totalFields) * 100);

  // Authenticity metrics
  const totalDocs = applicant?.documents?.length || 0;
  const authenticDocs = applicant?.documents?.filter(d => d.authenticityStatus === 'AUTHENTIC').length || 0;
  const suspectDocs = applicant?.documents?.filter(d => d.authenticityStatus === 'SUSPECT').length || 0;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Banner & Quick Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium bg-sky-50 text-sky-700 border border-sky-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
            IMPACTX '26 Hackathon • Agentic AI Track
          </span>
          <span className="hidden sm:inline-block text-slate-400">|</span>
          <span className="hidden sm:inline-block text-slate-500">
            Educaro Deutschland GmbH
          </span>
        </div>

        {/* Multi-Applicant Switcher & Jury Quick-Pitch Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Multi-Applicant Switcher & New Applicant Button */}
          {applicants.length > 0 && onSwitchApplicant && (
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200">
              <select
                value={applicant?.id || ''}
                onChange={(e) => onSwitchApplicant(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 py-0.5 px-1.5 focus:outline-none cursor-pointer max-w-[150px] truncate"
              >
                {applicants.map((a, i) => (
                  <option key={a.id} value={a.id}>
                    👤 {a.personal?.name || `Candidate #${i + 1}`} ({a.motivation?.pathway || 'STUDY'})
                  </option>
                ))}
              </select>

              {onCreateNewApplicant && (
                <button
                  onClick={onCreateNewApplicant}
                  className="px-2 py-0.5 bg-sky-600 hover:bg-sky-700 text-white rounded text-[11px] font-bold flex items-center gap-1 transition-all"
                  title="Create fresh new applicant session"
                >
                  <UserPlus className="w-3 h-3" /> + New
                </button>
              )}
            </div>
          )}

          <span className="text-slate-300 hidden sm:inline">|</span>

          {/* 1-Click Test Data Injector for Jury */}
          <span className="font-semibold text-slate-600 flex items-center gap-1 hidden md:flex">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Jury Quick-Pitch:
          </span>
          <button
            onClick={() => onInjectSample('aarav-study')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 font-medium rounded-lg border border-slate-200 transition-colors"
            title="Load B.Tech Graduate with Anna University Degree"
          >
            🎓 Aarav • Study
          </button>
          <button
            onClick={() => onInjectSample('priya-ausbildung')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-medium rounded-lg border border-slate-200 transition-colors"
            title="Load 12th + Goethe B2 German candidate for Healthcare Ausbildung"
          >
            🏥 Priya • Ausbildung
          </button>
          <button
            onClick={() => onInjectSample('rahul-chancenkarte')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-700 font-medium rounded-lg border border-slate-200 transition-colors"
            title="Load Senior DevOps with 6 yrs experience for Chancenkarte"
          >
            💼 Rahul • Chancenkarte
          </button>
          <button
            onClick={onReset}
            className="p-1 text-slate-400 hover:text-red-500 transition-colors rounded-md"
            title="Reset active applicant to fresh clean empty intake"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20 font-black text-xl tracking-tight">
            E
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">educaro</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-900 text-amber-400 font-semibold tracking-wider uppercase">
                Gateway AI
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">European AI Applicant Journey & Forensic Gateway</p>
          </div>
        </div>

        {/* Live Gauges & Country Switcher */}
        <div className="flex items-center gap-4">
          {/* Country Switcher */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200/80 text-xs font-semibold">
            <button
              onClick={() => onCountryToggle('Germany')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                selectedCountry === 'Germany'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>🇩🇪</span> Germany
            </button>
            <button
              onClick={() => onCountryToggle('Austria')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                selectedCountry === 'Austria'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>🇦🇹</span> Austria (DACH)
            </button>
          </div>

          {/* Profile Completeness Gauge */}
          <div className="hidden lg:flex items-center gap-2.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/70">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-sky-600 transition-all duration-700"
                  strokeDasharray={`${completenessPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-slate-700">{completenessPercent}%</span>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-800">Profile Intake</div>
              <div className="text-[10px] text-slate-500">
                {filledFields}/{totalFields} categories
              </div>
            </div>
          </div>

          {/* Forensic Authenticity Counter */}
          <div className="hidden md:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/70 text-xs">
            <ShieldCheck className={`w-4 h-4 ${authenticDocs > 0 ? 'text-emerald-600' : 'text-slate-400'}`} />
            <div>
              <span className="font-semibold text-slate-800">
                {authenticDocs} / {totalDocs}
              </span>
              <span className="text-[10px] text-slate-500 ml-1">Verified Docs</span>
            </div>
            {suspectDocs > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold flex items-center gap-0.5">
                <AlertTriangle className="w-2.5 h-2.5" /> {suspectDocs}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 flex items-center gap-1 sm:gap-2 overflow-x-auto py-1">
        <button
          onClick={() => setActiveTab('journey')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'journey'
              ? 'bg-sky-50 text-sky-700 border border-sky-200/80 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <Compass className="w-4 h-4 text-sky-600" />
          🧭 Applicant Journey
        </button>

        <button
          onClick={() => setActiveTab('ranker')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'ranker'
              ? 'bg-sky-50 text-sky-700 border border-sky-200/80 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-indigo-600" />
          🎓 420+ German Universities (DAAD)
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'courses'
              ? 'bg-sky-50 text-sky-700 border border-sky-200/80 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <BookOpen className="w-4 h-4 text-sky-600" />
          📚 Accredited Degree Programs & Cutoffs
        </button>

        <button
          onClick={() => setActiveTab('interview')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'interview'
              ? 'bg-sky-50 text-sky-700 border border-sky-200/80 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <Mic className="w-4 h-4 text-rose-600" />
          🎙️ Mock Interview
        </button>

        <button
          onClick={() => setActiveTab('calculator')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'calculator'
              ? 'bg-sky-50 text-sky-700 border border-sky-200/80 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <Calculator className="w-4 h-4 text-emerald-600" />
          💶 Financial Calculator
        </button>

        <button
          onClick={() => setActiveTab('crm')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'crm'
              ? 'bg-sky-50 text-sky-700 border border-sky-200/80 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <Users className="w-4 h-4 text-amber-600" />
          👔 Counselor CRM
        </button>
      </div>
    </header>
  );
};
