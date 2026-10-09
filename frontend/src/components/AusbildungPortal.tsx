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
  Sparkles,
  ExternalLink,
  GraduationCap,
  Layers,
  Search,
  School,
  Briefcase
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

export interface InstitutionalProvider {
  id: string;
  category: 'DHBW' | 'HAW_UAS' | 'BERUFSAKADEMIE' | 'CHAMBER_IHK_HWK';
  categoryTitle: string;
  institutionName: string;
  location: string;
  dualModel: string;
  corporatePartners: string[];
  stipendRange: string;
  qualificationAwarded: string;
  highlights: string[];
  blockedAccountWaived: boolean;
  officialUrl?: string;
}

export const AusbildungPortal: React.FC<AusbildungPortalProps> = ({
  applicant,
  onSelectTrade,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'taxonomy' | 'trades' | 'finances' | 'roadmap'>('taxonomy');
  const [selectedTradeId, setSelectedTradeId] = useState<string>('nursing');
  const [customGrossStipend, setCustomGrossStipend] = useState<number>(1250);
  const [selectedCityExpense, setSelectedCityExpense] = useState<number>(850);
  const [selectedGermanLevel, setSelectedGermanLevel] = useState<string>(
    applicant?.languages?.find(l => l.language.toLowerCase().includes('german'))?.level || 'B1'
  );
  const [taxonomyCategoryFilter, setTaxonomyCategoryFilter] = useState<string>('ALL');
  const [taxonomySearchQuery, setTaxonomySearchQuery] = useState<string>('');

  // Institutional Taxonomy Providers
  const institutionalProviders: InstitutionalProvider[] = [
    {
      id: 'dhbw_stuttgart_karlsruhe',
      category: 'DHBW',
      categoryTitle: 'Duale Hochschulen (Cooperative State Universities)',
      institutionName: 'Duale Hochschule Baden-Württemberg (DHBW)',
      location: 'Stuttgart, Karlsruhe, Mannheim, Ravensburg',
      dualModel: '100% Integrated Work-Study (3-month academic / 3-month corporate cycles)',
      corporatePartners: ['SAP SE', 'Porsche AG', 'Robert Bosch GmbH', 'Mercedes-Benz', 'IBM Deutschland'],
      stipendRange: '€1,100 – €1,600 / month',
      qualificationAwarded: 'State Bachelor of Science (B.Sc.) / Bachelor of Engineering (B.Eng.)',
      highlights: [
        'Guaranteed monthly salary throughout entire 3-year study duration',
        'Official contractual employment partner with DAX-40 enterprises',
        'Zero tuition fees across state faculties'
      ],
      blockedAccountWaived: true,
      officialUrl: 'https://www.dhbw.de/english/home'
    },
    {
      id: 'fh_aachen',
      category: 'HAW_UAS',
      categoryTitle: 'State Universities of Applied Sciences (HAW / UAS)',
      institutionName: 'FH Aachen University of Applied Sciences',
      location: 'Aachen & Jülich, North Rhine-Westphalia',
      dualModel: 'Ausbildungsintegrierend (Training-Integrated Dual Degree)',
      corporatePartners: ['Siemens AG', 'Saint-Gobain', 'FEV Europe GmbH', 'Forschungszentrum Jülich'],
      stipendRange: '€1,050 – €1,400 / month',
      qualificationAwarded: 'Dual Bachelor of Engineering (B.Eng.) + IHK Certified Vocational Credential',
      highlights: [
        'Simultaneous graduation with accredited German university degree and state chamber certificate',
        'Direct access to top Rhine-Ruhr industrial corridor engineering employers',
        'Structured apprenticeship contract registered with IHK Aachen'
      ],
      blockedAccountWaived: true,
      officialUrl: 'https://www.fh-aachen.de/'
    },
    {
      id: 'th_koeln',
      category: 'HAW_UAS',
      categoryTitle: 'State Universities of Applied Sciences (HAW / UAS)',
      institutionName: 'TH Köln (Technology Arts Sciences)',
      location: 'Cologne (Köln), North Rhine-Westphalia',
      dualModel: 'Praxisintegrierend / Ausbildungsintegrierend Dual Bachelor',
      corporatePartners: ['Ford Werke GmbH', 'Lanxess AG', 'DEUTZ AG', 'TÜV Rheinland'],
      stipendRange: '€1,120 – €1,450 / month',
      qualificationAwarded: 'Bachelor of Science in Informatics / Mechanical Engineering',
      highlights: [
        'Hands-on enterprise projects with world-leading chemical and automotive clusters',
        'Full health and social insurance co-funded by corporate sponsor'
      ],
      blockedAccountWaived: true,
      officialUrl: 'https://www.th-koeln.de/'
    },
    {
      id: 'hwr_berlin',
      category: 'HAW_UAS',
      categoryTitle: 'State Universities of Applied Sciences (HAW / UAS)',
      institutionName: 'HWR Berlin (Berlin School of Economics and Law)',
      location: 'Berlin Capital Region',
      dualModel: 'Dual Work-Study Bachelor Programs',
      corporatePartners: ['Deutsche Bahn AG', 'Siemens Energy', 'Bayer AG', 'Berliner Sparkasse'],
      stipendRange: '€1,100 – €1,480 / month',
      qualificationAwarded: 'Dual Bachelor of Arts (B.A.) / Dual Bachelor of Science (B.Sc.)',
      highlights: [
        'Berlin tech and finance corporate partner placements',
        'Over 700 cooperating companies across Germany'
      ],
      blockedAccountWaived: true,
      officialUrl: 'https://www.hwr-berlin.de/'
    },
    {
      id: 'munich_uas',
      category: 'HAW_UAS',
      categoryTitle: 'State Universities of Applied Sciences (HAW / UAS)',
      institutionName: 'Munich University of Applied Sciences (HM)',
      location: 'Munich, Bavaria',
      dualModel: 'Verbundstudium (Combined Vocational + Academic Bachelor)',
      corporatePartners: ['BMW Group', 'MAN Truck & Bus', 'Rohde & Schwarz', 'Knorr-Bremse'],
      stipendRange: '€1,200 – €1,550 / month',
      qualificationAwarded: 'Bachelor of Engineering + IHK Mechatronics / Informatics Certificate',
      highlights: [
        'Bavarian industrial excellence hub with direct corporate hire pipeline',
        'Higher stipend rates to account for Munich metropolitan area'
      ],
      blockedAccountWaived: true,
      officialUrl: 'https://www.hm.edu/'
    },
    {
      id: 'ba_sachsen',
      category: 'BERUFSAKADEMIE',
      categoryTitle: 'Berufsakademien (State-Recognized Professional Academies)',
      institutionName: 'Berufsakademie Sachsen (Duale Hochschule Sachsen)',
      location: 'Dresden, Leipzig, Chemnitz, Bautzen',
      dualModel: 'Dual Cooperative Academy Model (State Recognized)',
      corporatePartners: ['Infineon Technologies', 'GlobalFoundries', 'Volkswagen Sachsen', 'enviaM'],
      stipendRange: '€1,000 – €1,350 / month',
      qualificationAwarded: 'State Dual Bachelor Degree (Saxony State Recognition)',
      highlights: [
        'Silicon Saxony semiconductor and microelectronics industrial focus',
        'Significantly lower living costs in eastern Germany (~€650–€750/mo)',
        'Very high net surplus potential on student stipend'
      ],
      blockedAccountWaived: true,
      officialUrl: 'https://www.ba-sachsen.de/'
    },
    {
      id: 'ihk_hwk_berufsschulen',
      category: 'CHAMBER_IHK_HWK',
      categoryTitle: 'Chamber Networks (IHK / HWK Berufsschulen)',
      institutionName: 'IHK & HWK Dual Apprenticeship Network (Nationwide)',
      location: 'All 16 German Federal States (80+ IHK & 53 HWK Chambers)',
      dualModel: 'Duale Berufsausbildung (Bipartite Enterprise + State Vocational School)',
      corporatePartners: ['Charité Berlin', 'Helios Kliniken', 'Deutsche Telekom', 'Siemens', 'Over 450,000 SMEs'],
      stipendRange: '€1,150 – €1,450 / month',
      qualificationAwarded: 'Federal Skilled Trade Credential (IHK/HWK Facharbeiterbrief / Pflegefachkraft)',
      highlights: [
        'Critical shortage fields: Pflegefachmann/frau, Fachinformatiker, Mechatroniker',
        'Stipends legally mandated by collective labor agreements (TVöD / IHK tariffs)',
        'Direct § 16a AufenthG residence permit with ZERO blocked account required'
      ],
      blockedAccountWaived: true,
      officialUrl: 'https://www.ihk.de/'
    }
  ];

  const trades: VocationalTrade[] = [
    {
      id: 'nursing',
      nameDe: 'Pflegefachmann / Pflegefachfrau',
      nameEn: 'Generalist Registered Nursing Specialist',
      icon: HeartPulse,
      durationYears: '3 Years (Generalist EU Curriculum)',
      monthlyStipendGross: 1250,
      livingExpenseEstimate: 850,
      languagePrerequisite: 'B2',
      shortageStatus: 'CRITICAL SHORTAGE (High Placement Odds)',
      description: 'Unified European hospital nursing standard combining adult acute clinical care, pediatric care, and elderly nursing. High employer demand with zero blocked account requirement.',
      workSettings: ['University Teaching Hospitals', 'Acute Surgical Clinics', 'Specialized Care Centers'],
      sampleEmployers: ['Charité Berlin', 'University Hospital Cologne', 'Helios Kliniken', 'Asklepios Kliniken']
    },
    {
      id: 'it_systems',
      nameDe: 'Fachinformatiker für Systemintegration',
      nameEn: 'IT Systems & Cloud Infrastructure Specialist',
      icon: Cpu,
      durationYears: '3 Years',
      monthlyStipendGross: 1180,
      livingExpenseEstimate: 850,
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
      monthlyStipendGross: 1220,
      livingExpenseEstimate: 850,
      languagePrerequisite: 'B1',
      shortageStatus: 'HIGH DEMAND',
      description: 'Combines mechanical engineering, electrical circuits, and programmable logic controllers (PLC) for automated production lines, CNC machinery, and robotics.',
      workSettings: ['Automotive Assembly Plants', 'Industrial Automation Hubs', 'Robotics Engineering Facilities'],
      sampleEmployers: ['BMW Group Munich', 'Mercedes-Benz AG', 'Bosch Rexroth', 'KUKA Robotics']
    }
  ];

  const activeTrade = trades.find(t => t.id === selectedTradeId) || trades[0];

  // Financial Calculations: Net stipend vs monthly living expenses
  const gross = customGrossStipend;
  // In Germany, training stipends under collective agreements have ~18-20% social security deductions
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
          msg: 'You satisfy the official B2 standard for direct patient/clinical placement and expedited visa issuance under § 16a AufenthG.'
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
          msg: 'Technical apprenticeship programs require Goethe/telc B1 to understand technical blueprints and workplace safety regulations.'
        };
      }
    }
  };

  const gatekeeper = getGatekeeperStatus();

  const filteredProviders = institutionalProviders.filter(p => {
    const matchesCategory = taxonomyCategoryFilter === 'ALL' || p.category === taxonomyCategoryFilter;
    const matchesSearch = 
      p.institutionName.toLowerCase().includes(taxonomySearchQuery.toLowerCase()) ||
      p.corporatePartners.some(c => c.toLowerCase().includes(taxonomySearchQuery.toLowerCase())) ||
      p.location.toLowerCase().includes(taxonomySearchQuery.toLowerCase()) ||
      p.categoryTitle.toLowerCase().includes(taxonomySearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950">
            <Sparkles className="w-3.5 h-3.5" /> Duale Ausbildung & Duales Studium System
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Institutional Taxonomy, Corporate Stipends & €0 Blocked Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Germany’s dual model integrates work-study at Cooperative State Universities (DHBW), State Universities of Applied Sciences (HAW/UAS), Berufsakademien, and Chamber Networks (IHK/HWK). Corporate stipends of <strong>€1,150–€1,450/month</strong> guarantee financial independence and legally waive the €11,904 blocked account requirement (*Sperrkonto*).
          </p>

          <div className="flex flex-wrap gap-3 pt-2 text-xs">
            <span className="bg-white/10 px-3 py-1 rounded-lg flex items-center gap-1.5 border border-white/10">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> €0 Blocked Account (*Sperrkonto-Befreiung*)
            </span>
            <span className="bg-white/10 px-3 py-1 rounded-lg flex items-center gap-1.5 border border-white/10">
              <Euro className="w-3.5 h-3.5 text-emerald-400" /> €1,150–€1,600 / Mo Guaranteed Stipends
            </span>
            <span className="bg-white/10 px-3 py-1 rounded-lg flex items-center gap-1.5 border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> AufenthG § 16a Statutory Protection
            </span>
          </div>
        </div>
      </div>

      {/* Official Public Registries Portal Links Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <Building className="w-4 h-4 text-amber-400" />
            <span>OFFICIAL PUBLIC REGISTRIES & GOVERNMENT SEARCH ENGINES</span>
          </div>
          <span className="text-[11px] text-slate-400">Verified German Federal Public Databases</span>
        </div>

        <div className="grid md:grid-cols-3 gap-3 pt-1">
          <a
            href="https://www.ausbildungplus.de/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors">
                  BIBB AusbildungPlus
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-300" />
              </div>
              <p className="text-[11px] text-slate-300 mt-1">
                Official Federal Institute for Vocational Education (BIBB) registry of 1,600+ dual study and apprenticeship programs.
              </p>
            </div>
            <span className="text-[10px] font-mono text-amber-400 pt-2 block">ausbildungplus.de →</span>
          </a>

          <a
            href="https://www.hochschulkompass.de/duales-studium.html"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white group-hover:text-sky-300 transition-colors">
                  Hochschulkompass Duales Studium
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-300" />
              </div>
              <p className="text-[11px] text-slate-300 mt-1">
                German Rectors' Conference (HRK) complete nationwide database of dual academic degree programs.
              </p>
            </div>
            <span className="text-[10px] font-mono text-sky-400 pt-2 block">hochschulkompass.de →</span>
          </a>

          <a
            href="https://www.ihk-lehrstellenboerse.de/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white group-hover:text-emerald-300 transition-colors">
                  IHK Lehrstellenbörse
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-300" />
              </div>
              <p className="text-[11px] text-slate-300 mt-1">
                German Association of Chambers of Industry & Commerce nationwide apprenticeship exchange with verified contracts.
              </p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 pt-2 block">ihk-lehrstellenboerse.de →</span>
          </a>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('taxonomy')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'taxonomy'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Building className="w-4 h-4 text-sky-400" />
          <span>1. Institutional Taxonomy Directory</span>
        </button>

        <button
          onClick={() => setActiveSubTab('finances')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'finances'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Euro className="w-4 h-4 text-emerald-400" />
          <span>2. Stipend vs Living Cost Balance (€0 Sperrkonto)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('trades')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'trades'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Briefcase className="w-4 h-4 text-amber-400" />
          <span>3. Target Shortage Trades</span>
        </button>

        <button
          onClick={() => setActiveSubTab('roadmap')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'roadmap'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-purple-400" />
          <span>4. Visa Roadmap (§ 16a)</span>
        </button>
      </div>

      {/* SubTab 1: Institutional Taxonomy Directory */}
      {activeSubTab === 'taxonomy' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Accredited German Dual Education Taxonomy Providers
                </h3>
                <p className="text-xs text-slate-500">
                  Categorized mapping of Duale Hochschulen, State UAS, Berufsakademien, and Chamber networks
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'ALL', label: 'All Providers' },
                  { id: 'DHBW', label: '🎓 Duale Hochschulen (DHBW)' },
                  { id: 'HAW_UAS', label: '🏛️ State UAS (HAW)' },
                  { id: 'BERUFSAKADEMIE', label: '📜 Berufsakademien (BA)' },
                  { id: 'CHAMBER_IHK_HWK', label: '⚙️ Chambers (IHK/HWK)' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setTaxonomyCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      taxonomyCategoryFilter === cat.id
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by institution name (DHBW, FH Aachen, Munich UAS), partner company (SAP, Bosch, Porsche), or city..."
                value={taxonomySearchQuery}
                onChange={(e) => setTaxonomySearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Providers Grid */}
            <div className="grid md:grid-cols-2 gap-5 pt-1">
              {filteredProviders.map((prov) => (
                <div
                  key={prov.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                        {prov.categoryTitle}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        €0 Blocked Account
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                        {prov.institutionName}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        📍 {prov.location}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1.5 border border-slate-100">
                      <div>
                        <span className="text-slate-500 font-semibold text-[11px] block">Dual Work-Study Model:</span>
                        <span className="font-medium text-slate-800">{prov.dualModel}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-semibold text-[11px] block">Qualification Awarded:</span>
                        <span className="font-semibold text-sky-900">{prov.qualificationAwarded}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                        <span className="text-slate-500 text-[11px]">Monthly Corporate Stipend:</span>
                        <strong className="text-emerald-700 font-bold">{prov.stipendRange}</strong>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-700 block">Accredited Corporate Partners:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {prov.corporatePartners.map((partner, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md font-medium border border-slate-200"
                          >
                            {partner}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1 pt-1">
                      {prov.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {prov.officialUrl && (
                    <div className="pt-3 border-t border-slate-100">
                      <a
                        href={prov.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <span>Visit Official Institution Portal</span>
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

      {/* SubTab 2: Stipend vs Living Cost Balance (€0 Blocked Account) */}
      {activeSubTab === 'finances' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Card: Monthly Stipend vs Cost Breakdown */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Solvency Guarantee</span>
                <h3 className="text-base font-bold text-slate-900">Stipend vs. Living Cost Balance</h3>
              </div>
              <Euro className="w-6 h-6 text-emerald-600" />
            </div>

            {/* Inputs */}
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-700">Gross Monthly Corporate Stipend:</span>
                  <span className="font-mono font-bold text-sky-700 text-sm">€{customGrossStipend} / mo</span>
                </div>
                <input
                  type="range"
                  min="950"
                  max="1600"
                  step="25"
                  value={customGrossStipend}
                  onChange={(e) => setCustomGrossStipend(Number(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">Typical range: DHBW (€1,100–€1,600), Nursing (€1,190–€1,350), IT (€1,100–€1,400)</span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-700">Estimated Average Monthly Living Cost:</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">€{selectedCityExpense} / mo</span>
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
                <span className="text-[10px] text-slate-400">Standard German student living basket: €850/mo (Accommodation €400, Food €260, Insurance €120, Transit €29, Sundries €41)</span>
              </div>
            </div>

            {/* Calculation Breakdown Table */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2 font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Gross Monthly Stipend:</span>
                <span className="font-bold text-slate-900">+ €{gross}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Social Security & Statutory Health (~19%):</span>
                <span className="text-rose-600">- €{estimatedTaxAndSocialDeductions}</span>
              </div>
              <div className="flex justify-between text-slate-800 font-bold pt-1 border-t border-slate-200">
                <span>Estimated Net Take-Home:</span>
                <span>€{netTakeHome}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Average Living Costs (Rent, Food, Transport):</span>
                <span className="text-rose-600">- €{selectedCityExpense}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-black pt-2 border-t border-slate-300">
                <span className="text-slate-900">Net Monthly Balance / Surplus:</span>
                <span className={netMonthlyBalance >= 0 ? 'text-emerald-700 text-base' : 'text-rose-600 text-base'}>
                  {netMonthlyBalance >= 0 ? `+ €${netMonthlyBalance} / mo` : `- €${Math.abs(netMonthlyBalance)} / mo`}
                </span>
              </div>
            </div>

            <div className="bg-slate-100 rounded-xl p-3 text-[11px] text-slate-600 space-y-1">
              <strong>Annual Cumulative Stipend Payout:</strong>
              <div className="font-mono text-xs font-bold text-slate-900">
                Gross: €{(gross * 12).toLocaleString()} / year • Net Take-Home: €{(netTakeHome * 12).toLocaleString()} / year
              </div>
            </div>
          </div>

          {/* Right Card: Official €0 Blocked Account Statutory Exemption */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider block">AufenthG § 16a Statutory Visa Rule</span>
                <h3 className="text-base font-bold text-slate-900">Blocked Account (*Sperrkonto*) Exemption</h3>
              </div>
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>

            {/* Big Badge Banner */}
            <div className="p-5 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/40 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                  ✓
                </span>
                <span className="font-extrabold text-sm text-emerald-950">
                  €0 BLOCKED ACCOUNT REQUIRED
                </span>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                Unlike traditional university degrees requiring an upfront deposit of <strong>€11,904 in a blocked account (*Sperrkonto*)</strong>, accredited dual vocational training contracts (*Ausbildungsvertrag*) and dual degree contracts (*Studien- und Ausbildungsvertrag*) legally prove financial subsistence.
              </p>
            </div>

            {/* Comparison Table */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-3">
              <span className="font-bold text-slate-800 block">Upfront Capital Requirement Comparison:</span>
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200">
                  <div className="font-bold text-rose-900">Standard Master / Bachelor</div>
                  <div className="font-mono font-black text-rose-700 text-sm mt-1">€11,904 upfront</div>
                  <div className="text-slate-500 mt-1">Blocked account deposit mandatory before visa appointment</div>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div className="font-bold text-emerald-900">Duale Ausbildung / Studium</div>
                  <div className="font-mono font-black text-emerald-700 text-sm mt-1">€0 upfront</div>
                  <div className="text-slate-500 mt-1">Guaranteed corporate stipend contract accepted as sole proof of funds</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 space-y-1.5">
              <strong className="block text-slate-900 font-bold">Consular Visa Submission Requirement:</strong>
              <p className="text-[11px] leading-snug">
                At your German Mission / VFS appointment, you simply present the tripartite training contract countersigned by the employer and registered with the <strong>IHK / HWK / Regierungspräsidium</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SubTab 3: Target Trades & Language Gatekeeper */}
      {activeSubTab === 'trades' && (
        <div className="space-y-6">
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

          {/* Language Gatekeeper Banner */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider block">Language Prerequisite</span>
                <h3 className="text-base font-bold text-slate-900">German Language Gatekeeper for Vocational School (*Berufsschule*)</h3>
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
          </div>
        </div>
      )}

      {/* SubTab 4: Step-by-Step Apprenticeship Roadmap */}
      {activeSubTab === 'roadmap' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider block">End-to-End Pathway</span>
            <h3 className="text-lg font-bold text-slate-900">German Apprenticeship Contract & Visa Roadmap (§ 16a AufenthG)</h3>
            <p className="text-xs text-slate-500">Step-by-step milestones from initial language training in India to arrival and contract signing in Germany.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
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
                detail: 'Receive signed bipartite contract specifying your €1,100–€1,450 monthly stipend and statutory vacation days.',
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
            ].map((s) => (
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
      )}
    </div>
  );
};
