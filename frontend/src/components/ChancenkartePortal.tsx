import React, { useState } from 'react';
import { 
  Briefcase, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Euro, 
  ShieldCheck, 
  Sparkles, 
  HelpCircle, 
  Calendar, 
  User, 
  Globe2, 
  ArrowRight,
  TrendingUp,
  FileCheck2
} from 'lucide-react';
import { ApplicantRecord } from '../types';

interface ChancenkartePortalProps {
  applicant: ApplicantRecord | null;
  onUpdateQualification?: (score: number) => void;
}

export const ChancenkartePortal: React.FC<ChancenkartePortalProps> = ({
  applicant,
  onUpdateQualification,
}) => {
  // Configurable Criteria States
  const [hasRecognizedDegree, setHasRecognizedDegree] = useState<boolean>(
    Boolean(applicant?.education?.degree && applicant.education.isVerified) || true
  );
  const [workExperienceYears, setWorkExperienceYears] = useState<number>(
    applicant?.employment?.durationMonths ? Math.round(applicant.employment.durationMonths / 12) : 3
  );
  const [germanLevel, setGermanLevel] = useState<string>(
    applicant?.languages?.find(l => l.language.toLowerCase().includes('german'))?.level || 'A2'
  );
  const [hasEnglishC1, setHasEnglishC1] = useState<boolean>(true);
  const [age, setAge] = useState<number>(applicant?.personal?.age || 26);
  const [isShortageOccupation, setIsShortageOccupation] = useState<boolean>(true);
  const [hasPreviousStayInGermany, setHasPreviousStayInGermany] = useState<boolean>(false);

  // EU Blue Card Salary Checker State
  const [offeredSalaryEuro, setOfferedSalaryEuro] = useState<number>(48000);
  const [isBottleneckOccupation, setIsBottleneckOccupation] = useState<boolean>(true);

  // 1. Calculate Points
  // Degree: 4 pts if recognized via Anabin H+
  const degreePoints = hasRecognizedDegree ? 4 : 0;

  // Work experience: 3 pts for >= 5 yrs, 2 pts for 2-5 yrs, 0 for < 2 yrs
  let expPoints = 0;
  if (workExperienceYears >= 5) expPoints = 3;
  else if (workExperienceYears >= 2) expPoints = 2;

  // Language: 3 pts for B2, 2 pts for B1, 1 pt for A2 (or English C1)
  let langPoints = 0;
  if (['B2', 'C1', 'C2', 'Fluent'].includes(germanLevel)) {
    langPoints = 3;
  } else if (germanLevel === 'B1') {
    langPoints = 2;
  } else if (germanLevel === 'A2' || hasEnglishC1) {
    langPoints = 1;
  }

  // Age: 2 pts under 35; 1 pt for 35-40; 0 for > 40
  let agePoints = 0;
  if (age < 35 && age > 0) agePoints = 2;
  else if (age >= 35 && age <= 40) agePoints = 1;

  // Shortage occupation: 1 pt
  const shortagePoints = isShortageOccupation ? 1 : 0;

  // Previous stay: 1 pt
  const stayPoints = hasPreviousStayInGermany ? 1 : 0;

  const totalPoints = degreePoints + expPoints + langPoints + agePoints + shortagePoints + stayPoints;
  const isQualified = totalPoints >= 6;

  // 2. EU Blue Card Thresholds
  const BLUE_CARD_GENERAL_THRESHOLD = 45300;
  const BLUE_CARD_BOTTLENECK_THRESHOLD = 41041;
  const requiredThreshold = isBottleneckOccupation ? BLUE_CARD_BOTTLENECK_THRESHOLD : BLUE_CARD_GENERAL_THRESHOLD;
  const qualifiesForBlueCard = offeredSalaryEuro >= requiredThreshold;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950">
            <Sparkles className="w-3.5 h-3.5" /> AufenthG § 20a • Chancenkarte
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            German Opportunity Card (Chancenkarte) & EU Blue Card Simulator
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Germany's legal points-based immigration system allows qualified professionals to search for employment in Germany for up to 12 months with 20 hrs/week secondary trial work permissions. You need <strong>6 points</strong> to qualify.
          </p>

          <div className="flex flex-wrap gap-3 pt-2 text-xs">
            <span className="bg-white/10 px-3 py-1 rounded-lg flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Minimum Pass Score: 6 Points
            </span>
            <span className="bg-white/10 px-3 py-1 rounded-lg flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 12 Months Job Search Visa
            </span>
            <span className="bg-white/10 px-3 py-1 rounded-lg flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 20 hrs/wk Part-Time Permitted
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: 6-Point Gauge & Interactive Scorecard */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Points Criteria Inputs */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
            <h2 className="text-base font-bold text-slate-900 flex items-center justify-between">
              <span>Interactive Qualification Criteria</span>
              <span className="text-xs font-normal text-slate-500">Official Federal Gazette Standards</span>
            </h2>

            {/* Criteria 1: Degree */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-sky-600" />
                  <span>1. University Degree Recognition (Anabin H+)</span>
                </div>
                <span className="font-bold font-mono text-xs text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full">
                  +{degreePoints} / 4 Pts
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Foreign university degree fully or conditionally equivalent to a German Bachelor's/Master's degree.
              </p>
              <div className="flex gap-3 pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="radio"
                    name="degreeRadio"
                    checked={hasRecognizedDegree}
                    onChange={() => setHasRecognizedDegree(true)}
                    className="accent-sky-600"
                  />
                  <span>Recognized Degree (Anabin H+ or ZAB Statement) (+4 Pts)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="radio"
                    name="degreeRadio"
                    checked={!hasRecognizedDegree}
                    onChange={() => setHasRecognizedDegree(false)}
                    className="accent-sky-600"
                  />
                  <span>Non-Recognized (0 Pts)</span>
                </label>
              </div>
            </div>

            {/* Criteria 2: Experience */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-sky-600" />
                  <span>2. Professional Work Experience (in relevant field)</span>
                </div>
                <span className="font-bold font-mono text-xs text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full">
                  +{expPoints} / 3 Pts
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Selected Experience: <strong className="text-slate-900">{workExperienceYears} Years</strong></span>
                  <span className="text-[11px] text-slate-400">5+ yrs = 3 pts | 2-5 yrs = 2 pts | &lt;2 yrs = 0 pts</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  value={workExperienceYears}
                  onChange={(e) => setWorkExperienceYears(Number(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Criteria 3: Languages */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <Globe2 className="w-4 h-4 text-sky-600" />
                  <span>3. Language Competencies (German & English)</span>
                </div>
                <span className="font-bold font-mono text-xs text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full">
                  +{langPoints} / 3 Pts
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] text-slate-500 font-bold block mb-1">German CEFR Level:</label>
                  <select
                    value={germanLevel}
                    onChange={(e) => setGermanLevel(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium"
                  >
                    <option value="None">None / Below A2 (0 Pts)</option>
                    <option value="A2">German A2 (+1 Pt)</option>
                    <option value="B1">German B1 (+2 Pts)</option>
                    <option value="B2">German B2 or higher (+3 Pts)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-bold block mb-1">English Proficiency:</label>
                  <label className="flex items-center gap-2 p-2 bg-white border border-slate-300 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasEnglishC1}
                      onChange={(e) => setHasEnglishC1(e.target.checked)}
                      className="accent-sky-600"
                    />
                    <span>English C1 (IELTS 7.0+ / TOEFL 95+)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Criteria 4: Age */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-sky-600" />
                  <span>4. Applicant Age</span>
                </div>
                <span className="font-bold font-mono text-xs text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full">
                  +{agePoints} / 2 Pts
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Current Age: <strong className="text-slate-900">{age || 25} Years</strong></span>
                  <span className="text-[11px] text-slate-400">&lt;35 yrs = 2 pts | 35-40 yrs = 1 pt | &gt;40 yrs = 0 pts</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="50"
                  value={age || 25}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Criteria 5 & 6: Bonus Points */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">5. Shortage Occupation</span>
                  <span className="font-bold font-mono text-xs text-sky-700">+{shortagePoints} Pt</span>
                </div>
                <p className="text-[11px] text-slate-500">STEM, Informatics, Healthcare, Engineering fields</p>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={isShortageOccupation}
                    onChange={(e) => setIsShortageOccupation(e.target.checked)}
                    className="accent-sky-600"
                  />
                  <span>Matches Bottleneck List (*Engpassberufe*)</span>
                </label>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">6. Previous Stay in Germany</span>
                  <span className="font-bold font-mono text-xs text-sky-700">+{stayPoints} Pt</span>
                </div>
                <p className="text-[11px] text-slate-500">Lived 6+ continuous months in Germany in last 5 yrs</p>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={hasPreviousStayInGermany}
                    onChange={(e) => setHasPreviousStayInGermany(e.target.checked)}
                    className="accent-sky-600"
                  />
                  <span>Previous Verified German Stay</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Live 6-Point Gauge & Blue Card Threshold Checker */}
        <div className="space-y-5">
          {/* 6-Point Gauge Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">
                Chancenkarte Points Gauge
              </span>
              <Award className="w-5 h-5 text-purple-600" />
            </div>

            <div className="text-center py-2">
              <div className="text-5xl font-black tracking-tight text-slate-900">
                {totalPoints} <span className="text-xl text-slate-400 font-semibold">/ 6 pts</span>
              </div>
              <div className="mt-2">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                  isQualified
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                }`}>
                  {isQualified ? '🟢 QUALIFIED: Meets 6-Point Threshold' : '🔴 POINTS DEFICIT: Need at least 6 Points'}
                </span>
              </div>
            </div>

            {/* Scorecard Breakdown */}
            <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between"><span>Degree Recognition:</span><strong>+{degreePoints}</strong></div>
              <div className="flex justify-between"><span>Work Experience:</span><strong>+{expPoints}</strong></div>
              <div className="flex justify-between"><span>Language Mastery:</span><strong>+{langPoints}</strong></div>
              <div className="flex justify-between"><span>Age Criteria:</span><strong>+{agePoints}</strong></div>
              <div className="flex justify-between"><span>Shortage Occupation:</span><strong>+{shortagePoints}</strong></div>
              <div className="flex justify-between"><span>Prior Stay in DE:</span><strong>+{stayPoints}</strong></div>
              <div className="flex justify-between pt-1 border-t border-slate-200 font-black text-slate-900">
                <span>Total Score:</span><span>{totalPoints} pts</span>
              </div>
            </div>

            {!isQualified && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 leading-snug">
                <strong>Bridge the Gap:</strong> Upgrading German from A2 to B1 gains +1 pt. Gaining 5+ years verified experience adds +1 pt.
              </div>
            )}
          </div>

          {/* EU Blue Card Salary Threshold Checker */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider block">AufenthG § 18g</span>
                <h3 className="text-sm font-bold text-slate-900">EU Blue Card Salary Checker</h3>
              </div>
              <Euro className="w-5 h-5 text-sky-600" />
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-500 font-bold block mb-1">Annual Gross Salary Offer:</label>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-slate-900">€{offeredSalaryEuro.toLocaleString()}</span>
                  <span className="text-[11px] text-slate-400">/ year</span>
                </div>
                <input
                  type="range"
                  min="35000"
                  max="75000"
                  step="1000"
                  value={offeredSalaryEuro}
                  onChange={(e) => setOfferedSalaryEuro(Number(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer mt-1"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={isBottleneckOccupation}
                  onChange={(e) => setIsBottleneckOccupation(e.target.checked)}
                  className="accent-sky-600"
                />
                <span>MINT / IT / Healthcare Bottleneck Role</span>
              </label>

              <div className="bg-slate-50 rounded-xl p-3 font-mono text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span>Required Threshold:</span>
                  <strong>€{requiredThreshold.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Candidate Salary Offer:</span>
                  <strong className={qualifiesForBlueCard ? 'text-emerald-700' : 'text-rose-600'}>
                    €{offeredSalaryEuro.toLocaleString()}
                  </strong>
                </div>
              </div>

              <div className={`p-3 rounded-xl border text-[11px] font-bold ${
                qualifiesForBlueCard
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}>
                {qualifiesForBlueCard ? (
                  <span>✓ QUALIFIES FOR EU BLUE CARD: Permanent residency possible in 21 months with B1 German!</span>
                ) : (
                  <span>⚠️ Below Blue Card statutory threshold by €{(requiredThreshold - offeredSalaryEuro).toLocaleString()}.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
