import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Calculator, 
  Sparkles, 
  Layers,
  GraduationCap,
  Save,
  RotateCcw
} from 'lucide-react';
import { ApplicantRecord, TranscriptModule, EctsAuditResult } from '../types';

interface TranscriptAuditCalculatorProps {
  applicant: ApplicantRecord | null;
  onUpdateModules?: (modules: TranscriptModule[], multiplier: number) => void;
}

// Standard German Master's prerequisites
const PREREQUISITES = {
  'Mathematics & Theory': { required: 18, label: 'Theoretical CS / Mathematics' },
  'Core Systems & Algorithms': { required: 32, label: 'Core Systems & Algorithms' },
  'Applied Electives': { required: 20, label: 'Applied Electives' },
};

// Default CSE curriculum sample
const DEFAULT_BTECH_MODULES: TranscriptModule[] = [
  { id: 'mod_1', courseName: 'Discrete Mathematics & Graph Theory', category: 'Mathematics & Theory', credits: 4, letterGrade: 'A+' },
  { id: 'mod_2', courseName: 'Linear Algebra & Numerical Methods', category: 'Mathematics & Theory', credits: 4, letterGrade: 'A' },
  { id: 'mod_3', courseName: 'Probability & Statistics', category: 'Mathematics & Theory', credits: 4, letterGrade: 'A' },
  { id: 'mod_4', courseName: 'Data Structures & Algorithms', category: 'Core Systems & Algorithms', credits: 4, letterGrade: 'A+' },
  { id: 'mod_5', courseName: 'Design & Analysis of Algorithms', category: 'Core Systems & Algorithms', credits: 4, letterGrade: 'A' },
  { id: 'mod_6', courseName: 'Operating Systems & Architecture', category: 'Core Systems & Algorithms', credits: 4, letterGrade: 'A' },
  { id: 'mod_7', courseName: 'Database Management Systems', category: 'Core Systems & Algorithms', credits: 4, letterGrade: 'A+' },
  { id: 'mod_8', courseName: 'Computer Networks & Protocols', category: 'Core Systems & Algorithms', credits: 4, letterGrade: 'A' },
  { id: 'mod_9', courseName: 'Compiler Design', category: 'Core Systems & Algorithms', credits: 3, letterGrade: 'B+' },
  { id: 'mod_10', courseName: 'Artificial Intelligence & Machine Learning', category: 'Applied Electives', credits: 4, letterGrade: 'A+' },
  { id: 'mod_11', courseName: 'Cloud Computing & Distributed Systems', category: 'Applied Electives', credits: 4, letterGrade: 'A' },
  { id: 'mod_12', courseName: 'Cybersecurity & Cryptography', category: 'Applied Electives', credits: 3, letterGrade: 'A' },
  { id: 'mod_13', courseName: 'Software Engineering & Agile', category: 'Applied Electives', credits: 3, letterGrade: 'A' },
];

const DEFICIT_SAMPLE_MODULES: TranscriptModule[] = [
  { id: 'def_1', courseName: 'Engineering Mathematics I', category: 'Mathematics & Theory', credits: 4, letterGrade: 'B' },
  { id: 'def_2', courseName: 'Data Structures', category: 'Core Systems & Algorithms', credits: 4, letterGrade: 'A' },
  { id: 'def_3', courseName: 'Operating Systems', category: 'Core Systems & Algorithms', credits: 4, letterGrade: 'A' },
  { id: 'def_4', courseName: 'Web Development Lab', category: 'Applied Electives', credits: 3, letterGrade: 'A+' },
  { id: 'def_5', courseName: 'Mobile Application Development', category: 'Applied Electives', credits: 3, letterGrade: 'A' },
];

export const TranscriptAuditCalculator: React.FC<TranscriptAuditCalculatorProps> = ({
  applicant,
  onUpdateModules,
}) => {
  const [multiplier, setMultiplier] = useState<number>(applicant?.ectsMultiplier || 1.5);
  const [modules, setModules] = useState<TranscriptModule[]>(() => {
    if (applicant?.transcriptModules && applicant.transcriptModules.length > 0) {
      return applicant.transcriptModules;
    }
    return DEFAULT_BTECH_MODULES;
  });

  // New course input form state
  const [newCourseName, setNewCourseName] = useState<string>('');
  const [newCategory, setNewCategory] = useState<'Mathematics & Theory' | 'Core Systems & Algorithms' | 'Applied Electives'>('Mathematics & Theory');
  const [newCredits, setNewCredits] = useState<number>(4);
  const [newGrade, setNewGrade] = useState<string>('A');

  // Audit Calculations
  const auditResult: EctsAuditResult = useMemo(() => {
    let totalIndian = 0;
    const catTotals: Record<string, number> = {
      'Mathematics & Theory': 0,
      'Core Systems & Algorithms': 0,
      'Applied Electives': 0,
    };

    modules.forEach((mod) => {
      totalIndian += mod.credits;
      const earned = Math.round(mod.credits * multiplier * 10) / 10;
      if (catTotals[mod.category] !== undefined) {
        catTotals[mod.category] += earned;
      }
    });

    const categories = (Object.keys(PREREQUISITES) as Array<keyof typeof PREREQUISITES>).map((cat) => {
      const required = PREREQUISITES[cat].required;
      const earned = Math.round(catTotals[cat] * 10) / 10;
      const deficit = Math.max(0, Math.round((required - earned) * 10) / 10);
      const isSatisfied = earned >= required;

      let statusText = '';
      if (!isSatisfied) {
        if (cat === 'Mathematics & Theory') {
          statusText = `🔴 DEFICIT: -${deficit} ECTS in Theoretical CS (Requires Bridge Module / University Prep Course)`;
        } else {
          statusText = `🔴 DEFICIT: -${deficit} ECTS in ${cat} (Requires Bridge Module / University Prep Course)`;
        }
      } else {
        statusText = `🟢 Prerequisite met (${earned} / ${required} ECTS)`;
      }

      return {
        category: cat,
        requiredEcts: required,
        earnedEcts: earned,
        deficitEcts: deficit,
        isSatisfied,
        statusText,
      };
    });

    const isAllPrerequisitesMet = categories.every(c => c.isSatisfied);
    const totalEarnedEcts = Math.round(totalIndian * multiplier * 10) / 10;
    const summaryBadge = isAllPrerequisitesMet
      ? '🟢 ECTS PREREQUISITES MET: Eligible for Direct Public Master\'s Admission'
      : '🔴 PREREQUISITE DEFICIT DETECTED: Bridge Module / Prep Course Required';

    return {
      multiplier,
      totalIndianCredits: totalIndian,
      totalEarnedEcts,
      categories,
      isAllPrerequisitesMet,
      summaryBadge,
    };
  }, [modules, multiplier]);

  // Sync to parent/store
  useEffect(() => {
    if (onUpdateModules) {
      onUpdateModules(modules, multiplier);
    }
  }, [modules, multiplier, onUpdateModules]);

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;

    const newModule: TranscriptModule = {
      id: `mod_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      courseName: newCourseName.trim(),
      category: newCategory,
      credits: Number(newCredits) || 3,
      letterGrade: newGrade.trim() || 'A',
    };

    setModules(prev => [...prev, newModule]);
    setNewCourseName('');
    setNewCredits(4);
  };

  const handleDeleteCourse = (id: string) => {
    setModules(prev => prev.filter(m => m.id !== id));
  };

  const handleLoadSample = (sample: 'standard' | 'deficit') => {
    if (sample === 'standard') {
      setModules(DEFAULT_BTECH_MODULES);
    } else {
      setModules(DEFICIT_SAMPLE_MODULES);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Calculator className="w-3.5 h-3.5 text-blue-600" /> KMK & DAAD Curriculum Equivalence Engine
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            Dynamic Transcript & ECTS Credit Deficit Calculator
          </h2>
          <p className="text-xs text-slate-500">
            Live audit of Indian undergraduate credits against German Public University Master's prerequisites (18 ECTS Theory, 32 ECTS Systems, 20 ECTS Applied).
          </p>
        </div>

        {/* Preset Sample Quick-Loads */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleLoadSample('standard')}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5"
            title="Load standard B.Tech Computer Science 4-year curriculum (Prerequisites Met)"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Load B.Tech CSE (Met)</span>
          </button>

          <button
            onClick={() => handleLoadSample('deficit')}
            className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition-all flex items-center gap-1.5"
            title="Load deficient transcript with -6 ECTS gap in Theoretical CS"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Load Deficit Sample</span>
          </button>
        </div>
      </div>

      {/* Live Prerequisite Status Banner */}
      <div className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 ${
        auditResult.isAllPrerequisitesMet
          ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
          : 'bg-rose-50/90 border-rose-300 text-rose-950'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            auditResult.isAllPrerequisitesMet ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}>
            {auditResult.isAllPrerequisitesMet ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div>
            <div className="text-sm font-extrabold tracking-tight">
              {auditResult.summaryBadge}
            </div>
            <div className="text-xs text-slate-600 mt-0.5">
              Audited against TU9 & German public university admission gatekeepers.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-white/90 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase block">Total Indian Credits</span>
            <strong className="text-slate-900 text-sm">{auditResult.totalIndianCredits}</strong>
          </div>
          <div className="bg-white/90 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase block">Total Earned ECTS</span>
            <strong className="text-blue-700 text-sm">{auditResult.totalEarnedEcts} ECTS</strong>
          </div>
        </div>
      </div>

      {/* Credit Multiplier Configurator */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-600" />
            <span className="font-bold text-slate-800">Configurable Credit Multiplier:</span>
            <span className="text-slate-500">1 Indian Credit = <strong>{multiplier} ECTS</strong></span>
          </div>
          <span className="text-[11px] text-slate-500">
            (Standard KMK / DAAD default: 1 credit = 1.5 ECTS)
          </span>
        </div>

        <div className="flex items-center gap-4">
          <input
            type="range"
            min={1.0}
            max={2.0}
            step={0.05}
            value={multiplier}
            onChange={(e) => setMultiplier(parseFloat(e.target.value))}
            className="flex-1 accent-sky-600 cursor-pointer"
          />
          <span className="font-mono font-bold text-xs bg-white px-3 py-1 rounded-lg border border-slate-200 text-slate-800 w-16 text-center">
            {multiplier.toFixed(2)}x
          </span>
        </div>
      </div>

      {/* Category Deficit Bars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {auditResult.categories.map((cat, idx) => {
          const percent = Math.min(100, Math.round((cat.earnedEcts / cat.requiredEcts) * 100));

          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all ${
                cat.isSatisfied
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : 'bg-rose-50/40 border-rose-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-slate-900">{cat.category}</span>
                <span className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded-full ${
                  cat.isSatisfied ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {cat.earnedEcts} / {cat.requiredEcts} ECTS
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full transition-all duration-500 ${
                    cat.isSatisfied ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              {/* Status & Deficit Text */}
              <div className="text-[11px] font-medium">
                {cat.isSatisfied ? (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Prerequisites satisfied (+{(cat.earnedEcts - cat.requiredEcts).toFixed(1)} surplus)</span>
                  </span>
                ) : (
                  <span className="text-rose-700 font-semibold block leading-tight">
                    {cat.statusText}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Live Course Entry Form */}
      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
          Add Custom Course to Transcript
        </span>

        <form onSubmit={handleAddCourse} className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
          <div className="sm:col-span-2">
            <input
              type="text"
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
              placeholder="e.g. Theory of Computation & Automata"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              required
            />
          </div>

          <div>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            >
              <option value="Mathematics & Theory">Mathematics & Theory</option>
              <option value="Core Systems & Algorithms">Core Systems & Algorithms</option>
              <option value="Applied Electives">Applied Electives</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={10}
              value={newCredits}
              onChange={(e) => setNewCredits(Number(e.target.value))}
              placeholder="Credits"
              className="w-20 px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              title="Indian Credits"
            />
            <input
              type="text"
              value={newGrade}
              onChange={(e) => setNewGrade(e.target.value)}
              placeholder="Grade"
              className="w-16 px-2 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-center"
              title="Letter Grade"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Course</span>
            </button>
          </div>
        </form>
      </div>

      {/* Transcript Courses Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Audited Transcript Courses ({modules.length})
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Multiplier: {multiplier}x ECTS
          </span>
        </div>

        <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto text-xs">
          {modules.map((mod) => {
            const calculatedEcts = Math.round(mod.credits * multiplier * 10) / 10;

            return (
              <div key={mod.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 truncate">{mod.courseName}</div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span className="px-2 py-0.2 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px]">
                      {mod.category}
                    </span>
                    <span>Grade: <strong>{mod.letterGrade || 'Pass'}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 font-mono">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Home / ECTS</span>
                    <span className="font-bold text-slate-800">{mod.credits} cr → <strong className="text-blue-700">{calculatedEcts} ECTS</strong></span>
                  </div>

                  <button
                    onClick={() => handleDeleteCourse(mod.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    title="Remove module"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
