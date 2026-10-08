import React, { useState, useEffect } from 'react';
import { ApplicantRecord } from '../types';
import { Database, Download, Trash2, Save, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';
import { 
  persistApplicantLocal, 
  saveProfileSnapshot, 
  exportApplicantJson, 
  purgeAllLocalData 
} from '../store/applicantStore';

export interface DatabaseControlBarProps {
  applicant: ApplicantRecord | null;
  onSaveSnapshot?: () => void;
  onResetAll?: () => void;
  onNotify?: (msg: string) => void;
}

/**
 * Persistent Database Control Bar at the bottom of the screen (Req 6, 7)
 */
export const DatabaseControlBar: React.FC<DatabaseControlBarProps> = ({
  applicant,
  onSaveSnapshot,
  onResetAll,
  onNotify,
}) => {
  const [lastSaved, setLastSaved] = useState<string>('Auto-saving live');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Auto-persist on changes
  useEffect(() => {
    if (applicant) {
      persistApplicantLocal(applicant);
      setLastSaved(new Date().toLocaleTimeString());
    }
  }, [applicant]);

  const handleManualSave = async () => {
    if (!applicant) return;
    setIsSaving(true);
    try {
      const res = await saveProfileSnapshot(applicant);
      setSaveSuccess(true);
      setLastSaved(res.timestamp);
      if (onNotify) onNotify(`💾 Profile snapshot created at ${res.timestamp}`);
      if (onSaveSnapshot) onSaveSnapshot();
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    if (!applicant) return;
    exportApplicantJson(applicant);
    if (onNotify) onNotify(`📥 Full candidate audit JSON exported for jury inspection.`);
  };

  const handleReset = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset all candidate intake data? This will purge local storage, IndexedDB caches, and reset to a blank intake.'
    );
    if (!confirmed) return;

    await purgeAllLocalData();
    if (onResetAll) {
      onResetAll();
    }
    if (onNotify) onNotify('🗑️ Local database purged. Returned to clean intake.');
  };

  const candidateDisplayName = applicant?.personal?.name?.trim() || 'Unregistered Intake';

  return (
    <aside 
      aria-label="Database Storage & Compliance Control Bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-700/80 px-4 py-2.5 text-white flex flex-wrap items-center justify-between shadow-2xl gap-3 text-xs"
    >
      {/* Left: DB Status & Live Synchronization Telemetry */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-sky-400" />
            Local Persistent DB
          </span>
        </div>
        <span className="hidden sm:inline-block text-slate-600">|</span>
        <div className="hidden sm:flex items-center gap-1.5 text-slate-400 text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Candidate:</span>
          <strong className="text-slate-200">{candidateDisplayName}</strong>
        </div>
        <span className="hidden md:inline-block text-slate-600">|</span>
        <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-400">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>Last Saved:</span>
          <span className="text-sky-300 font-mono">{lastSaved}</span>
        </div>
      </div>

      {/* Right: Actions (Save Profile, Export JSON, Reset All) */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleManualSave}
          disabled={isSaving}
          className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
            saveSuccess
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 active:scale-95'
          }`}
          title="Save timestamped snapshot to local database"
        >
          {saveSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5 text-sky-400" />
              <span>Save Profile</span>
            </>
          )}
        </button>

        <button
          onClick={handleExport}
          className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
          title="Download full candidate JSON dossier for jury evaluation"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export JSON</span>
        </button>

        <button
          onClick={handleReset}
          className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/80 font-semibold text-xs flex items-center gap-1.5 transition-all active:scale-95"
          title="Purge all local storage and return to blank application"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          <span>Reset / Clear All</span>
        </button>
      </div>
    </aside>
  );
};
