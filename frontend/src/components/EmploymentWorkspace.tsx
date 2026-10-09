import React, { useState } from 'react';
import { 
  Compass, 
  Briefcase, 
  Euro, 
  ShieldCheck, 
  CheckCircle2, 
  Search, 
  ExternalLink, 
  Globe2, 
  Award, 
  Sparkles, 
  Filter, 
  Clock, 
  Building2, 
  MapPin, 
  TrendingUp, 
  Scale, 
  ChevronRight 
} from 'lucide-react';
import { ApplicantRecord } from '../types';
import { GeographicRegion } from './PathwaySelector';
import { ChancenkartePortal } from './ChancenkartePortal';

interface EmploymentWorkspaceProps {
  initialRegion?: GeographicRegion;
  applicant: ApplicantRecord | null;
  onUpdateApplicant?: (updates: Partial<ApplicantRecord>) => void;
  onBackToSelector?: () => void;
}

interface EuropeanEmploymentCountry {
  id: string;
  country: string;
  flag: string;
  visaRoute: string;
  visaCategory: string;
  fastTrackNotes: string;
  statutoryMinSalary: string;
  languageExpectations: string;
  shortageOccupations: string[];
  officialPortalName: string;
  officialUrl: string;
}

export const EmploymentWorkspace: React.FC<EmploymentWorkspaceProps> = ({
  initialRegion = 'germany',
  applicant,
  onUpdateApplicant,
  onBackToSelector,
}) => {
  const [region, setRegion] = useState<GeographicRegion>(initialRegion);

  // --- PAN-EUROPEAN SHORTAGE SEARCH STATE ---
  const [selectedEuroCountryId, setSelectedEuroCountryId] = useState<string>('netherlands');
  const [euroSearchQuery, setEuroSearchQuery] = useState<string>('');

  const europeanCountries: EuropeanEmploymentCountry[] = [
    {
      id: 'netherlands',
      country: 'Netherlands',
      flag: '🇳🇱',
      visaRoute: 'Zoekjaar (Orientation Year) & Kennismigrant (Highly Skilled Migrant)',
      visaCategory: 'Fast-Track Knowledge Migrant',
      fastTrackNotes: 'Zoekjaar grants 1 full year of unconditional work authorization to top 200 global university graduates. Kennismigrant provides an expedited 2-week IND work permit.',
      statutoryMinSalary: '€3,925/mo gross (<30 yrs) | €5,357/mo gross (≥30 yrs) | €2,801/mo for Zoekjaar hires',
      languageExpectations: '100% English fluency accepted across Amsterdam, Eindhoven, and Rotterdam tech corridors. Zero Dutch required.',
      shortageOccupations: [
        'Semiconductor & Lithography Engineers (ASML cluster)',
        'Full-Stack & Cloud Architects',
        'Maritime Logistics AI Specialists',
        'Bio-Pharma Process Scientists',
        'Fintech Compliance Analysts'
      ],
      officialPortalName: 'Immigration and Naturalisation Service (IND)',
      officialUrl: 'https://ind.nl/en'
    },
    {
      id: 'austria',
      country: 'Austria',
      flag: '🇦🇹',
      visaRoute: 'Rot-Weiß-Rot-Karte (Red-White-Red Card)',
      visaCategory: 'Points-Based Qualified Settlement',
      fastTrackNotes: 'Requires scoring 70 points for Very Highly Qualified Workers (grants 6-month jobseeker visa) or 55 points for Shortage Occupations (*Mangelberufe*).',
      statutoryMinSalary: '€3,225/mo gross for Under 30 | €3,870/mo gross for Over 30 (paid 14 times per year)',
      languageExpectations: 'German A2–B1 earns bonus points; English-speaking roles dominant in Vienna tech startups and automotive suppliers.',
      shortageOccupations: [
        'Electrical Power Grid Engineers',
        'Software Application Developers',
        'Mechanical Engineering Technicians',
        'Data Analysts & BI Architects',
        'Registered Hospital Clinical Staff'
      ],
      officialPortalName: 'Austrian Federal Migration Platform',
      officialUrl: 'https://www.migration.gv.at/en/'
    },
    {
      id: 'ireland',
      country: 'Ireland',
      flag: '🇮🇪',
      visaRoute: 'Critical Skills Employment Permit (CSEP)',
      visaCategory: 'Direct Fast-Track to Permanent Residency',
      fastTrackNotes: 'CSEP fast-tracks to Stamp 4 permanent residency after just 2 years. Immediate family reunification and spouse unrestricted work authorization.',
      statutoryMinSalary: '€38,000/year (for listed Critical Skills roles) or €64,000/year (for any qualified role)',
      languageExpectations: 'Native English-speaking country. IELTS 6.5–7.0 or professional equivalency.',
      shortageOccupations: [
        'Software Engineers (Dublin Silicon Docks: Google, Meta, Apple)',
        'Biopharmaceutical Engineers (Cork/Galway pharma hub)',
        'Cybersecurity Architects & Site Reliability Engineers',
        'Medical Device Quality Assurance Specialists',
        'Chartered Structural Engineers'
      ],
      officialPortalName: 'Irish Immigration Service Delivery',
      officialUrl: 'https://www.irishimmigration.ie/'
    },
    {
      id: 'sweden',
      country: 'Sweden',
      flag: '🇸🇪',
      visaRoute: 'Certified Employer Work Permit (Arbetstillstånd)',
      visaCategory: 'Fast-Track Corporate Sponsor',
      fastTrackNotes: 'Certified employers receive work permits in 10 to 30 days. Must strictly comply with Swedish collective labor agreements (*Kollektivavtal*).',
      statutoryMinSalary: 'SEK 28,480/month (~€2,500/mo - 80% of Swedish median wage)',
      languageExpectations: 'English widely spoken across all corporate and tech settings in Stockholm and Gothenburg.',
      shortageOccupations: [
        'Embedded Systems & Automotive SW (Volvo, Scania)',
        'Telecommunications Engineers (Ericsson cluster)',
        'Gaming & Graphics Developers',
        'CleanTech & Battery Chemistry Specialists (Northvolt)',
        'DevOps & Kubernetes Engineers'
      ],
      officialPortalName: 'Swedish Migration Agency (Migrationsverket)',
      officialUrl: 'https://www.migrationsverket.se/English.html'
    },
    {
      id: 'finland',
      country: 'Finland',
      flag: '🇫🇮',
      visaRoute: 'Specialist Fast-Track 14-Day Residence Permit',
      visaCategory: 'Digital High-Speed Visa',
      fastTrackNotes: 'Finland offers a guaranteed 14-day digital fast-track decision for international IT specialists, senior researchers, and startup founders with a job offer.',
      statutoryMinSalary: '€3,638/month gross minimum for Specialist category',
      languageExpectations: 'English is the default corporate language across Helsinki tech ecosystems and universities.',
      shortageOccupations: [
        'Quantum Computing & Photonics Researchers',
        'Mobile Telecommunications & 6G Network Engineers',
        'Industrial Automation Developers',
        'Game Developers (Rovio, Supercell ecosystem)',
        'Specialist Healthcare Practitioners'
      ],
      officialPortalName: 'Finnish Immigration Service (Migri)',
      officialUrl: 'https://migri.fi/en/home'
    },
    {
      id: 'norway',
      country: 'Norway',
      flag: '🇳🇴',
      visaRoute: 'Skilled Worker Residence Permit (Faglært)',
      visaCategory: 'Academic Matching Work Permit',
      fastTrackNotes: 'Requires a concrete full-time job offer with position and salary commensurate with Norwegian collective pay agreements.',
      statutoryMinSalary: 'NOK 480,900/yr (~€41,500/yr for roles requiring Bachelor) | NOK 518,400/yr for Master roles',
      languageExpectations: 'English universally accepted in Energy, Oil & Gas, Maritime, and Software Engineering.',
      shortageOccupations: [
        'Subsea & Offshore Renewable Energy Engineers',
        'Maritime Autonomous Vessel Software Developers',
        'Cloud Infrastructure & DevOps Specialists',
        'Geotechnical Engineers',
        'Acute Clinical Care Personnel'
      ],
      officialPortalName: 'Norwegian Directorate of Immigration (UDI)',
      officialUrl: 'https://www.udi.no/en/'
    },
    {
      id: 'switzerland',
      country: 'Switzerland',
      flag: '🇨🇭',
      visaRoute: 'Non-EU Specialist Quotas (L & B Residence Permits)',
      visaCategory: 'High-Earning Specialist Quota',
      fastTrackNotes: 'Strict annual quotas for third-country nationals. Employer must demonstrate that no Swiss or EU/EFTA citizen could be hired for the role.',
      statutoryMinSalary: 'CHF 100,000 – CHF 130,000 / year typical market rate for specialist engineers in Zurich/Geneva',
      languageExpectations: 'German in Zurich/Basel; French in Geneva/Lausanne. Corporate multinational tech roles accept 100% English.',
      shortageOccupations: [
        'AI & Machine Learning Researchers (Google Zurich, ETH spinoffs)',
        'Quantitative Finance & Algorithmic Trading Developers',
        'Precision MedTech & Pharmaceuticals (Novartis, Roche)',
        'Cyber Defense & Cryptographic Engineers',
        'Robotics & Micro-Mechanical Specialists'
      ],
      officialPortalName: 'State Secretariat for Migration (SEM)',
      officialUrl: 'https://www.sem.admin.ch/sem/en/home.html'
    },
    {
      id: 'united_kingdom',
      country: 'United Kingdom',
      flag: '🇬🇧',
      visaRoute: 'Skilled Worker Visa (Points-Based System)',
      visaCategory: 'Sponsorship-Based Employment',
      fastTrackNotes: 'Requires a valid Certificate of Sponsorship (CoS) from a licensed UK Home Office employer. Roles on the Immigration Salary List get 20% discount on salary threshold.',
      statutoryMinSalary: '£38,700/year (standard threshold) or £30,960/year for listed shortage / health roles',
      languageExpectations: 'English language proficiency (CEFR B1 / IELTS for UKVI).',
      shortageOccupations: [
        'AI Specialists & Data Scientists',
        'Aerospace Design & Propulsion Engineers',
        'National Health Service (NHS) Doctors & Specialist Nurses',
        'Civil Structural Engineers',
        'Fintech Software Developers (London Canary Wharf)'
      ],
      officialPortalName: 'UK Visas and Immigration (Gov.uk)',
      officialUrl: 'https://www.gov.uk/skilled-worker-visa'
    },
    {
      id: 'belgium',
      country: 'Belgium',
      flag: '🇧🇪',
      visaRoute: 'Single Permit (Permis Unique / Gecombineerde Vergunning)',
      visaCategory: 'Regional High-Skilled Permit',
      fastTrackNotes: 'Combines work and residence permit in one procedure administered through Brussels, Flanders, or Wallonia regional labor ministries.',
      statutoryMinSalary: '€47,560/year (Flemish Region highly skilled threshold for 2024)',
      languageExpectations: 'English widely used across European institutions, international NGOs, and Brussels diplomatic/IT headquarters.',
      shortageOccupations: [
        'EU Policy Tech & Cyber Policy Specialists',
        'Chemical Engineering & Antwerp Port Logistics',
        'Cloud & Enterprise Software Consultants',
        'Biotechnology & Vaccines Production Scientists',
        'Data Privacy & GDPR Counsel'
      ],
      officialPortalName: 'Belgian Immigration Office (IBZ)',
      officialUrl: 'https://dofi.ibz.be/en'
    }
  ];

  const filteredEuroCountries = europeanCountries.filter(c => {
    const matchesSearch = 
      c.country.toLowerCase().includes(euroSearchQuery.toLowerCase()) ||
      c.visaRoute.toLowerCase().includes(euroSearchQuery.toLowerCase()) ||
      c.shortageOccupations.some(o => o.toLowerCase().includes(euroSearchQuery.toLowerCase()));
    return matchesSearch;
  });

  const activeCountry = europeanCountries.find(c => c.id === selectedEuroCountryId) || europeanCountries[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Banner with Region Switcher */}
      <div className="bg-gradient-to-r from-slate-950 via-amber-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-amber-900/50">
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-amber-400 text-slate-950 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {region === 'germany' ? '🇩🇪 GERMAN CHANCENKARTE & BLUE CARD' : '🇪🇺 PAN-EUROPEAN SHORTAGE SEARCH'}
            </span>
            <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-amber-200">
              Skilled Migration & Employment Rights
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            {region === 'germany'
              ? 'Chancenkarte (Opportunity Card) & Verified Employment Engines'
              : 'Pan-European Skilled Visas & High-Demand Shortage Explorer'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            {region === 'germany'
              ? 'Calculate statutory points under § 20a AufenthG, verify your 20h/week secondary work & 2-week Probearbeit entitlements, and check EU Blue Card salary thresholds.'
              : 'Explore national work visa routes, salary minimums, and high-demand roles across 9 major European economies.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="bg-black/30 p-1 rounded-xl flex items-center border border-white/10 text-xs font-bold">
              <button
                onClick={() => setRegion('germany')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  region === 'germany' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
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
                <span>🇪🇺</span> Europe (9 Countries)
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

      {/* REGION 1: GERMANY (Invokes full specialized ChancenkartePortal) */}
      {region === 'germany' ? (
        <div className="space-y-6">
          <ChancenkartePortal
            applicant={applicant}
            onUpdateQualification={(score) => {
              onUpdateApplicant?.({
                chancenkartePoints: score,
                motivation: {
                  ...applicant?.motivation,
                  pathway: 'CHANCENKARTE',
                }
              });
            }}
          />
        </div>
      ) : (
        /* REGION 2: PAN-EUROPEAN SHORTAGE SEARCH HUB */
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
                  European Single Market Labor Intelligence
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  Interactive Pan-European Skilled Work Visa & Shortage Hub
                </h2>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                9 Accredited Nations
              </span>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search country, visa route (e.g. Zoekjaar, CSEP, Fast-Track), or job skill (e.g. Semiconductor, Cloud, AI, Nursing)..."
                value={euroSearchQuery}
                onChange={(e) => setEuroSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Country Pill Selector */}
            <div className="flex flex-wrap items-center gap-2">
              {filteredEuroCountries.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedEuroCountryId(c.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedEuroCountryId === c.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{c.flag}</span>
                  <span>{c.country}</span>
                </button>
              ))}
            </div>

            {/* Selected Country Detailed Dossier */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{activeCountry.flag}</span>
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900">{activeCountry.country}</h3>
                    <p className="text-xs text-amber-800 font-semibold">{activeCountry.visaRoute}</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  {activeCountry.visaCategory}
                </span>
              </div>

              {/* Core Attributes Grid */}
              <div className="grid md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <Scale className="w-4 h-4 text-amber-600" />
                    <span>Statutory Minimum Salary Threshold:</span>
                  </div>
                  <strong className="text-slate-900 font-mono text-sm block">
                    {activeCountry.statutoryMinSalary}
                  </strong>
                  <span className="text-[10px] text-slate-400 block">Legally mandated threshold for work permit approval.</span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <Globe2 className="w-4 h-4 text-sky-600" />
                    <span>Language Expectations:</span>
                  </div>
                  <span className="text-slate-800 font-medium block">
                    {activeCountry.languageExpectations}
                  </span>
                </div>
              </div>

              {/* Fast-Track Notes */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
                <strong className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  <span>Fast-Track & Permanent Settlement Route:</span>
                </strong>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  {activeCountry.fastTrackNotes}
                </p>
              </div>

              {/* High-Frequency Critical Shortage Roles */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 block">
                  High-Frequency Critical Shortage Roles (*Mangelberufe*):
                </span>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                  {activeCountry.shortageOccupations.map((occ, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="text-slate-700 font-medium text-[11px]">{occ}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct Application Link */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                <span className="text-xs text-slate-500 font-medium">
                  Official Registry: {activeCountry.officialPortalName}
                </span>

                <a
                  href={activeCountry.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>Launch Official Immigration Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
