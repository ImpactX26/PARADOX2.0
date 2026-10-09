import React, { useState } from 'react';
import { 
  GraduationCap, 
  Briefcase, 
  Compass, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Globe2, 
  Euro, 
  Award,
  X,
  FileCheck,
  Building2,
  ChevronRight,
  BookOpen,
  Landmark,
  Scale
} from 'lucide-react';
import { useApplicant } from '../store/applicantContext';

export type DegreeLevel = 'undergrad' | 'masters_phd';
export type GeographicRegion = 'germany' | 'europe';

interface PathwaySelectorProps {
  onSelectUniversity: (level: DegreeLevel, region: GeographicRegion) => void;
  onSelectAusbildung: (region: GeographicRegion) => void;
  onSelectEmployment: (region: GeographicRegion) => void;
  onOpenWizard?: () => void;
  onOpenMockInterview?: () => void;
  onOpenBrochure?: () => void;
  onOpenAnabinCashflow?: () => void;
  onOpenDMatFunding?: () => void;
  onResetProfile?: () => void;
}

export const PathwaySelector: React.FC<PathwaySelectorProps> = ({
  onSelectUniversity,
  onSelectAusbildung,
  onSelectEmployment,
  onOpenWizard,
  onOpenMockInterview,
  onOpenBrochure,
  onOpenAnabinCashflow,
  onOpenDMatFunding,
  onResetProfile,
}) => {
  const { activeApplicant, updateActiveApplicant } = useApplicant();

  // Modal Workflow State
  const [activeModal, setActiveModal] = useState<'NONE' | 'UNIVERSITY' | 'AUSBILDUNG' | 'EMPLOYMENT'>('NONE');
  const [universityLevelStep, setUniversityLevelStep] = useState<DegreeLevel | null>(null);

  const candidateName = activeApplicant?.personal?.name?.trim() || 'New Intake Candidate';

  const handleOpenUniversityModal = () => {
    setUniversityLevelStep(null);
    setActiveModal('UNIVERSITY');
  };

  const handleOpenAusbildungModal = () => {
    setActiveModal('AUSBILDUNG');
  };

  const handleOpenEmploymentModal = () => {
    setActiveModal('EMPLOYMENT');
  };

  const closeModal = () => {
    setActiveModal('NONE');
    setUniversityLevelStep(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fadeIn">
      {/* Top Single Active Session Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shadow-sm">
            EU
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Single Active Session</div>
            <div className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {candidateName}
              {activeApplicant?.motivation?.pathway && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase font-bold">
                  {activeApplicant.motivation.pathway}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onOpenWizard && (
            <button
              onClick={onOpenWizard}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <span>🧭 Open Intake Wizard</span>
            </button>
          )}

          {onResetProfile && (
            <button
              onClick={onResetProfile}
              id="btn-start-new-clear-profile"
              className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              title="Purge active applicant session and start a clean intake"
            >
              <span>↺ Start New / Clear Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold tracking-wide uppercase shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
          <span>Educaro European Admissions & Employment Intelligence Gateway</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Choose Your Verified <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-amber-600 bg-clip-text text-transparent">European Pathway</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
          Autonomous regulatory screening, Bavarian GPA conversion, ECTS credit gap audits, German apprentice contracts, and EU shortage visa intelligence.
        </p>
      </div>

      {/* Three Clean Entry Pathway Hero Cards (Linear / Apple / Stripe Aesthetic) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CARD 1: HIGHER EDUCATION & UNIVERSITY */}
        <div
          onClick={handleOpenUniversityModal}
          className="group relative bg-white rounded-3xl border border-slate-200/90 hover:border-blue-600 shadow-sm hover:shadow-2xl overflow-hidden cursor-pointer transform hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
        >
          <div>
            {/* Visual Hero Image Container */}
            <div className="relative h-52 w-full overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80"
                alt="Higher Education University Hall"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500 text-white shadow-md">
                  TUITION-FREE PUBLIC UNIVERSITIES & ECTS AUDITS
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <h2 className="text-xl font-black tracking-tight">Higher Education & University</h2>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-4">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Undergraduate & Postgraduate pathways, Indian 12th/Bachelors equivalence, Bavarian GPA formula, and ECTS gap mapping.
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span><strong>Undergrad:</strong> 12th Board, JEE rank & Studienkolleg (FSP)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span><strong>Masters + PhD:</strong> 1.5x ECTS audits & Bavarian GPA formula</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span><strong>Scope:</strong> Germany (€0 tuition) vs Europe (WO/HBO)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 pt-0">
            <button className="w-full py-2.5 px-4 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-blue-700 group-hover:text-white text-xs font-bold flex items-center justify-between transition-colors shadow-2xs">
              <span>Launch University Admissions Workspace</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* CARD 2: DUALE AUSBILDUNG & DUALES STUDIUM */}
        <div
          onClick={handleOpenAusbildungModal}
          className="group relative bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-600 shadow-sm hover:shadow-2xl overflow-hidden cursor-pointer transform hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
        >
          <div>
            {/* Visual Hero Image Container */}
            <div className="relative h-52 w-full overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80"
                alt="Mechatronics Workshop"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-md">
                  PAID WORK-STUDY & APPRENTICESHIPS
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <h2 className="text-xl font-black tracking-tight">Duale Ausbildung & Duales Studium</h2>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-4">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Combine academic/practical training with corporate stipends (€1,100–€1,600/month). Zero €11,904 blocked account required.
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span><strong>€0 Sperrkonto:</strong> Guaranteed corporate training salary</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span><strong>DHBW & UAS:</strong> 100% integrated work-study with SAP, Bosch</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span><strong>Europe Track:</strong> Austria, Switzerland, Netherlands BBL, UK</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 pt-0">
            <button className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 group-hover:bg-emerald-600 text-emerald-700 group-hover:text-white text-xs font-bold flex items-center justify-between transition-colors shadow-2xs">
              <span>Launch Work-Study & Duale Ausbildung Hub</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* CARD 3: DIRECT WORK & EMPLOYMENT */}
        <div
          onClick={handleOpenEmploymentModal}
          className="group relative bg-white rounded-3xl border border-slate-200/90 hover:border-amber-600 shadow-sm hover:shadow-2xl overflow-hidden cursor-pointer transform hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
        >
          <div>
            {/* Visual Hero Image Container */}
            <div className="relative h-52 w-full overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80"
                alt="Corporate Glass Architecture"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-md">
                  CHANCENKARTE & EUROPEAN SKILLED VISAS
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold shadow-md">
                    <Compass className="w-4 h-4" />
                  </div>
                  <h2 className="text-xl font-black tracking-tight">Direct Work & Employment</h2>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-4">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Opportunity Card (§ 20a AufenthG) points scoring, EU Blue Card salary thresholds, and pan-European shortage occupation explorer.
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span><strong>Chancenkarte:</strong> Statutory 6-point pass gauge</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span><strong>Work Rights:</strong> 20h/wk secondary work & 2-week Probearbeit</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span><strong>Pan-Europe:</strong> Netherlands, Austria, Ireland, Nordics, UK</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 pt-0">
            <button className="w-full py-2.5 px-4 rounded-xl bg-amber-50 group-hover:bg-amber-600 text-amber-700 group-hover:text-white text-xs font-bold flex items-center justify-between transition-colors shadow-2xs">
              <span>Launch Employment & Shortage Hub</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Launch Ecosystem Bar */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Educaro Forensic & Support Engines</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
              Autonomous Verification & Candidate Toolkit
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mt-1">
              Direct access to forensic OCR parsers, live mock interview simulator, bilingual DIN 5008 CV builder, and funding directories.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenAnabinCashflow && (
              <button
                onClick={onOpenAnabinCashflow}
                className="px-3.5 py-2 bg-indigo-950 hover:bg-indigo-900 text-indigo-200 border border-indigo-700/80 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Anabin & Cashflow</span>
              </button>
            )}

            {onOpenDMatFunding && (
              <button
                onClick={onOpenDMatFunding}
                className="px-3.5 py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-700/80 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>dMAT & Funding</span>
              </button>
            )}

            {onOpenMockInterview && (
              <button
                onClick={onOpenMockInterview}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <span>🎙️ Mock Interview</span>
              </button>
            )}

            {onOpenBrochure && (
              <button
                onClick={onOpenBrochure}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <FileCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Prospectus Brochure</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PROGRESSIVE BRANCHING MODALS                                              */}
      {/* ========================================================================= */}

      {/* MODAL 1: UNIVERSITY PATHWAY (Step 1: Level -> Step 2: Region) */}
      {activeModal === 'UNIVERSITY' && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Higher Education Configuration</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {!universityLevelStep ? 'Step 1: Select Academic Degree Level' : 'Step 2: Select Geographic Scope'}
              </h3>
              <p className="text-xs text-slate-500">
                {!universityLevelStep
                  ? 'Identify whether you are auditing undergraduate high school qualifications or postgraduate university transcripts.'
                  : `Configuring admissions intelligence for ${universityLevelStep === 'undergrad' ? 'Undergraduate (Bachelors)' : 'Masters & PhD'}.`}
              </p>
            </div>

            {/* STEP 1: DEGREE LEVEL SELECTION */}
            {!universityLevelStep ? (
              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setUniversityLevelStep('undergrad')}
                  className="p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-600 bg-slate-50/50 hover:bg-blue-50/30 text-left transition-all space-y-3 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-700">
                      Undergrad (Bachelors)
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      Audits Indian 12th Board (CBSE/ISC), JEE Advanced rank, Studienkolleg/Feststellungsprüfung (T/M/W Kurs), and foundation years.
                    </p>
                  </div>
                  <div className="text-[11px] font-bold text-blue-600 flex items-center gap-1">
                    <span>Continue</span> <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </button>

                <button
                  onClick={() => setUniversityLevelStep('masters_phd')}
                  className="p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-600 bg-slate-50/50 hover:bg-blue-50/30 text-left transition-all space-y-3 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-indigo-700">
                      Masters + PhD
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      Audits bachelor degree ECTS (1.5x multiplier), consecutive syllabus prerequisites, Bavarian GPA formula, and dMAT scores.
                    </p>
                  </div>
                  <div className="text-[11px] font-bold text-indigo-600 flex items-center gap-1">
                    <span>Continue</span> <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              </div>
            ) : (
              /* STEP 2: GEOGRAPHIC SCOPE SELECTION */
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Option A: Germany (Brandenburg Dark Navy Theme) */}
                  <button
                    onClick={() => {
                      closeModal();
                      onSelectUniversity(universityLevelStep, 'germany');
                    }}
                    className="p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-600 bg-gradient-to-br from-slate-900 to-blue-950 text-white text-left transition-all space-y-3 group shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">🇩🇪</span>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-500/30 text-blue-200 border border-blue-400/30">
                        €0 Tuition
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                        Germany
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                        Brandenburg public university system, TU9 cutoffs, Anabin H+ classification, and mandatory APS New Delhi certificate.
                      </p>
                    </div>
                    <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1 pt-1">
                      <span>Launch German Track</span> <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </button>

                  {/* Option B: Europe (Starry Midnight-Sapphire Theme) */}
                  <button
                    onClick={() => {
                      closeModal();
                      onSelectUniversity(universityLevelStep, 'europe');
                    }}
                    className="p-5 rounded-2xl border-2 border-slate-200 hover:border-indigo-600 bg-gradient-to-br from-indigo-950 via-slate-950 to-blue-950 text-white text-left transition-all space-y-3 group shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">🇪🇺</span>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/30 text-amber-200 border border-amber-400/30">
                        All Europe
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">
                        Europe
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                        Pan-European master & bachelor matrix: Netherlands (WO vs HBO), Switzerland (ETH), Ireland, Sweden, UK, and Erasmus Mundus.
                      </p>
                    </div>
                    <div className="text-[11px] font-bold text-indigo-300 flex items-center gap-1 pt-1">
                      <span>Launch European Track</span> <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                </div>

                <button
                  onClick={() => setUniversityLevelStep(null)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-bold block mx-auto pt-2"
                >
                  ← Back to Degree Level Selection
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: DUALE AUSBILDUNG PATHWAY (Geographic Scope) */}
      {activeModal === 'AUSBILDUNG' && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Duale Ausbildung & Work-Study Configuration</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Select Dual Apprenticeship Destination
              </h3>
              <p className="text-xs text-slate-500">
                Choose between Germany's statutory dual system or broader European cooperative vocational frameworks.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Option A: Germany */}
              <button
                onClick={() => {
                  closeModal();
                  onSelectAusbildung('germany');
                }}
                className="p-5 rounded-2xl border-2 border-slate-200 hover:border-emerald-600 bg-slate-50/60 hover:bg-emerald-50/30 text-left transition-all space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🇩🇪</span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    €0 Sperrkonto
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700">
                    Germany Duale Ausbildung
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    DHBW cooperative degrees, State UAS (FH Aachen, TH Köln), Berufsakademien, and IHK/HWK nursing & tech apprenticeships (€1,150–€1,600/mo).
                  </p>
                </div>
                <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <span>Enter German Dual Hub</span> <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Option B: Europe */}
              <button
                onClick={() => {
                  closeModal();
                  onSelectAusbildung('europe');
                }}
                className="p-5 rounded-2xl border-2 border-slate-200 hover:border-emerald-600 bg-slate-50/60 hover:bg-emerald-50/30 text-left transition-all space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🇪🇺</span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                    DACH & Western Europe
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700">
                    European Work-Study Systems
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Austria Duale Berufsausbildung, Swiss Berufslehre (CHF 800–1,500), Netherlands BBL, and UK Degree Apprenticeships.
                  </p>
                </div>
                <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <span>Enter European Dual Hub</span> <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DIRECT WORK PATHWAY (Geographic Scope) */}
      {activeModal === 'EMPLOYMENT' && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
                <Compass className="w-3.5 h-3.5" />
                <span>Skilled Employment & Visas Configuration</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Select Employment Visa Jurisdiction
              </h3>
              <p className="text-xs text-slate-500">
                Choose between Germany's statutory Chancenkarte / EU Blue Card or pan-European national skilled worker routes.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Option A: Germany */}
              <button
                onClick={() => {
                  closeModal();
                  onSelectEmployment('germany');
                }}
                className="p-5 rounded-2xl border-2 border-slate-200 hover:border-amber-600 bg-slate-50/60 hover:bg-amber-50/30 text-left transition-all space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🇩🇪</span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    § 20a AufenthG
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-amber-700">
                    Germany Chancenkarte & Blue Card
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Statutory 6-point gauge, 20 hrs/week secondary work, 2-week trial work (*Probearbeit*), and EU Blue Card salary checker.
                  </p>
                </div>
                <div className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                  <span>Enter German Jobs Hub</span> <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Option B: Europe */}
              <button
                onClick={() => {
                  closeModal();
                  onSelectEmployment('europe');
                }}
                className="p-5 rounded-2xl border-2 border-slate-200 hover:border-amber-600 bg-slate-50/60 hover:bg-amber-50/30 text-left transition-all space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🇪🇺</span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                    9 European Countries
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-amber-700">
                    Pan-European Shortage Search
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Interactive registry covering Netherlands (Zoekjaar), Austria (RWR Card), Ireland (CSEP), Sweden, Nordics, and the UK.
                  </p>
                </div>
                <div className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                  <span>Enter European Shortage Hub</span> <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
