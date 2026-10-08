import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Wizard } from './components/Wizard';
import { UniversityRanker } from './components/UniversityRanker';
import { MockInterview } from './components/MockInterview';
import { FinancialCalculator } from './components/FinancialCalculator';
import { CounselorCRM } from './components/CounselorCRM';
import { CourseDirectory } from './components/CourseDirectory';
import { ApplicantProvider, useApplicant } from './store/applicantContext';
import { ApplicantRecord } from './types';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('journey');
  const [notification, setNotification] = useState<string | null>(null);

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
        showNotification('✓ Document uploaded & scanned.');
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
    showNotification('Reset to fresh clean empty applicant intake.');
  };

  const handleCreateNew = async () => {
    const created = await createNewApplicant();
    showNotification(`Created fresh new applicant intake session.`);
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
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 animate-bounce">
          {notification}
        </div>
      )}

      {/* Sticky Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        applicant={activeApplicant}
        applicants={applicants}
        onSwitchApplicant={switchApplicant}
        onCreateNewApplicant={handleCreateNew}
        onInjectSample={handleInjectSample}
        onReset={handleReset}
        onCountryToggle={handleCountryToggle}
        selectedCountry={selectedCountry}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1 pb-16">
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
            {activeTab === 'journey' && (
              <Wizard
                applicant={activeApplicant}
                onUpdateProfile={handleUpdateProfile}
                onFileUpload={handleFileUpload}
                onVideoPitchSubmit={handleVideoPitchSubmit}
                selectedCountry={selectedCountry}
              />
            )}

            {activeTab === 'ranker' && (
              <UniversityRanker
                applicant={activeApplicant}
                selectedCountry={selectedCountry}
              />
            )}

            {activeTab === 'courses' && (
              <div className="max-w-7xl mx-auto px-4 py-8">
                <CourseDirectory applicant={activeApplicant} />
              </div>
            )}

            {activeTab === 'interview' && (
              <MockInterview
                applicant={activeApplicant}
                selectedCountry={selectedCountry}
              />
            )}

            {activeTab === 'calculator' && (
              <FinancialCalculator />
            )}

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

      {/* Footer with Compliance & Citations */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-bold text-slate-800">Educaro European AI Applicant Journey & Forensic Gateway</div>
            <div className="text-[11px] text-slate-400">
              IMPACTX '26 Hackathon • Agentic AI Track • Educaro Deutschland GmbH
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            Powered by 100% Open-Source Engines: Tesseract.js OCR, WebRTC, Web Audio API, Web Speech API, NestJS, React TypeScript, Prisma ORM, Tailwind CSS.
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
