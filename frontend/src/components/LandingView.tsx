import React from 'react';
import { 
  GraduationCap, 
  Briefcase, 
  Compass, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Languages, 
  Euro, 
  Award,
  FileCheck,
  Building2
} from 'lucide-react';
import { useApplicant } from '../store/applicantContext';

interface LandingViewProps {
  onSelectPathway: (pathway: 'STUDY' | 'AUSBILDUNG' | 'CHANCENKARTE') => void;
  onOpenUniversityExplorer?: () => void;
  onOpenMockInterview?: () => void;
  onOpenBrochure?: () => void;
  onOpenAnabinCashflow?: () => void;
  onOpenDMatFunding?: () => void;
  onResetProfile?: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ 
  onSelectPathway, 
  onOpenUniversityExplorer,
  onOpenMockInterview,
  onOpenBrochure,
  onOpenAnabinCashflow,
  onOpenDMatFunding,
  onResetProfile,
}) => {
  const { activeApplicant, updateActiveApplicant } = useApplicant();

  const handleSelect = (pathway: 'STUDY' | 'AUSBILDUNG' | 'CHANCENKARTE') => {
    if (activeApplicant) {
      updateActiveApplicant({ 
        motivation: {
          ...activeApplicant.motivation,
          pathway: pathway,
        }
      });
    }
    onSelectPathway(pathway);
  };

  const candidateName = activeApplicant?.personal?.name?.trim() || 'New Intake Candidate';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Single Active Session Control & Clear Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
            EU
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Single Active Session</div>
            <div className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {candidateName}
              {activeApplicant?.motivation?.pathway && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase font-semibold">
                  {activeApplicant.motivation.pathway}
                </span>
              )}
            </div>
          </div>
        </div>

        {onResetProfile && (
          <button
            onClick={onResetProfile}
            id="btn-start-new-clear-profile"
            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-2 transition-all shadow-xs hover:shadow-sm active:scale-95"
            title="Purge active applicant session and start a clean intake"
          >
            <span>↺ Start New / Clear Profile</span>
          </button>
        )}
      </div>

      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold tracking-wide uppercase shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
          <span>Educaro Germany Bridge • Direct Immigration & Study Platform</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Select Your Verified <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-amber-600 bg-clip-text text-transparent">Pathway to Germany</span>
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Autonomous eligibility screening, forensic document auditing, Bavarian GPA conversion, and verified visa roadmaps compliant with DAAD & German Immigration (AufenthG) standards.
        </p>
      </div>

      {/* Hero 3 Interactive Animated Pathway Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Card 1: Higher Education & UG Studies */}
        <div
          onClick={() => handleSelect('STUDY')}
          className="group relative bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-600 p-8 shadow-sm hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors duration-300 shadow-sm">
                <GraduationCap className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                Academic Track
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                Higher Education & UG Studies
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Public universities, €0 tuition, APS certificate checks, Bavarian GPA conversion.
              </p>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Target public German universities with €0 tuition. Instant Indian CGPA conversion via official Bavarian Formula, APS India prerequisite checks, and direct ECTS alignment.
            </p>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Euro className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>€0 Tuition</strong> at public universities</span>
              </div>
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>APS certificate checks & consular verification</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-600 shrink-0" />
                <span>KMK Bavarian GPA conversion & ECTS deficit audit</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between font-semibold text-sm text-blue-600 group-hover:text-blue-800">
            <span>Enter Higher Education Track</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
          </div>
        </div>

        {/* Card 2: Duale Ausbildung & Duales Studium */}
        <div
          onClick={() => handleSelect('AUSBILDUNG')}
          className="group relative bg-white rounded-2xl border-2 border-slate-200 hover:border-emerald-600 p-8 shadow-sm hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-colors duration-300 shadow-sm">
                <Briefcase className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                Stipend Paid
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Duale Ausbildung & Duales Studium
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Integrated vocational training and cooperative state degrees; paid monthly stipends (€1,100–€1,600/mo); German B1/B2 entry.
              </p>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Earn while you learn with monthly stipends of €1,100–€1,600/mo. Zero €11,904 blocked account requirement. Work-study split between vocational school (*Berufsschule*) and employer.
            </p>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Euro className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>€1,100 – €1,600/mo</strong> paid monthly stipends</span>
              </div>
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-amber-600 shrink-0" />
                <span>German B1/B2 entry validation</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Cooperative state degrees with zero Sperrkonto</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between font-semibold text-sm text-emerald-600 group-hover:text-emerald-800">
            <span>Explore Ausbildung Portal</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
          </div>
        </div>

        {/* Card 3: Skilled Employment (Chancenkarte) */}
        <div
          onClick={() => handleSelect('CHANCENKARTE')}
          className="group relative bg-white rounded-2xl border-2 border-slate-200 hover:border-amber-600 p-8 shadow-sm hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-xl bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center transition-colors duration-300 shadow-sm">
                <Compass className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                Points Visa
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                Skilled Employment (Chancenkarte)
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Points-based opportunity card visa, § 20a AufenthG rights, EU Blue Card thresholds.
              </p>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Points-based legal opportunity card visa. Score ≥6 points via recognized degrees (Anabin H+), verified STEM/IT experience, language certs, and age thresholds. EU Blue Card evaluation included.
            </p>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span><strong>Points-based opportunity card visa</strong> (≥6 points)</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>§ 20a AufenthG rights & work authorization</span>
              </div>
              <div className="flex items-center gap-2">
                <Euro className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>EU Blue Card thresholds evaluation</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between font-semibold text-sm text-amber-600 group-hover:text-amber-800">
            <span>Calculate Chancenkarte Points</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Quick Launch & Ecosystem Highlights */}
      <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-lg space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
              <ShieldCheck className="w-5 h-5" />
              <span>Full Educaro Germany Suite Active</span>
            </div>
            <h3 className="text-2xl font-bold text-white mt-1">
              Candidate Workspace Tools & Fast Tracks
            </h3>
            <p className="text-slate-400 text-sm max-w-2xl mt-1">
              Already entered candidate data? Jump directly into our specialized forensic checkers, mock visa officers, or university rankers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onOpenUniversityExplorer && (
              <button
                onClick={onOpenUniversityExplorer}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4" />
                <span>420+ Universities</span>
              </button>
            )}
            {onOpenMockInterview && (
              <button
                onClick={onOpenMockInterview}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
              >
                <Languages className="w-4 h-4" />
                <span>Mock Interview</span>
              </button>
            )}
            {onOpenBrochure && (
              <button
                onClick={onOpenBrochure}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
              >
                <FileCheck className="w-4 h-4 text-amber-400" />
                <span>Prospectus Brochure</span>
              </button>
            )}
            {onOpenAnabinCashflow && (
              <button
                onClick={onOpenAnabinCashflow}
                className="px-4 py-2 bg-indigo-900/80 hover:bg-indigo-800 text-white border border-indigo-700/80 rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-sky-400" />
                <span>Anabin & Cashflow</span>
              </button>
            )}
            {onOpenDMatFunding && (
              <button
                onClick={onOpenDMatFunding}
                className="px-4 py-2 bg-emerald-900/80 hover:bg-emerald-800 text-white border border-emerald-700/80 rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
              >
                <Award className="w-4 h-4 text-emerald-400" />
                <span>dMAT & Funding</span>
              </button>
            )}
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-800 text-xs text-slate-300">
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-800">
            <span className="font-semibold text-white block mb-0.5">Automated Heuristic CV Parser</span>
            Client-side PDF & image OCR with zero mock injection
          </div>
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-800">
            <span className="font-semibold text-white block mb-0.5">Forensic Document Masker</span>
            Aadhaar, Passport, & PAN auto-masking per DPDP standards
          </div>
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-800">
            <span className="font-semibold text-white block mb-0.5">CEFR & Fluency Matrix</span>
            Audio RMS cadence, WPM analysis, and German syntactic markers
          </div>
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-800">
            <span className="font-semibold text-white block mb-0.5">DIN 5008 / Europass CV</span>
            Bilingual German/English Lebenslauf with 1-click A4 PDF
          </div>
        </div>
      </div>
    </div>
  );
};
