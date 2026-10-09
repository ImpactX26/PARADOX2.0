import React, { useState } from 'react';
import { 
  Briefcase, 
  CheckCircle2, 
  Euro, 
  ShieldCheck, 
  Sparkles, 
  Building2, 
  ExternalLink, 
  GraduationCap, 
  Coins, 
  Clock, 
  HeartPulse, 
  Cpu, 
  Wrench, 
  BookOpen, 
  Layers, 
  Search,
  Scale
} from 'lucide-react';
import { ApplicantRecord } from '../types';
import { GeographicRegion } from './PathwaySelector';
import { AusbildungPortal } from './AusbildungPortal';

interface AusbildungWorkspaceProps {
  initialRegion?: GeographicRegion;
  applicant: ApplicantRecord | null;
  onUpdateApplicant?: (updates: Partial<ApplicantRecord>) => void;
  onBackToSelector?: () => void;
}

interface EuroDualSystem {
  country: string;
  flag: string;
  systemName: string;
  governingBody: string;
  monthlyStipendWage: string;
  structure: string;
  qualificationAwarded: string;
  visaAndWorkRights: string;
  keyIndustries: string[];
  officialUrl?: string;
}

export const AusbildungWorkspace: React.FC<AusbildungWorkspaceProps> = ({
  initialRegion = 'germany',
  applicant,
  onUpdateApplicant,
  onBackToSelector,
}) => {
  const [region, setRegion] = useState<GeographicRegion>(initialRegion);

  // European Dual Systems Registry Data
  const euroDualSystems: EuroDualSystem[] = [
    {
      country: 'Austria',
      flag: '🇦🇹',
      systemName: 'Duale Berufsausbildung (Austrian Dual Apprenticeship)',
      governingBody: 'Austrian Economic Chamber (WKO / WIFI) & Federal Ministry of Labour and Economy (BMAW)',
      monthlyStipendWage: '€900 – €1,450 / month (Statutory collective agreement apprentice compensation / Lehrlingseinkommen)',
      structure: '80% practical in-company training + 20% block instruction at Austrian Berufsschulen over 3 to 4 years.',
      qualificationAwarded: 'Lehrabschlussprüfung (LAP) State Skilled Worker Certificate (EQF Level 4)',
      visaAndWorkRights: 'Eligible for Red-White-Red Card for skilled workers in shortage professions (*Rot-Weiß-Rot-Karte für Mangelberufe*) post-qualification.',
      keyIndustries: ['Automotive & Rail Mechatronics', 'Specialized Acute Nursing Care', 'Precision Toolmaking', 'Green Energy Systems'],
      officialUrl: 'https://www.wko.at/lehre'
    },
    {
      country: 'Switzerland',
      flag: '🇨🇭',
      systemName: 'Berufslehre / Dual VET (Vocational Education & Training)',
      governingBody: 'Swiss State Secretariat for Education, Research and Innovation (SERI / SBFI)',
      monthlyStipendWage: 'CHF 800 – CHF 1,500 / month (Rising progressively from Year 1 to Year 4)',
      structure: '3 to 4 days practical industry training + 1 to 2 days theoretical school per week, plus branch courses (*überbetriebliche Kurse*).',
      qualificationAwarded: 'Federal VET Diploma (Eidgenössisches Fähigkeitszeugnis - EFZ)',
      visaAndWorkRights: 'Gold standard Swiss vocational degree offering direct pathways to Swiss Advanced Federal Diplomas and Cantonal work permits.',
      keyIndustries: ['Automation Engineering (Polymechaniker)', 'IT & Cyber Infrastructure', 'Biotech Laboratory Technology', 'Hospitality Management'],
      officialUrl: 'https://www.berufsberatung.ch/'
    },
    {
      country: 'Netherlands',
      flag: '🇳🇱',
      systemName: 'Duale Opleiding / BBL (Beroepsbegeleidende Leerweg)',
      governingBody: 'Foundation for Cooperation on Vocational Education, Training and Labour Market (SBB)',
      monthlyStipendWage: '€1,000 – €1,500 / month (Dutch statutory minimum wage for apprentices or collective CAO wage)',
      structure: '4 days contracted employment at an accredited training company (*Erkend Leerbedrijf*) + 1 day at Regional Training Centre (ROC).',
      qualificationAwarded: 'MBO Diploma Level 4 (Middelbaar Beroepsonderwijs) with direct progression to HBO Bachelor',
      visaAndWorkRights: 'Statutory employment contract ensures full employee health insurance and Dutch social security coverage.',
      keyIndustries: ['Maritime & Logistics Automation', 'Software Engineering & Cloud Ops', 'High-Tech Systems & Semiconductors', 'Healthcare Specialization'],
      officialUrl: 'https://www.s-bb.nl/en'
    },
    {
      country: 'United Kingdom',
      flag: '🇬🇧',
      systemName: 'Degree Apprenticeships (Level 6 Bachelor / Level 7 Master)',
      governingBody: 'Institute for Apprenticeships and Technical Education (IfATE) & Department for Education',
      monthlyStipendWage: '£18,000 – £26,000 / year (Full corporate salaried employee + 100% employer-funded tuition)',
      structure: '80% on-the-job professional delivery + 20% off-the-job higher academic study at UK accredited partner university over 3 to 5 years.',
      qualificationAwarded: 'Full Accredited Bachelor’s Degree (BSc/BEng Level 6) or Master’s Degree (MSc Level 7) with ZERO student debt',
      visaAndWorkRights: 'Tied to corporate sponsor; paves direct path to UK Skilled Worker Visa and permanent settlement (*Indefinite Leave to Remain*).',
      keyIndustries: ['Aerospace Engineering (Rolls-Royce, Airbus)', 'Digital & Tech Solutions (PwC, IBM, Google)', 'Financial Services', 'Civil & Structural Engineering'],
      officialUrl: 'https://www.apprenticeships.gov.uk/'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Banner with Region Switcher */}
      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-emerald-900/50">
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-emerald-400 text-slate-950 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {region === 'germany' ? '🇩🇪 GERMAN DUALE AUSBILDUNG & STUDIUM' : '🇪🇺 EUROPEAN DUAL VOCATIONAL SYSTEMS'}
            </span>
            <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-emerald-200">
              Work-Study • Guaranteed Monthly Corporate Stipends
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            {region === 'germany' 
              ? 'German Dual Education: Institutional Taxonomy & €0 Blocked Account' 
              : 'Pan-European Dual VET, Apprenticeships & Work-Study Systems'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            {region === 'germany'
              ? 'Explore Cooperative State Universities (DHBW), State Universities of Applied Sciences (HAW), and Chamber Networks (IHK/HWK). Corporate stipends legally waive the €11,904 blocked account requirement under § 16a AufenthG.'
              : 'Compare official dual education and degree apprenticeship models across Austria, Switzerland, the Netherlands, and the United Kingdom.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="bg-black/30 p-1 rounded-xl flex items-center border border-white/10 text-xs font-bold">
              <button
                onClick={() => setRegion('germany')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  region === 'germany' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
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
                <span>🇪🇺</span> Europe (Austria, Swiss, NL, UK)
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

      {/* REGION 1: GERMANY (Invokes full specialized AusbildungPortal) */}
      {region === 'germany' ? (
        <div className="space-y-6">
          <AusbildungPortal
            applicant={applicant}
            onSelectTrade={(trade) => {
              onUpdateApplicant?.({
                targetAusbildungTrade: trade,
                motivation: {
                  ...applicant?.motivation,
                  pathway: 'AUSBILDUNG',
                }
              });
            }}
          />
        </div>
      ) : (
        /* REGION 2: EUROPE DUAL SYSTEMS HUB */
        <div className="space-y-6">
          {/* Overview Callout */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">
                  European Vocational Excellence
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  Major European Dual Apprenticeship & Degree Apprenticeship Frameworks
                </h2>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                100% Employer Funded
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Beyond Germany, countries like Austria, Switzerland, the Netherlands, and the UK offer internationally accredited work-study models where trainees receive a <strong>monthly living wage</strong>, statutory social insurance, and corporate mentorship from Day 1.
            </p>

            <div className="grid md:grid-cols-2 gap-5 pt-2">
              {euroDualSystems.map((sys) => (
                <div
                  key={sys.country}
                  className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{sys.flag}</span>
                        <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {sys.country}
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        {sys.systemName.split(' ')[0]}
                      </span>
                    </div>

                    <div className="font-bold text-xs text-slate-800 leading-snug">
                      {sys.systemName}
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Stipend / Wage:</span>
                        <strong className="text-emerald-700 font-bold">{sys.monthlyStipendWage}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Training Split:</span>
                        <span className="text-slate-700">{sys.structure}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Awarded Degree:</span>
                        <span className="text-indigo-900 font-semibold">{sys.qualificationAwarded}</span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <span className="text-[11px] font-bold text-slate-700 block">High-Demand Sectors:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {sys.keyIndustries.map((ind, i) => (
                          <span key={i} className="text-[10px] bg-slate-200/70 text-slate-800 px-2 py-0.5 rounded-md font-medium">
                            {ind}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 pt-1">
                      <strong>Post-Qualification Rights: </strong>{sys.visaAndWorkRights}
                    </div>
                  </div>

                  {sys.officialUrl && (
                    <div className="pt-3 border-t border-slate-200">
                      <a
                        href={sys.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <span>Official National Registry</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
