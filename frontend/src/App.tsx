import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { PathwaySelector, DegreeLevel, GeographicRegion } from './components/PathwaySelector';
import { UniversityWorkspace } from './components/UniversityWorkspace';
import { AusbildungWorkspace } from './components/AusbildungWorkspace';
import { EmploymentWorkspace } from './components/EmploymentWorkspace';
import { Wizard } from './components/Wizard';
import { UniversityRanker } from './components/UniversityRanker';
import { AusbildungPortal } from './components/AusbildungPortal';
import { ChancenkartePortal } from './components/ChancenkartePortal';
import { InterviewSimulator } from './components/InterviewSimulator';
import { FinancialCalculator } from './components/FinancialCalculator';
import { CounselorCRM } from './components/CounselorCRM';
import { CourseDirectory } from './components/CourseDirectory';
import { CVGenerator } from './components/CVGenerator';
import { PersonalizedBrochure } from './components/PersonalizedBrochure';
import { AnabinAndWerkstudentSuite } from './components/AnabinAndWerkstudentSuite';
import { StudentSuccessAndFundingSuite } from './components/StudentSuccessAndFundingSuite';
import { DatabaseControlBar } from './store/applicantStore';
import { ApplicantProvider, useApplicant } from './store/applicantContext';
import { ApplicantRecord } from './types';
import { FileText, Sparkles, Download } from 'lucide-react';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [cvBrochureSubTab, setCvBrochureSubTab] = useState<'cv' | 'brochure'>('cv');
  const [notification, setNotification] = useState<string | null>(null);

  // Pathway-specific Level and Region State
  const [universityLevel, setUniversityLevel] = useState<DegreeLevel>('masters_phd');
  const [universityRegion, setUniversityRegion] = useState<GeographicRegion>('germany');
  const [ausbildungRegion, setAusbildungRegion] = useState<GeographicRegion>('germany');
  const [employmentRegion, setEmploymentRegion] = useState<GeographicRegion>('germany');

  const {
    activeApplicant,
    applicants,
    loading,
    createNewApplicant,
    switchApplicant,
    updateActiveApplicant,
    uploadDocumentForActive,
    submitVideoPitchForActive,
    injectSamplePersona,
    resetCurrentApplicant,
    selectedCountry,
    setSelectedCountry,
  } = useApplicant();

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleUpdateProfile = async (updates: Partial<ApplicantRecord>) => {
    await updateActiveApplicant(updates);
    showNotification('Profile updated & legal rules evaluated.');
  };

  const handleFileUpload = async (file: File, category?: string) => {
    try {
      const res = await uploadDocumentForActive(file, category);
      if (res?.scanResult) {
        showNotification(`✓ ${res.scanResult.fileName} scanned. Authenticity: ${res.scanResult.authenticityStatus}`);
      } else {
        showNotification('✓ Document uploaded & forensic OCR completed.');
      }
    } catch (e) {
      showNotification('Document upload failed. Please try again.');
    }
  };

  const handleVideoPitchSubmit = async (
    transcript: string, 
    rating?: number, 
    summary?: string, 
    extraMedia?: Partial<ApplicantRecord['media']>
  ) => {
    await submitVideoPitchForActive(transcript, rating, summary, extraMedia);
    showNotification('Multimodal pitch & assessment metrics saved.');
  };

  const handleInjectSample = async (persona: string) => {
    await injectSamplePersona(persona);
    showNotification(`Loaded candidate persona.`);
  };

  const handleReset = async () => {
    await resetCurrentApplicant();
    setActiveTab('landing');
    showNotification('Reset to fresh clean empty applicant intake.');
  };

  const handleCountryToggle = (country: 'Germany' | 'Austria') => {
    setSelectedCountry(country);
    if (activeApplicant) {
      updateActiveApplicant({
        personal: { ...activeApplicant.personal, targetCountry: country },
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans pb-16">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 animate-bounce">
          {notification}
        </div>
      )}

      {/* Sticky Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        applicant={activeApplicant}
        onReset={handleReset}
        onCountryToggle={handleCountryToggle}
        selectedCountry={selectedCountry}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1 pb-12">
        {loading ? (
          <div className="py-24 text-center text-xs text-slate-500">
            Initializing Educaro European AI Gateway Engine...
          </div>
        ) : !activeApplicant ? (
          <div className="py-24 text-center text-xs text-slate-500">
            Connecting to applicant session store...
          </div>
        ) : (
          <>
            {/* 1. Root Pathway Entry Hero & Branching Modal View */}
            {activeTab === 'landing' && (
              <PathwaySelector
                onSelectUniversity={(lvl, reg) => {
                  setUniversityLevel(lvl);
                  setUniversityRegion(reg);
                  setActiveTab('university');
                  handleUpdateProfile({
                    motivation: {
                      ...activeApplicant.motivation,
                      pathway: 'STUDY',
                    }
                  });
                  showNotification(`Opened University Workspace (${lvl === 'undergrad' ? 'Undergrad' : 'Masters'}, ${reg.toUpperCase()})`);
                }}
                onSelectAusbildung={(reg) => {
                  setAusbildungRegion(reg);
                  setActiveTab('ausbildung');
                  handleUpdateProfile({
                    motivation: {
                      ...activeApplicant.motivation,
                      pathway: 'AUSBILDUNG',
                    }
                  });
                  showNotification(`Opened Duale Ausbildung Workspace (${reg.toUpperCase()})`);
                }}
                onSelectEmployment={(reg) => {
                  setEmploymentRegion(reg);
                  setActiveTab('employment');
                  handleUpdateProfile({
                    motivation: {
                      ...activeApplicant.motivation,
                      pathway: 'CHANCENKARTE',
                    }
                  });
                  showNotification(`Opened Direct Employment Workspace (${reg.toUpperCase()})`);
                }}
                onOpenWizard={() => setActiveTab('journey')}
                onOpenMockInterview={() => setActiveTab('interview')}
                onOpenBrochure={() => setActiveTab('cv_brochure')}
                onOpenAnabinCashflow={() => setActiveTab('anabin_cashflow')}
                onOpenDMatFunding={() => setActiveTab('dmat_funding')}
                onResetProfile={handleReset}
              />
            )}

            {/* 2. Higher Education Workspace (Segregated by Level & Region) */}
            {activeTab === 'university' && (
              <UniversityWorkspace
                initialLevel={universityLevel}
                initialRegion={universityRegion}
                applicant={activeApplicant}
                onUpdateApplicant={handleUpdateProfile}
                onBackToSelector={() => setActiveTab('landing')}
              />
            )}

            {/* 3. Duale Ausbildung & Work-Study Vocational Workspace */}
            {activeTab === 'ausbildung' && (
              <AusbildungWorkspace
                initialRegion={ausbildungRegion}
                applicant={activeApplicant}
                onUpdateApplicant={handleUpdateProfile}
                onBackToSelector={() => setActiveTab('landing')}
              />
            )}

            {/* 4. Direct Employment & Pan-European Shortage Search Workspace */}
            {(activeTab === 'employment' || activeTab === 'chancenkarte') && (
              <EmploymentWorkspace
                initialRegion={employmentRegion}
                applicant={activeApplicant}
                onUpdateApplicant={handleUpdateProfile}
                onBackToSelector={() => setActiveTab('landing')}
              />
            )}

            {/* 5. Applicant Journey Wizard (Forensic OCR & Document Verifier) */}
            {activeTab === 'journey' && (
              <Wizard
                applicant={activeApplicant}
                onUpdateProfile={handleUpdateProfile}
                onFileUpload={handleFileUpload}
                onVideoPitchSubmit={handleVideoPitchSubmit}
                selectedCountry={selectedCountry}
              />
            )}

            {/* 6. 420+ Universities & Bavarian GPA Cutoffs */}
            {activeTab === 'ranker' && (
              <UniversityRanker
                applicant={activeApplicant}
                selectedCountry={selectedCountry}
              />
            )}

            {/* 7. Anabin Classifier & Werkstudent Cashflow Simulator */}
            {activeTab === 'anabin_cashflow' && (
              <div className="max-w-7xl mx-auto px-4 py-8">
                <AnabinAndWerkstudentSuite applicant={activeApplicant} />
              </div>
            )}

            {/* 8. dMAT Performance Evaluator & Funding Hub */}
            {activeTab === 'dmat_funding' && (
              <div className="max-w-7xl mx-auto px-4 py-8">
                <StudentSuccessAndFundingSuite applicant={activeApplicant} />
              </div>
            )}

            {/* 9. Contextual Mock Interview Simulator */}
            {activeTab === 'interview' && (
              <div className="max-w-7xl mx-auto px-4 py-8">
                <InterviewSimulator
                  applicant={activeApplicant}
                  selectedCountry={selectedCountry}
                />
              </div>
            )}

            {/* 10. Bilingual CV Generator & Candidate Roadmap Brochure */}
            {activeTab === 'cv_brochure' && (
              <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCvBrochureSubTab('cv')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                        cvBrochureSubTab === 'cv'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>🇩🇪 / 🇬🇧 Bilingual CV (DIN 5008 / Europass)</span>
                    </button>

                    <button
                      onClick={() => setCvBrochureSubTab('brochure')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                        cvBrochureSubTab === 'brochure'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>📄 2-Page Roadmap Prospectus</span>
                    </button>
                  </div>

                  <a
                    href={`http://localhost:3000/api/applicant/${activeApplicant.id}/cv`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    <span>Download Official PDF</span>
                  </a>
                </div>

                {cvBrochureSubTab === 'cv' ? (
                  <CVGenerator applicant={activeApplicant} />
                ) : (
                  <PersonalizedBrochure applicant={activeApplicant} />
                )}
              </div>
            )}

            {/* 11. Financial Calculator */}
            {activeTab === 'calculator' && (
              <FinancialCalculator />
            )}

            {/* 12. Accredited Degree Directory */}
            {activeTab === 'courses' && (
              <div className="max-w-7xl mx-auto px-4 py-8">
                <CourseDirectory applicant={activeApplicant} />
              </div>
            )}

            {/* 13. Counselor CRM */}
            {activeTab === 'crm' && (
              <CounselorCRM
                onSelectApplicant={(selected) => {
                  switchApplicant(selected.id);
                  setActiveTab('journey');
                  showNotification(`Loaded candidate ${selected.personal?.name} into Journey Wizard.`);
                }}
                activeApplicantId={activeApplicant.id}
              />
            )}
          </>
        )}
      </main>

      {/* Persistent Database Control Bar at Bottom */}
      <DatabaseControlBar
        applicant={activeApplicant}
        onResetAll={handleReset}
        onNotify={showNotification}
      />

      {/* Footer with Compliance & Citations */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-bold text-slate-800">Educaro European AI Admissions & Employment Intelligence Platform</div>
            <div className="text-[11px] text-slate-400">
              IMPACTX '26 Hackathon • Agentic AI Track • Educaro Deutschland GmbH
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            Powered by 100% Open-Source Engines: Tesseract.js OCR, WebRTC, Web Audio API, Web Speech API, NestJS, React TypeScript, IndexedDB, Tailwind CSS.
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ApplicantProvider>
      <MainApp />
    </ApplicantProvider>
  );
};

export default App;
