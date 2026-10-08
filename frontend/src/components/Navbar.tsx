import React from 'react';
import { 
  Compass, 
  GraduationCap, 
  Mic, 
  Calculator, 
  ShieldCheck, 
  RotateCcw,
  AlertTriangle,
  Briefcase,
  FileText,
  Home
} from 'lucide-react';
import { ApplicantRecord } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  applicant: ApplicantRecord | null;
  onReset: () => void;
  onCountryToggle: (country: 'Germany' | 'Austria') => void;
  selectedCountry: 'Germany' | 'Austria';
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  applicant,
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
      {/* Top Banner & Single Active Session Control */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            Educaro Germany Direct AI Gateway • AufenthG & DAAD Compliance
          </span>
        </div>

        {/* Single Active Session & Prominent Start New Application / Clear Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">Active Session:</span>
            <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {applicant?.personal?.name?.trim() ? applicant.personal.name : 'New Applicant Intake'}
            </span>
            {applicant?.motivation?.pathway && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold uppercase">
                {applicant.motivation.pathway}
              </span>
            )}
          </div>

          {/* Prominent Start New Application / Clear Button */}
          <button
            onClick={onReset}
            id="btn-start-new-application"
            className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-xs hover:shadow-sm"
            title="Purge current applicant session and start a brand new blank intake"
          >
            <RotateCcw className="w-3.5 h-3.5 text-red-600" />
            <span>↺ Start New Application / Clear</span>
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div 
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-black text-xl tracking-tight group-hover:scale-105 transition-transform">
            E
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">educaro</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-900 text-amber-400 font-semibold tracking-wider uppercase">
                Germany Bridge
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Autonomous European AI Applicant Journey & Forensic Gateway</p>
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
                  className="text-blue-600 transition-all duration-700"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 flex items-center gap-1 sm:gap-2 overflow-x-auto py-1.5">
        <button
          onClick={() => setActiveTab('landing')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'landing'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home / Pathways</span>
        </button>

        <button
          onClick={() => setActiveTab('journey')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'journey'
              ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-blue-600" />
          <span>🧭 Application Wizard</span>
        </button>

        <button
          onClick={() => setActiveTab('ranker')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'ranker'
              ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
          <span>🎓 420+ Universities & Cutoffs</span>
        </button>

        <button
          onClick={() => setActiveTab('ausbildung')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'ausbildung'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
          <span>🏥 Duale Ausbildung Portal</span>
        </button>

        <button
          onClick={() => setActiveTab('chancenkarte')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'chancenkarte'
              ? 'bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-amber-600" />
          <span>💼 Chancenkarte Calculator</span>
        </button>

        <button
          onClick={() => setActiveTab('interview')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'interview'
              ? 'bg-rose-50 text-rose-800 border border-rose-200/80 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <Mic className="w-3.5 h-3.5 text-rose-600" />
          <span>🎙️ Mock Interview</span>
        </button>

        <button
          onClick={() => setActiveTab('cv_brochure')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'cv_brochure'
              ? 'bg-purple-50 text-purple-800 border border-purple-200/80 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-purple-600" />
          <span>📄 CV & Brochure</span>
        </button>

        <button
          onClick={() => setActiveTab('calculator')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'calculator'
              ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <Calculator className="w-3.5 h-3.5 text-emerald-600" />
          <span>💶 Financials</span>
        </button>
      </div>
    </header>
  );
};
