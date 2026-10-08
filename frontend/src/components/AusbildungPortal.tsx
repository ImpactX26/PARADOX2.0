import React, { useState } from 'react';
import { 
  Stethoscope, 
  Cpu, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  Euro, 
  ShieldCheck, 
  ArrowRight, 
  BookOpen, 
  Award, 
  FileText, 
  Calendar,
  Building,
  TrendingUp,
  Clock,
  HeartPulse,
  Sparkles
} from 'lucide-react';
import { ApplicantRecord } from '../types';

interface AusbildungPortalProps {
  applicant: ApplicantRecord | null;
  onSelectTrade?: (tradeName: string) => void;
}

export interface VocationalTrade {
  id: string;
  nameDe: string;
  nameEn: string;
  icon: any;
  durationYears: string;
  monthlyStipendGross: number; // Avg 1st year
  livingExpenseEstimate: number;
  languagePrerequisite: 'B1' | 'B2';
  shortageStatus: 'CRITICAL SHORTAGE (High Placement Odds)' | 'HIGH DEMAND' | 'STEADY DEMAND';
  description: string;
  workSettings: string[];
  sampleEmployers: string[];
}

export const AusbildungPortal: React.FC<AusbildungPortalProps> = ({
  applicant,
  onSelectTrade,
}) => {
  const [selectedTradeId, setSelectedTradeId] = useState<string>('nursing');
  const [customGrossStipend, setCustomGrossStipend] = useState<number>(1150);
  const [selectedCityExpense, setSelectedCityExpense] = useState<number>(850);
  const [selectedGermanLevel, setSelectedGermanLevel] = useState<string>(
    applicant?.languages?.find(l => l.language.toLowerCase().includes('german'))?.level || 'B1'
  );

  const trades: VocationalTrade[] = [
    {
      id: 'nursing',
      nameDe: 'Pflegefachmann / Pflegefachfrau',
      nameEn: 'Generalist Registered Nursing Specialist',
      icon: HeartPulse,
      durationYears: '3 Years (Generalist Curriculum)',
      monthlyStipendGross: 1190,
      livingExpenseEstimate: 820,
      languagePrerequisite: 'B2',
      shortageStatus: 'CRITICAL SHORTAGE (High Placement Odds)',
      description: 'Unified European hospital nursing standard combining adult acute care, pediatric care, and elderly nursing. High employer demand across Germany.',
      workSettings: ['University Teaching Hospitals', 'Acute Surgical Clinics', 'Specialized Care Centers'],
      sampleEmployers: ['Charité Berlin', 'University Hospital Cologne', 'Helios Kliniken', 'Asklepios Kliniken']
    },
    {
      id: 'it_systems',
      nameDe: 'Fachinformatiker für Systemintegration',
      nameEn: 'IT Systems & Cloud Infrastructure Specialist',
      icon: Cpu,
      durationYears: '3 Years',
      monthlyStipendGross: 1080,
      livingExpenseEstimate: 870,
      languagePrerequisite: 'B1',
      shortageStatus: 'HIGH DEMAND',
      description: 'Hands-on enterprise systems integration, hybrid cloud environments, Linux/Windows server virtualization, and cybersecurity incident handling.',
      workSettings: ['Enterprise IT Departments', 'Managed Service Providers', 'Industrial Cloud Centers'],
      sampleEmployers: ['SAP Labs Germany', 'Siemens Digital Industries', 'Deutsche Telekom', 'Bechtle AG']
    },
    {
      id: 'mechatronics',
      nameDe: 'Mechatroniker für Automatisierungstechnik',
      nameEn: 'Industrial Mechatronics & Robotics Specialist',
      icon: Wrench,
      durationYears: '3.5 Years',
      monthlyStipendGross: 1140,
      livingExpenseEstimate: 840,
      languagePrerequisite: 'B1',
      shortageStatus: 'HIGH DEMAND',
      description: 'Combines mechanical engineering, electrical circuits, and programmable logic controllers (PLC) for automated production lines and robotics.',
      workSettings: ['Automotive Assembly Plants', 'Industrial Automation Hubs', 'Robotics Engineering Facilities'],
      sampleEmployers: ['BMW Group Munich', 'Mercedes-Benz AG', 'Bosch Rexroth', 'KUKA Robotics']
    }
  ];

  const activeTrade = trades.find(t => t.id === selectedTradeId) || trades[0];

  // Financial Calculations: Net stipend vs monthly living expenses
  const gross = customGrossStipend;
  // In Germany, training stipends under €1,300 typically have ~18-20% social security (pension, healthcare, nursing care, unemployment)
  const estimatedTaxAndSocialDeductions = Math.round(gross * 0.19);
  const netTakeHome = gross - estimatedTaxAndSocialDeductions;
  const netMonthlyBalance = netTakeHome - selectedCityExpense;

  // Language Gatekeeper Logic
  const getGatekeeperStatus = () => {
    const isB2 = ['B2', 'C1', 'C2', 'Fluent'].includes(selectedGermanLevel);
    const isB1 = ['B1'].includes(selectedGermanLevel);

    if (activeTrade.languagePrerequisite === 'B2') {
      if (isB2) {
        return {
          status: 'QUALIFIED_DIRECT',
          badge: '🟢 DIRECT PLACEMENT ELIGIBLE',
          color: 'emerald',
          msg: 'You satisfy the official B2 standard for direct patient/clinical placement and expedited visa issuance.'
        };
      } else if (isB1) {
        return {
          status: 'QUALIFIED_CONDITIONAL',
          badge: '🟡 CONDITIONAL PLACEMENT ELIGIBLE',
          color: 'amber',
          msg: 'You qualify for an employer contract with an integrated B1-to-B2 adaptation course in Germany before hospital ward deployment.'
        };
      } else {
        return {
          status: 'GAP_PREREQUISITE',
          badge: '🔴 PREREQUISITE REQUIRED: Goethe/telc B1 or B2',
          color: 'rose',
          msg: 'German nursing regulations require at least Goethe/telc B1 certification before an official training visa can be lodged.'
        };
      }
    } else {
      // Technical IT / Mechatronics trades (require B1)
      if (isB1 || isB2) {
        return {
          status: 'QUALIFIED_DIRECT',
          badge: '🟢 DIRECT PLACEMENT ELIGIBLE',
          color: 'emerald',
          msg: 'Your German proficiency satisfies statutory prerequisites for vocational school (Berufsschule) lectures.'
        };
      } else {
        return {
          status: 'GAP_PREREQUISITE',
          badge: '🔴 PREREQUISITE REQUIRED: Goethe/telc B1',
          color: 'rose',
          msg: 'Technical apprenticeship programs require Goethe/telc B1 to understand technical blueprints and workplace safety.'
        };
      }
    }
  };

  const gatekeeper = getGatekeeperStatus();

  const roadmapSteps = [
    {
      step: 1,
      title: 'German Language Mastery',
      detail: 'Complete Goethe-Institut or telc B1/B2 training. Focus on vocational medical/technical vocabulary.',
      status: selectedGermanLevel !== 'A1' && selectedGermanLevel !== 'A2' ? 'In Progress' : 'Prerequisite'
    },
    {
      step: 2,
      title: 'School Credential Recognition',
      detail: 'Submit Indian 10th & 12th certificates to German recognition authority (e.g. Bezirksregierung) for equivalence.',
      status: 'Document Check'
    },
    {
      step: 3,
      title: 'Partner Employer Interview',
      detail: 'Participate in live video interviews with accredited German hospitals or industrial training facilities.',
      status: 'Matching'
    },
    {
      step: 4,
      title: 'Ausbildungsvertrag Signing',
      detail: 'Receive signed bipartite contract specifying your €1,100–€1,400 monthly stipend and statutory vacation days.',
      status: 'Contract Issued'
    },
    {
      step: 5,
      title: 'Federal Employment Approval (BA)',
      detail: 'German Federal Employment Agency verifies local work market conditions and issues fast-track pre-approval.',
      status: 'Pre-Approval'
    },
    {
      step: 6,
      title: 'Consular Visa Issuance (AufenthG § 16a)',
      detail: 'Lodge visa application at VFS Global. Zero blocked account required due to guaranteed training salary.',
      status: 'Visa Stamp'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-sky-500/10 to-transparent pointer-events-none" />
        
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950">
            <Sparkles className="w-3.5 h-3.5" /> German Duale Ausbildung Track
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Vocational Apprenticeship, Paid Stipends & Zero Blocked Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            The German Dual Education System combines hands-on paid enterprise training with state vocational school lectures. Earn a government-regulated stipend of <strong>€1,100 to €1,400/month</strong> from Day 1, legally waiving the €11,904 blocked account requirement.
          </p>

          <div className="flex flex-wrap gap-3 pt-2 text-xs">
            <span className="bg-white/10 px-3 py-1 rounded-lg flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> €0 Tuition Fees
            </span>
            <span className="bg-white/10 px-3 py-1 rounded-lg flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Statutory Monthly Salary
            </span>
            <span className="bg-white/10 px-3 py-1 rounded-lg flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Full German Health Coverage
            </span>
          </div>
        </div>
      </div>

      {/* Trade Selector Cards */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">1. Select Your Target Vocational Trade</h2>
            <p className="text-xs text-slate-500">Choose an accredited profession aligned with German nationwide labor shortages.</p>
          </div>
          <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
            3 High-Growth Pathways
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {trades.map((t) => {
            const Icon = t.icon;
            const isSelected = selectedTradeId === t.id;

            return (
              <div
                key={t.id}
                onClick={() => {
                  setSelectedTradeId(t.id);
                  setCustomGrossStipend(t.monthlyStipendGross);
                  if (onSelectTrade) onSelectTrade(t.nameDe);
                }}
                className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
                  isSelected
                    ? 'bg-white border-2 border-sky-600 shadow-md ring-4 ring-sky-500/10'
                    : 'bg-white border border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    t.shortageStatus.includes('CRITICAL') ? 'bg-rose-100 text-rose-800' : 'bg-sky-100 text-sky-800'
                  }`}>
                    {t.shortageStatus.includes('CRITICAL') ? '🔥 Critical Need' : '⚡ High Demand'}
                  </span>
                </div>

                <div className="font-bold text-slate-900 text-sm">{t.nameDe}</div>
                <div className="text-xs text-slate-500 mb-3">{t.nameEn}</div>

                <p className="text-[11px] text-slate-600 leading-relaxed mb-4">
                  {t.description}
                </p>

                <div className="pt-3 border-t border-slate-100 text-xs space-y-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">Duration:</span>
                    <strong className="text-slate-800">{t.durationYears}</strong>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">Avg. 1st Year Stipend:</span>
                    <strong className="text-emerald-700 font-bold">€{t.monthlyStipendGross} / mo</strong>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">Language Prerequisite:</span>
                    <strong className="text-sky-700 font-bold">{t.languagePrerequisite} Goethe/telc</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Language Gatekeeper & Stipend Living Cost Calculator */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Card: German Language Gatekeeper */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider block">Regulatory Check</span>
              <h3 className="text-base font-bold text-slate-900">German Language Gatekeeper</h3>
            </div>
            <ShieldCheck className="w-6 h-6 text-sky-600" />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 block">
              Candidate Current Verified German Proficiency:
            </label>
            <div className="grid grid-cols-5 gap-2 text-xs">
              {['A1', 'A2', 'B1', 'B2', 'C1'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedGermanLevel(lvl)}
                  className={`py-2 rounded-xl font-bold transition-all ${
                    selectedGermanLevel === lvl
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Gatekeeper Decision Banner */}
          <div className={`p-4 rounded-xl border space-y-1.5 ${
            gatekeeper.color === 'emerald'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : gatekeeper.color === 'amber'
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}>
            <div className="font-extrabold text-xs flex items-center gap-1.5">
              <span>{gatekeeper.badge}</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              {gatekeeper.msg}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 space-y-1.5">
            <strong className="block text-slate-900 font-bold">Why Language is Non-Negotiable:</strong>
            <p className="text-[11px] leading-snug">
              Vocational school exams (*Zwischenprüfung* and *Abschlussprüfung*) are administered strictly in German by the German Chamber of Commerce (IHK) or Chamber of Skilled Crafts (HWK).
            </p>
          </div>
        </div>

        {/* Right Card: Monthly Stipend & Living Cost Calculator */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Financial Solvency</span>
              <h3 className="text-base font-bold text-slate-900">Stipend & Living Cost Calculator</h3>
            </div>
            <Euro className="w-6 h-6 text-emerald-600" />
          </div>

          {/* Inputs */}
          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-slate-700">Gross Monthly Stipend:</span>
                <span className="font-mono font-bold text-sky-700">€{customGrossStipend} / mo</span>
              </div>
              <input
                type="range"
                min="950"
                max="1550"
                step="25"
                value={customGrossStipend}
                onChange={(e) => setCustomGrossStipend(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">German statutory minimum for apprentices: €649; Nursing standard: €1,190–€1,350</span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-slate-700">Estimated Monthly Living Expense:</span>
                <span className="font-mono font-bold text-slate-800">€{selectedCityExpense} / mo</span>
              </div>
              <input
                type="range"
                min="650"
                max="1100"
                step="25"
                value={selectedCityExpense}
                onChange={(e) => setSelectedCityExpense(Number(e.target.value))}
                className="w-full accent-slate-800 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">Covers student dorm/room (€400), food (€250), local transit (€29-ticket)</span>
            </div>
          </div>

          {/* Calculation Breakdown Table */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2 font-mono">
            <div className="flex justify-between text-slate-600">
              <span>Gross Training Salary:</span>
              <span className="font-bold text-slate-900">+ €{gross}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Social Security & Health (~19%):</span>
              <span className="text-rose-600">- €{estimatedTaxAndSocialDeductions}</span>
            </div>
            <div className="flex justify-between text-slate-800 font-bold pt-1 border-t border-slate-200">
              <span>Estimated Net Take-Home:</span>
              <span>€{netTakeHome}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Monthly Living Expenses:</span>
              <span className="text-rose-600">- €{selectedCityExpense}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-black pt-2 border-t border-slate-300">
              <span className="text-slate-900">Net Monthly Balance:</span>
              <span className={netMonthlyBalance >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                {netMonthlyBalance >= 0 ? `+ €${netMonthlyBalance}` : `- €${Math.abs(netMonthlyBalance)}`}
              </span>
            </div>
          </div>

          {/* Exemption Callout */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[11px]">
              <strong>Statutory Visa Exemption:</strong> Because your net salary covers living costs, the German Consular Mission will <strong>NOT require a €11,904 blocked account</strong> for your visa appointment under § 16a AufenthG.
            </p>
          </div>
        </div>
      </div>

      {/* Step-by-Step Apprenticeship Roadmap */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider block">End-to-End Pathway</span>
          <h3 className="text-lg font-bold text-slate-900">German Apprenticeship Contract & Visa Roadmap</h3>
          <p className="text-xs text-slate-500">Step-by-step milestones from initial language training in India to arrival and contract signing in Germany.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {roadmapSteps.map((s) => (
            <div key={s.step} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                  {s.step}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                  {s.status}
                </span>
              </div>
              <div className="font-bold text-xs text-slate-900">{s.title}</div>
              <p className="text-[11px] text-slate-600 leading-relaxed">{s.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
