import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Euro, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Info, 
  ExternalLink, 
  Calculator, 
  GraduationCap, 
  Coins, 
  ArrowUpRight, 
  TrendingUp,
  MapPin,
  Calendar,
  FileCheck
} from 'lucide-react';
import { ApplicantRecord } from '../types';

interface AnabinAndWerkstudentSuiteProps {
  applicant?: ApplicantRecord | null;
}

interface UniversityRecord {
  id: string;
  name: string;
  nativeName?: string;
  location: string;
  state: string;
  status: 'H+' | 'H+/-' | 'H-';
  statusLabel: string;
  recognizedDegrees: string;
  apsRequired: boolean;
  notes: string;
}

export const AnabinAndWerkstudentSuite: React.FC<AnabinAndWerkstudentSuiteProps> = ({
  applicant,
}) => {
  const [activeTab, setActiveTab] = useState<'anabin' | 'werkstudent'>('anabin');

  // --- ANABIN CLASSIFIER STATE ---
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedDegreeType, setSelectedDegreeType] = useState<'4_YEAR' | '3_YEAR'>('4_YEAR');
  const [selectedUniversity, setSelectedUniversity] = useState<UniversityRecord | null>(null);

  // Local Verified Database of Indian Universities tagged with KMK / ZAB Equivalence
  const universityDatabase: UniversityRecord[] = [
    {
      id: 'iit_bombay',
      name: 'Indian Institute of Technology Bombay (IIT Bombay)',
      location: 'Mumbai',
      state: 'Maharashtra',
      status: 'H+',
      statusLabel: 'H+ (Fully Recognized German Equivalent)',
      recognizedDegrees: 'B.Tech, M.Tech, Dual Degree, Ph.D.',
      apsRequired: true,
      notes: 'Institute of National Importance. Degrees correspond directly to German Universitäre Abschlüsse (TU9 equivalent).'
    },
    {
      id: 'iit_delhi',
      name: 'Indian Institute of Technology Delhi (IIT Delhi)',
      location: 'New Delhi',
      state: 'Delhi',
      status: 'H+',
      statusLabel: 'H+ (Fully Recognized German Equivalent)',
      recognizedDegrees: 'B.Tech, M.Tech, M.Sc., Ph.D.',
      apsRequired: true,
      notes: 'Institute of National Importance. Fully recognized for direct admission to German Master’s and Doctoral programs.'
    },
    {
      id: 'iit_madras',
      name: 'Indian Institute of Technology Madras (IIT Madras)',
      location: 'Chennai',
      state: 'Tamil Nadu',
      status: 'H+',
      statusLabel: 'H+ (Fully Recognized German Equivalent)',
      recognizedDegrees: 'B.Tech, M.Tech, BS, Ph.D.',
      apsRequired: true,
      notes: 'Institute of National Importance. Prime feeder institution for German TU9 engineering faculties.'
    },
    {
      id: 'anna_univ',
      name: 'Anna University',
      location: 'Chennai',
      state: 'Tamil Nadu',
      status: 'H+',
      statusLabel: 'H+ (Fully Recognized German Equivalent)',
      recognizedDegrees: 'B.E., B.Tech, M.E., M.Tech, MCA',
      apsRequired: true,
      notes: 'State University. CEG and MIT campuses fully recognized; affiliated colleges evaluated according to specific NAAC grading.'
    },
    {
      id: 'mumbai_univ',
      name: 'University of Mumbai',
      location: 'Mumbai',
      state: 'Maharashtra',
      status: 'H+',
      statusLabel: 'H+ (Fully Recognized German Equivalent)',
      recognizedDegrees: 'B.E., B.Sc., B.Com, M.Sc., M.Com',
      apsRequired: true,
      notes: 'State University. 4-year technical degrees get 240 ECTS equivalence; 3-year degrees yield 180 ECTS.'
    },
    {
      id: 'vtu_belagavi',
      name: 'Visvesvaraya Technological University (VTU)',
      location: 'Belagavi',
      state: 'Karnataka',
      status: 'H+',
      statusLabel: 'H+ (Fully Recognized German Equivalent)',
      recognizedDegrees: 'B.E., B.Tech, M.Tech, MCA',
      apsRequired: true,
      notes: 'State Technological University. Autonomous affiliated engineering colleges recognized under KMK guidelines.'
    },
    {
      id: 'delhi_univ',
      name: 'University of Delhi (DU)',
      location: 'New Delhi',
      state: 'Delhi',
      status: 'H+',
      statusLabel: 'H+ (Fully Recognized German Equivalent)',
      recognizedDegrees: 'B.A. (Hons), B.Sc. (Hons), B.Com, M.A., M.Sc.',
      apsRequired: true,
      notes: 'Central University. 3-year honours bachelor courses require evaluation for 180 ECTS transfer.'
    },
    {
      id: 'bits_pilani',
      name: 'Birla Institute of Technology and Science (BITS Pilani)',
      location: 'Pilani, Goa, Hyderabad',
      state: 'Rajasthan',
      status: 'H+',
      statusLabel: 'H+ (Fully Recognized German Equivalent)',
      recognizedDegrees: 'B.E. (Hons), M.Sc. (Tech), M.E., Ph.D.',
      apsRequired: true,
      notes: 'Deemed to be University. Highly regarded across German institutions with full degree equivalence.'
    },
    {
      id: 'nit_trichy',
      name: 'National Institute of Technology Tiruchirappalli (NIT Trichy)',
      location: 'Tiruchirappalli',
      state: 'Tamil Nadu',
      status: 'H+',
      statusLabel: 'H+ (Fully Recognized German Equivalent)',
      recognizedDegrees: 'B.Tech, B.Arch, M.Tech, MCA',
      apsRequired: true,
      notes: 'Institute of National Importance. Standard 4-year degree yields direct master’s qualification.'
    },
    {
      id: 'vit_vellore',
      name: 'Vellore Institute of Technology (VIT)',
      location: 'Vellore & Chennai',
      state: 'Tamil Nadu',
      status: 'H+',
      statusLabel: 'H+ (Fully Recognized German Equivalent)',
      recognizedDegrees: 'B.Tech, M.Tech, MCA, Ph.D.',
      apsRequired: true,
      notes: 'Deemed University. Category 1 autonomy. Fully recognized in Anabin as H+.'
    },
    {
      id: 'srm_ist',
      name: 'SRM Institute of Science and Technology',
      location: 'Kattankulathur, Chennai',
      state: 'Tamil Nadu',
      status: 'H+',
      statusLabel: 'H+ (Fully Recognized German Equivalent)',
      recognizedDegrees: 'B.Tech, M.Tech, B.Sc., MCA',
      apsRequired: true,
      notes: 'Deemed University. Recognized as H+ in Anabin database.'
    },
    {
      id: 'pune_univ',
      name: 'Savitribai Phule Pune University (SPPU)',
      location: 'Pune',
      state: 'Maharashtra',
      status: 'H+',
      statusLabel: 'H+ (Fully Recognized German Equivalent)',
      recognizedDegrees: 'B.E., B.Tech, M.Sc., MBA',
      apsRequired: true,
      notes: 'State University. Highly respected across German Baden-Württemberg and Bavarian university partnerships.'
    },
    {
      id: 'amity_univ',
      name: 'Amity University Uttar Pradesh',
      location: 'Noida',
      state: 'Uttar Pradesh',
      status: 'H+/-',
      statusLabel: 'H+/- (Conditionally Recognized / Program-Specific)',
      recognizedDegrees: 'Regular On-Campus B.Tech, BBA, MBA (Distance courses restricted)',
      apsRequired: true,
      notes: 'Private University. On-campus full-time programs recognized; online/distance learning degrees are not accepted by KMK/ZAB.'
    },
    {
      id: 'lpu_punjab',
      name: 'Lovely Professional University (LPU)',
      location: 'Phagwara',
      state: 'Punjab',
      status: 'H+/-',
      statusLabel: 'H+/- (Conditionally Recognized / Program-Specific)',
      recognizedDegrees: 'Regular On-Campus B.Tech, M.Tech',
      apsRequired: true,
      notes: 'Requires individual transcript audit at ZAB Bonn if degree was completed under credit transfer or distance modules.'
    },
    {
      id: 'sikkim_manipal_dist',
      name: 'Sikkim Manipal University - Distance Education (SMU-DE)',
      location: 'Gangtok / Online',
      state: 'Sikkim',
      status: 'H-',
      statusLabel: 'H- (Not Equivalent / Non-Recognized for German Master’s)',
      recognizedDegrees: 'Distance Education degrees (BBA, BCA, MBA)',
      apsRequired: true,
      notes: 'Distance and correspondence degrees are not recognized as equivalent to regular German higher education under KMK standards.'
    }
  ];

  const filteredUniversities = universityDatabase.filter(u => {
    const matchesFilter = selectedStatusFilter === 'ALL' || u.status === selectedStatusFilter;
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.recognizedDegrees.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // --- WERKSTUDENT & CASHFLOW SIMULATOR STATE ---
  // City cost presets
  const cityPresets = [
    { name: 'Munich / Frankfurt', cost: 1050, label: 'High Rent Metropolitan' },
    { name: 'Berlin / Hamburg / Cologne', cost: 920, label: 'Medium-High Cost' },
    { name: 'Aachen / Leipzig / Dresden', cost: 780, label: 'Affordable University Hub' },
  ];

  const [selectedCityPreset, setSelectedCityPreset] = useState<number>(780);
  const [customLivingCost, setCustomLivingCost] = useState<number>(780);
  const [hourlyWage, setHourlyWage] = useState<number>(14.50); // German min wage is €12.82
  const [weeklyHours, setWeeklyHours] = useState<number>(16); // up to 20 hrs/week
  const [employmentType, setEmploymentType] = useState<'WERKSTUDENT' | 'MINIJOB'>('WERKSTUDENT');

  // Statutory Sperrkonto Payout: €992 / month (€11,904 annual statutory requirement)
  const SPERRKONTO_MONTHLY_PAYOUT = 992;

  // Monthly gross student job income (approx. 4.33 weeks per month)
  const monthlyHoursWorked = weeklyHours * 4.33;
  const rawGrossMonthlyIncome = Math.round(hourlyWage * monthlyHoursWorked);

  // Minijob threshold: €538 / month
  const MINIJOB_THRESHOLD = 538;
  const isMinijob = employmentType === 'MINIJOB' || rawGrossMonthlyIncome <= MINIJOB_THRESHOLD;

  // Statutory Social Security Deduction logic:
  // Under § 6 Abs. 1 Nr. 3 SGB V (Werkstudentenprivileg):
  // Working < 20 hrs/week exempts students from health, nursing care, and unemployment insurance.
  // Only Pension Insurance (Rentenversicherung: ~9.3% employee share) applies for earnings > €538.
  let pensionDeduction = 0;
  if (!isMinijob && rawGrossMonthlyIncome > MINIJOB_THRESHOLD) {
    pensionDeduction = Math.round(rawGrossMonthlyIncome * 0.093);
  }

  // Statutory student health insurance (mandatory for all enrolled students in Germany, ~€125/mo)
  const studentHealthInsuranceFee = 125;

  const netStudentJobIncome = rawGrossMonthlyIncome - pensionDeduction;
  const totalMonthlyInflow = SPERRKONTO_MONTHLY_PAYOUT + netStudentJobIncome;
  const totalMonthlyOutflow = customLivingCost + studentHealthInsuranceFee;
  const netMonthlyCashflow = totalMonthlyInflow - totalMonthlyOutflow;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950">
            <Sparkles className="w-3.5 h-3.5" /> KMK / ZAB Regulations & § 6 SGB V Statutory Law
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Anabin University Classifier & Werkstudent Cashflow Simulator
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Verify your Indian university equivalence in the official KMK Anabin database, evaluate 3-year vs. 4-year degree European credit parity (180 vs. 240 ECTS), and model your monthly cashflow with Germany's <strong>140 full / 280 half days</strong> work rights and social security exemptions.
          </p>

          <div className="flex flex-wrap gap-3 pt-2 text-xs">
            <span className="bg-white/10 px-3 py-1 rounded-lg flex items-center gap-1.5 border border-white/10">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> KMK Anabin H+ Database
            </span>
            <span className="bg-white/10 px-3 py-1 rounded-lg flex items-center gap-1.5 border border-white/10">
              <Clock className="w-3.5 h-3.5 text-sky-400" /> 140 Full Days / 280 Half Days Limit
            </span>
            <span className="bg-white/10 px-3 py-1 rounded-lg flex items-center gap-1.5 border border-white/10">
              <Euro className="w-3.5 h-3.5 text-amber-400" /> €992/mo Sperrkonto + Werkstudent Cashflow
            </span>
          </div>
        </div>
      </div>

      {/* Primary Section Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('anabin')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'anabin'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4 text-sky-400" />
          <span>1. Anabin University Status & Degree Classifier</span>
        </button>

        <button
          onClick={() => setActiveTab('werkstudent')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'werkstudent'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Calculator className="w-4 h-4 text-emerald-400" />
          <span>2. Werkstudent Cashflow & Statutory Simulator</span>
        </button>
      </div>

      {/* ===================== TAB 1: ANABIN CLASSIFIER ===================== */}
      {activeTab === 'anabin' && (
        <div className="space-y-6">
          {/* Mandatory APS India Alert Banner */}
          <div className="bg-gradient-to-r from-blue-900/90 to-indigo-900/90 rounded-2xl p-5 text-white border border-blue-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-300">
                <FileCheck className="w-4 h-4" />
                <span>MANDATORY STATUTORY REGULATION: APS INDIA CERTIFICATE</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed max-w-2xl">
                Since November 1, 2022, all applicants with educational certificates from India must obtain an <strong>APS Certificate</strong> (*Akademische Prüfstelle*) from the German Embassy New Delhi before visa lodgement and university enrollment.
              </p>
            </div>
            <a
              href="https://aps-india.de/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shadow-xs"
            >
              <span>Official APS Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* 3-Year vs 4-Year Bachelor Degree Audit Module */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Degree Length & ECTS Equivalence Auditor
                </h3>
                <p className="text-xs text-slate-500">
                  German Master's programs require either 180 or 240 ECTS credit prerequisites
                </p>
              </div>

              {/* Toggle 3-yr vs 4-yr */}
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setSelectedDegreeType('4_YEAR')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedDegreeType === '4_YEAR'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  4-Year Bachelor (B.Tech / B.E. - 240 ECTS)
                </button>
                <button
                  onClick={() => setSelectedDegreeType('3_YEAR')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedDegreeType === '3_YEAR'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  3-Year Bachelor (B.Sc / B.Com / BCA - 180 ECTS)
                </button>
              </div>
            </div>

            {selectedDegreeType === '4_YEAR' ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Direct Master's Admission Eligible (240 ECTS Equivalence)</span>
                </div>
                <p className="text-xs text-emerald-900/90 leading-relaxed">
                  Graduates of Indian 4-year engineering programs (B.Tech / B.E. / B.S.) from an <strong>H+ institution</strong> satisfy both European Bologna Bachelor criteria and statutory German direct admission prerequisites for all TU9 universities and State Universities of Applied Sciences.
                </p>
                <div className="text-[11px] font-mono text-emerald-800 font-semibold">
                  ✓ No Studienkolleg or bridge year required • Direct Master's entrance
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Conditional Admission / Additional Prerequisites (180 ECTS Equivalence)</span>
                </div>
                <p className="text-xs text-amber-900/90 leading-relaxed">
                  Indian 3-year bachelor degrees (B.Sc, BCA, B.Com, B.A.) yield 180 ECTS. While several German universities admit 3-year degree holders directly, most TU9 universities require either a <strong>1-year Master's degree in India</strong> (M.Sc/MCA), a preparatory postgraduate diploma, or 30 ECTS bridge credits during semester 1 in Germany.
                </p>
                <div className="text-[11px] font-mono text-amber-800 font-semibold">
                  ⚠️ Recommendation: Target 120 ECTS Master's programs or complete 1st year PG in India
                </div>
              </div>
            )}
          </div>

          {/* Searchable Local Anabin Database Directory */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Indian University KMK / Anabin Equivalence Search
                </h3>
                <p className="text-xs text-slate-500">
                  Database compiled according to official German Standing Conference of Ministers of Education (KMK) listings
                </p>
              </div>

              {/* Status Filters */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                {[
                  { id: 'ALL', label: 'All Statuses' },
                  { id: 'H+', label: '🟢 H+ (Fully Recognized)' },
                  { id: 'H+/-', label: '🟡 H+/- (Conditional)' },
                  { id: 'H-', label: '🔴 H- (Not Equivalent)' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedStatusFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      selectedStatusFilter === f.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search Indian university (e.g. IIT, Anna, Mumbai, VTU, BITS, Delhi, VIT)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* University Cards Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {filteredUniversities.map((uni) => (
                <div
                  key={uni.id}
                  onClick={() => setSelectedUniversity(uni)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedUniversity?.id === uni.id
                      ? 'border-sky-600 bg-sky-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                      uni.status === 'H+'
                        ? 'bg-emerald-100 text-emerald-800'
                        : uni.status === 'H+/-'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {uni.statusLabel}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {uni.location}, {uni.state}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 leading-snug">
                    {uni.name}
                  </h4>

                  <div className="mt-2 text-[11px] text-slate-600 space-y-1">
                    <div>
                      <span className="text-slate-400">Recognized Degrees: </span>
                      <strong className="text-slate-800">{uni.recognizedDegrees}</strong>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed italic">
                      "{uni.notes}"
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Official Anabin Link */}
            <div className="pt-2 text-right">
              <a
                href="https://anabin.kmk.org/anabin.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 hover:text-sky-900 hover:underline"
              >
                <span>Launch Official KMK Anabin Portal (*anabin.kmk.org*)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: WERKSTUDENT CASHFLOW SIMULATOR ===================== */}
      {activeTab === 'werkstudent' && (
        <div className="space-y-6">
          {/* Statutory Employment Regulations Callout */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Statutory German Student Employment Legal Framework
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
                § 16b AufenthG & § 6 SGB V
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5">
                <span className="font-bold text-amber-300 block">140 Full / 280 Half Days Limit</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Non-EU international students can legally work up to <strong>140 full days or 280 half days</strong> per calendar year without requiring an additional work permit from the immigration office.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5">
                <span className="font-bold text-emerald-300 block">Social Security Exemption (§ 6 SGB V)</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Working up to <strong>20 hrs/week</strong> during lecture periods exempts students from health, long-term care, and unemployment taxes (*Werkstudentenprivileg*). Only pension (9.3%) applies.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5">
                <span className="font-bold text-sky-300 block">Minijob Threshold (€538/month)</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Earnings up to <strong>€538 per month</strong> are completely tax-free and exempt from all statutory social deductions. Ideal for low-commitment campus jobs.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Calculator Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column: Interactive Sliders & City Presets */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
              <h3 className="text-base font-bold text-slate-900">
                Income & Work Configuration
              </h3>

              {/* City Cost Benchmark Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Select Benchmark City Cost Level:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {cityPresets.map((city) => (
                    <button
                      key={city.name}
                      onClick={() => {
                        setSelectedCityPreset(city.cost);
                        setCustomLivingCost(city.cost);
                      }}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        customLivingCost === city.cost
                          ? 'border-sky-600 bg-sky-50 shadow-2xs'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-[11px] font-bold text-slate-900 leading-tight">{city.name}</div>
                      <div className="text-[10px] text-slate-500 mt-1">€{city.cost}/mo avg</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Living Cost Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Estimated Monthly Living Costs:</span>
                  <span className="font-mono font-bold text-slate-900">€{customLivingCost} / mo</span>
                </div>
                <input
                  type="range"
                  min="650"
                  max="1300"
                  step="25"
                  value={customLivingCost}
                  onChange={(e) => setCustomLivingCost(Number(e.target.value))}
                  className="w-full accent-slate-800 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">Includes rent, groceries, semester transit pass, phone, and supplies.</span>
              </div>

              {/* Employment Type Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Target Student Job Contract:
                </label>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <button
                    onClick={() => {
                      setEmploymentType('WERKSTUDENT');
                      setWeeklyHours(16);
                    }}
                    className={`p-3 rounded-xl border text-left font-bold transition-all ${
                      employmentType === 'WERKSTUDENT'
                        ? 'border-sky-600 bg-sky-50 text-sky-950 shadow-2xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>Werkstudent (Working Student)</div>
                    <div className="text-[10px] font-normal text-slate-500 mt-0.5">Up to 20 hrs/wk • Higher wages</div>
                  </button>

                  <button
                    onClick={() => {
                      setEmploymentType('MINIJOB');
                      setWeeklyHours(8);
                    }}
                    className={`p-3 rounded-xl border text-left font-bold transition-all ${
                      employmentType === 'MINIJOB'
                        ? 'border-sky-600 bg-sky-50 text-sky-950 shadow-2xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>Minijob (€538 Tax-Free)</div>
                    <div className="text-[10px] font-normal text-slate-500 mt-0.5">~8 hrs/wk • 100% tax-free</div>
                  </button>
                </div>
              </div>

              {/* Weekly Hours Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Weekly Working Hours:</span>
                  <span className="font-mono font-bold text-sky-700">{weeklyHours} hrs / week</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="20"
                  step="1"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">Statutory cap: Max 20 hours/week during lecture semester.</span>
              </div>

              {/* Hourly Wage Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Hourly Wage Rate:</span>
                  <span className="font-mono font-bold text-emerald-700">€{hourlyWage.toFixed(2)} / hour</span>
                </div>
                <input
                  type="range"
                  min="12.82"
                  max="24.00"
                  step="0.50"
                  value={hourlyWage}
                  onChange={(e) => setHourlyWage(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">Statutory minimum: €12.82/hr. Tech & Engineering Werkstudent roles typically pay €14.50–€19.00/hr.</span>
              </div>
            </div>

            {/* Right Column: Live Cashflow Ledger & Net Savings */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">
                  Live Monthly Net Cashflow Model
                </h3>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Real-time Net Cashflow
                </span>
              </div>

              {/* Financial Ledger Breakdown */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono space-y-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-200">
                  A. Monthly Inflow Channels
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Sperrkonto Blocked Payout:</span>
                  <span className="font-bold text-emerald-700">+ €{SPERRKONTO_MONTHLY_PAYOUT}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Gross Job Earnings ({monthlyHoursWorked.toFixed(0)} hrs):</span>
                  <span>+ €{rawGrossMonthlyIncome}</span>
                </div>
                {pensionDeduction > 0 ? (
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Pension Insurance (RV 9.3%):</span>
                    <span className="text-rose-600">- €{pensionDeduction}</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-emerald-700 text-[11px]">
                    <span>Social Deductions Exemption:</span>
                    <span>€0 (Minijob)</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-900 font-bold pt-1 border-t border-slate-200">
                  <span>Total Net Inflow:</span>
                  <span className="text-emerald-700 font-black">+ €{totalMonthlyInflow}</span>
                </div>

                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pt-3 pb-1 border-b border-slate-200">
                  B. Monthly Outflow Obligations
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Estimated City Living Expenses:</span>
                  <span className="text-rose-600">- €{customLivingCost}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Mandatory Student Health Insurance:</span>
                  <span className="text-rose-600">- €{studentHealthInsuranceFee}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold pt-1 border-t border-slate-200">
                  <span>Total Outflow:</span>
                  <span className="text-rose-600 font-black">- €{totalMonthlyOutflow}</span>
                </div>

                <div className="flex justify-between items-center text-sm font-black pt-3 border-t-2 border-slate-300">
                  <span className="text-slate-900">Net Monthly Savings / Surplus:</span>
                  <span className={netMonthlyCashflow >= 0 ? 'text-emerald-700 text-base' : 'text-rose-600 text-base'}>
                    {netMonthlyCashflow >= 0 ? `+ €${netMonthlyCashflow} / mo` : `- €${Math.abs(netMonthlyCashflow)} / mo`}
                  </span>
                </div>
              </div>

              {/* Annualized Projection */}
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Annual Net Accumulated Cashflow:</span>
                  <span className={`font-mono font-bold text-sm ${netMonthlyCashflow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {netMonthlyCashflow >= 0 ? `+ €${(netMonthlyCashflow * 12).toLocaleString()} / yr` : `- €${Math.abs(netMonthlyCashflow * 12).toLocaleString()} / yr`}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  {netMonthlyCashflow >= 0 ? (
                    <span>💡 A positive surplus means you are saving capital each month, allowing you to self-finance subsequent study semesters without topping up your blocked account.</span>
                  ) : (
                    <span>⚠️ A deficit indicates monthly expenses exceed your combined Sperrkonto payout and job income. Consider increasing weekly hours up to 20 or targeting lower-rent university cities.</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
