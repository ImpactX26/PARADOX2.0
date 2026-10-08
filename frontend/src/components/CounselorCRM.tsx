import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  AlertCircle, 
  FileText, 
  CheckCircle2, 
  Search, 
  Eye, 
  Sparkles, 
  Mic, 
  Activity, 
  Award,
  Video,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';
import { ApplicantRecord } from '../types';

interface CounselorCRMProps {
  onSelectApplicant: (applicant: ApplicantRecord) => void;
  activeApplicantId: string;
}

export const CounselorCRM: React.FC<CounselorCRMProps> = ({
  onSelectApplicant,
  activeApplicantId,
}) => {
  const [allApplicants, setAllApplicants] = useState<ApplicantRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedDetailsApp, setSelectedDetailsApp] = useState<ApplicantRecord | null>(null);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/applicant/all');
      if (res.ok) {
        const data = await res.json();
        setAllApplicants(data || []);
      }
    } catch (err) {
      console.error('Error fetching CRM applicants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const filtered = allApplicants.filter(app => {
    const nameMatch = (app.personal?.name || '').toLowerCase().includes(search.toLowerCase());
    const degreeMatch = (app.education?.degree || '').toLowerCase().includes(search.toLowerCase());
    const pathwayMatch = (app.motivation?.pathway || '').toLowerCase().includes(search.toLowerCase());
    return nameMatch || degreeMatch || pathwayMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Educaro Case Management & Integrity Monitor
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Real-Time Multi-Applicant Auditing</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Counselor CRM & Applicant Dossier Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Audit forensic document validation, live AI proctoring integrity scores, German CEFR speech analysis, and written visa readiness before official consulate submission.
          </p>
        </div>

        <button
          onClick={fetchApplicants}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
        >
          <Activity className="w-3.5 h-3.5 text-sky-400" /> Refresh Dossiers
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate by name, degree, or pathway..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-800">{filtered.length}</span> candidates in pipeline
        </div>
      </div>

      {/* Applicants Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading candidate pipeline...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No applicant dossiers registered yet. Use the 1-Click Jury quick buttons to load candidates.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Candidate & Pathway</th>
                  <th className="py-3 px-4">German GPA & Academics</th>
                  <th className="py-3 px-4">AI Proctoring Trust</th>
                  <th className="py-3 px-4">German CEFR & Speech</th>
                  <th className="py-3 px-4">Written Q&A Coherence</th>
                  <th className="py-3 px-4">Visa Qualification</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((app) => {
                  const isActive = app.id === activeApplicantId;
                  const verifiedDocs = app.documents?.filter(d => d.authenticityStatus === 'AUTHENTIC').length || 0;
                  const isQualified = app.qualification?.status === 'QUALIFIED';

                  // Proctoring stats
                  const trustScore = app.media?.integrityTrustScore ?? 100;
                  const infractions = app.media?.proctoringSummary?.infractionsCount ?? 0;
                  const yawPitchStatus = app.media?.proctoringSummary?.yawPitchStatus || 'Center';
                  const voiceSyncStatus = app.media?.proctoringSummary?.voiceSyncStatus || 'Synced';

                  // CEFR stats
                  const cefrLevel = app.media?.germanCefrAssessment?.assessedLevel || 'Unassessed';
                  const cefrWpm = app.media?.germanCefrAssessment?.spokenFluencyWpm || 0;

                  // Written Q&A stats
                  const writtenScore = app.media?.writtenEvaluation?.overallCoherenceScore;

                  return (
                    <tr key={app.id} className={`hover:bg-slate-50/70 transition-colors ${isActive ? 'bg-sky-50/40' : ''}`}>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>{app.personal?.name || 'Unnamed Candidate'}</span>
                          {isActive && (
                            <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 text-[9px] font-black uppercase">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-normal">
                          {app.personal?.email || 'No email'} • {app.personal?.city || 'India'}
                        </div>
                        <div className="mt-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200/60">
                            {app.motivation?.pathway || 'STUDY'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 truncate max-w-[180px]">
                          {app.education?.degree || 'Degree not uploaded'}
                        </div>
                        <div className="text-[11px] text-sky-700 font-bold mt-0.5">
                          {app.education?.germanGrade
                            ? `Bavarian GPA: ${app.education.germanGrade.toFixed(2)}`
                            : `Original: ${app.education?.grade || 'N/A'}`}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {verifiedDocs}/{app.documents?.length || 0} Docs Verified
                        </div>
                      </td>

                      {/* Proctoring Trust Score */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                              trustScore >= 85
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : trustScore >= 60
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}
                          >
                            {trustScore}%
                          </div>
                          <div>
                            <div className="font-bold text-[11px] flex items-center gap-1">
                              {trustScore >= 85 ? (
                                <span className="text-emerald-700 flex items-center gap-0.5">
                                  <ShieldCheck className="w-3 h-3" /> High Trust
                                </span>
                              ) : (
                                <span className="text-amber-700 flex items-center gap-0.5">
                                  <ShieldAlert className="w-3 h-3" /> Flagged
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {infractions} infractions • Angle: {yawPitchStatus} • Voice: {voiceSyncStatus}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* German CEFR Assessment */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-md font-black text-xs ${
                              cefrLevel === 'B2' || cefrLevel === 'C1'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : cefrLevel === 'B1'
                                ? 'bg-sky-100 text-sky-800 border border-sky-200'
                                : cefrLevel === 'A2'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {cefrLevel}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {cefrWpm > 0 ? `${cefrWpm} WPM` : 'Audio Recorded'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px] mt-0.5">
                          {app.media?.germanCefrAssessment?.grammaticalComplexity != null
                            ? `Grammar: ${app.media.germanCefrAssessment.grammaticalComplexity}%`
                            : 'Speech Engine Ready'}
                        </div>
                      </td>

                      {/* Written Q&A Coherence */}
                      <td className="py-3.5 px-4">
                        {writtenScore != null ? (
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`font-black text-xs ${
                                  writtenScore >= 70 ? 'text-emerald-700' : 'text-amber-700'
                                }`}
                              >
                                {writtenScore}% Coherence
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {app.media?.writtenEvaluation?.motivationScore != null
                                ? `Motivation: ${app.media.writtenEvaluation.motivationScore}%`
                                : '3 Questions Evaluated'}
                            </div>
                          </div>
                        ) : (
                          <div className="text-slate-400 text-[11px]">Pending Step 4</div>
                        )}
                      </td>

                      {/* Visa Qualification */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isQualified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {app.qualification?.status || 'IN_PROGRESS'}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Chancenkarte: {app.qualification?.chancenkartePoints || 0} / 6 pts
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedDetailsApp(app)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs inline-flex items-center gap-1"
                          title="View complete candidate dossier modal"
                        >
                          <FileText className="w-3 h-3 text-slate-500" /> Audit
                        </button>
                        <button
                          onClick={() => onSelectApplicant(app)}
                          className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs inline-flex items-center gap-1 shadow-2xs"
                        >
                          <Eye className="w-3 h-3" /> Load Journey
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Candidate Audit Modal */}
      {selectedDetailsApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                  Full Compliance Audit Dossier
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  {selectedDetailsApp.personal?.name} • {selectedDetailsApp.motivation?.pathway}
                </h2>
                <p className="text-xs text-slate-500">
                  ID: {selectedDetailsApp.id} • Registered from {selectedDetailsApp.personal?.city || 'India'}
                </p>
              </div>
              <button
                onClick={() => setSelectedDetailsApp(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Grid of Key Verification Pillars */}
            <div className="grid sm:grid-cols-3 gap-4">
              {/* Pillar 1: AI Proctoring */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Proctoring Trust</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {selectedDetailsApp.media?.integrityTrustScore ?? 100}%
                </div>
                <div className="text-[11px] text-slate-600 space-y-0.5">
                  <div>Angle Check: {selectedDetailsApp.media?.proctoringSummary?.yawPitchStatus || 'Center (Verified)'}</div>
                  <div>Voice Sync: {selectedDetailsApp.media?.proctoringSummary?.voiceSyncStatus || 'Synced (Verified)'}</div>
                  <div>Flagged Events: {selectedDetailsApp.media?.proctoringSummary?.infractionsCount ?? 0}</div>
                </div>
              </div>

              {/* Pillar 2: German CEFR Voice */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>German CEFR</span>
                  <Mic className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-black text-indigo-700">
                  {selectedDetailsApp.media?.germanCefrAssessment?.assessedLevel || 'Pending'}
                </div>
                <div className="text-[11px] text-slate-600 space-y-0.5">
                  <div>Fluency Cadence: {selectedDetailsApp.media?.germanCefrAssessment?.spokenFluencyWpm || 0} WPM</div>
                  <div>Vocabulary TTR: {selectedDetailsApp.media?.germanCefrAssessment?.typeTokenRatio || 0}</div>
                  <div>Complexity: {selectedDetailsApp.media?.germanCefrAssessment?.grammaticalComplexity || 0}%</div>
                </div>
              </div>

              {/* Pillar 3: Written Q&A */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Written Readiness</span>
                  <FileText className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-700">
                  {selectedDetailsApp.media?.writtenEvaluation?.overallCoherenceScore != null
                    ? `${selectedDetailsApp.media.writtenEvaluation.overallCoherenceScore}%`
                    : 'Pending'}
                </div>
                <div className="text-[11px] text-slate-600 space-y-0.5">
                  <div>Motivation: {selectedDetailsApp.media?.writtenEvaluation?.motivationScore ?? 'N/A'}%</div>
                  <div>Readability: {selectedDetailsApp.media?.writtenEvaluation?.lixIndex ?? 'N/A'} LIX</div>
                  <div>Key Terms: {selectedDetailsApp.media?.writtenEvaluation?.detectedKeywords?.length || 0} detected</div>
                </div>
              </div>
            </div>

            {/* Extracted Profile Details */}
            <div className="space-y-2 text-xs">
              <h3 className="font-bold text-slate-900">Academic & Work Profile</h3>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 grid sm:grid-cols-2 gap-3 text-slate-700">
                <div><strong>Degree:</strong> {selectedDetailsApp.education?.degree || 'N/A'}</div>
                <div><strong>University:</strong> {selectedDetailsApp.education?.institution || 'N/A'}</div>
                <div><strong>Bavarian Formula GPA:</strong> {selectedDetailsApp.education?.germanGrade?.toFixed(2) || 'N/A'}</div>
                <div><strong>Graduation:</strong> {selectedDetailsApp.education?.graduationYear || 'N/A'}</div>
                <div><strong>Experience:</strong> {selectedDetailsApp.employment?.role} ({selectedDetailsApp.employment?.durationMonths || 0} mos)</div>
                <div><strong>Employer:</strong> {selectedDetailsApp.employment?.employer || 'N/A'}</div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <button
                onClick={() => setSelectedDetailsApp(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700"
              >
                Close Audit
              </button>
              <button
                onClick={() => {
                  onSelectApplicant(selectedDetailsApp);
                  setSelectedDetailsApp(null);
                }}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold"
              >
                Load into Active Journey
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
