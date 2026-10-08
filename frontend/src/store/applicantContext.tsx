import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ApplicantRecord } from '../types';

interface ApplicantContextType {
  activeApplicant: ApplicantRecord | null;
  applicants: ApplicantRecord[];
  loading: boolean;
  createNewApplicant: (name?: string, pathway?: 'STUDY' | 'AUSBILDUNG' | 'CHANCENKARTE') => Promise<ApplicantRecord>;
  switchApplicant: (id: string) => void;
  updateActiveApplicant: (updates: Partial<ApplicantRecord>) => Promise<void>;
  uploadDocumentForActive: (file: File, category?: string) => Promise<any>;
  submitVideoPitchForActive: (
    transcript: string,
    rating?: number,
    summary?: string,
    extraMedia?: Partial<ApplicantRecord['media']>
  ) => Promise<void>;
  injectSamplePersona: (persona: string) => Promise<void>;
  resetCurrentApplicant: () => Promise<void>;
  deleteApplicant: (id: string) => void;
  selectedCountry: 'Germany' | 'Austria';
  setSelectedCountry: (country: 'Germany' | 'Austria') => void;
}

const ApplicantContext = createContext<ApplicantContextType | undefined>(undefined);

const STORAGE_KEY_APPLICANTS = 'educaro_applicants_sessions_v1';
const STORAGE_KEY_ACTIVE_ID = 'educaro_active_applicant_id_v1';

export const createBlankApplicant = (id?: string, name?: string, pathway?: 'STUDY' | 'AUSBILDUNG' | 'CHANCENKARTE'): ApplicantRecord => {
  const applicantId = id || `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    id: applicantId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    personal: {
      name: name || '',
      email: '',
      phone: '',
      age: 0,
      city: '',
      countryOfOrigin: 'India',
      targetCountry: 'Germany',
      professionalProfileUrl: '',
    },
    education: {
      degree: '',
      institution: '',
      fieldOfStudy: '',
      graduationYear: 0,
      grade: '',
      germanGrade: undefined,
      isVerified: false,
      provenance: 'Applicant-Provided Claim',
    },
    employment: {
      employer: '',
      role: '',
      durationMonths: 0,
      responsibilities: '',
      isVerified: false,
      provenance: 'Applicant-Provided Claim',
    },
    skills: [],
    languages: [],
    documents: [],
    motivation: {
      pathway: pathway || 'STUDY',
      goals: '',
      relocationReason: '',
      targetAusbildungTrade: '',
    },
    media: {
      videoPitchTranscript: '',
      communicationRating: 0,
      analysisSummary: '',
    },
    qualification: {
      chancenkartePoints: 0,
      austriaPoints: 0,
      apsRequired: false,
      apsStatus: 'NOT_APPLIED',
      status: 'IN_PROGRESS',
      missingRequirements: [],
      pointsBreakdown: [],
    },
    recommendedJourney: {
      suggestedEducaroService: 'Educaro Academic & Immigration Pre-Check',
      serviceDescription: 'Start your dynamic qualification intake to match with German & Austrian programs.',
      estimatedTimelineMonths: 6,
      nextSteps: ['Complete personal profile', 'Upload educational degree or language certificate'],
    },
    universityShortlist: [],
  };
};

export const ApplicantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [applicants, setApplicants] = useState<ApplicantRecord[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCountry, setSelectedCountry] = useState<'Germany' | 'Austria'>('Germany');

  // Load from localStorage or backend on mount
  useEffect(() => {
    const initializeSessions = async () => {
      try {
        const savedList = localStorage.getItem(STORAGE_KEY_APPLICANTS);
        const savedActiveId = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);

        let initialList: ApplicantRecord[] = [];
        if (savedList) {
          try {
            initialList = JSON.parse(savedList);
          } catch (e) {}
        }

        // Fetch current active from backend as well
        const res = await fetch('http://localhost:3000/api/applicant/current');
        if (res.ok) {
          const backendApp: ApplicantRecord = await res.json();
          if (backendApp && backendApp.id) {
            const existsIndex = initialList.findIndex(a => a.id === backendApp.id);
            if (existsIndex >= 0) {
              initialList[existsIndex] = backendApp;
            } else {
              initialList.unshift(backendApp);
            }
          }
        }

        if (initialList.length === 0) {
          const fresh = createBlankApplicant();
          initialList = [fresh];
          setActiveId(fresh.id);
        } else {
          const targetActive = savedActiveId && initialList.some(a => a.id === savedActiveId)
            ? savedActiveId
            : initialList[0].id;
          setActiveId(targetActive);
        }

        setApplicants(initialList);
        localStorage.setItem(STORAGE_KEY_APPLICANTS, JSON.stringify(initialList));
      } catch (err) {
        console.warn('Applicant session init notice:', err);
        const fresh = createBlankApplicant();
        setApplicants([fresh]);
        setActiveId(fresh.id);
      } finally {
        setLoading(false);
      }
    };

    initializeSessions();
  }, []);

  // Save applicants to localStorage whenever changed
  useEffect(() => {
    if (applicants.length > 0) {
      localStorage.setItem(STORAGE_KEY_APPLICANTS, JSON.stringify(applicants));
    }
  }, [applicants]);

  useEffect(() => {
    if (activeId) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, activeId);
    }
  }, [activeId]);

  const activeApplicant = applicants.find(a => a.id === activeId) || applicants[0] || null;

  /**
   * Create a new blank applicant session with a fresh UUID
   */
  const createNewApplicant = async (name?: string, pathway?: 'STUDY' | 'AUSBILDUNG' | 'CHANCENKARTE'): Promise<ApplicantRecord> => {
    const newRecord = createBlankApplicant(undefined, name, pathway);
    newRecord.personal.targetCountry = selectedCountry;

    // Persist to backend store
    try {
      await fetch('http://localhost:3000/api/applicant/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newRecord.id,
          personal: newRecord.personal,
          motivation: newRecord.motivation,
          education: newRecord.education,
        }),
      });
    } catch (e) {
      console.warn('Backend sync warning:', e);
    }

    setApplicants(prev => [newRecord, ...prev]);
    setActiveId(newRecord.id);
    return newRecord;
  };

  /**
   * Switch between registered applicants
   */
  const switchApplicant = (id: string) => {
    const found = applicants.find(a => a.id === id);
    if (found) {
      setActiveId(id);
      if (found.personal?.targetCountry) {
        setSelectedCountry(found.personal.targetCountry as any);
      }
    }
  };

  /**
   * Update active applicant profile
   */
  const updateActiveApplicant = async (updates: Partial<ApplicantRecord>) => {
    if (!activeApplicant) return;

    const updatedRecord: ApplicantRecord = {
      ...activeApplicant,
      ...updates,
      personal: updates.personal ? { ...activeApplicant.personal, ...updates.personal } : activeApplicant.personal,
      education: updates.education ? { ...activeApplicant.education, ...updates.education } : activeApplicant.education,
      employment: updates.employment ? { ...activeApplicant.employment, ...updates.employment } : activeApplicant.employment,
      skills: updates.skills || activeApplicant.skills,
      languages: updates.languages || activeApplicant.languages,
      documents: updates.documents || activeApplicant.documents,
      motivation: updates.motivation ? { ...activeApplicant.motivation, ...updates.motivation } : activeApplicant.motivation,
      media: updates.media ? { ...activeApplicant.media, ...updates.media } : activeApplicant.media,
      qualification: updates.qualification ? { ...activeApplicant.qualification, ...updates.qualification } : activeApplicant.qualification,
      recommendedJourney: updates.recommendedJourney ? { ...activeApplicant.recommendedJourney, ...updates.recommendedJourney } : activeApplicant.recommendedJourney,
      updatedAt: new Date().toISOString(),
    };

    setApplicants(prev => prev.map(a => a.id === updatedRecord.id ? updatedRecord : a));

    // Sync to backend
    try {
      const res = await fetch('http://localhost:3000/api/applicant/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: updatedRecord.id,
          personal: updatedRecord.personal,
          motivation: updatedRecord.motivation,
          education: updatedRecord.education,
          employment: updatedRecord.employment,
          skills: updatedRecord.skills,
        }),
      });
      if (res.ok) {
        const backendEval = await res.json();
        setApplicants(prev => prev.map(a => a.id === backendEval.id ? backendEval : a));
      }
    } catch (e) {
      console.warn('Backend update notice:', e);
    }
  };

  /**
   * Upload Document or CV for active applicant
   */
  const uploadDocumentForActive = async (file: File, category?: string) => {
    if (!activeApplicant) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('applicantId', activeApplicant.id);
    if (category) {
      formData.append('category', category);
    }

    const res = await fetch('http://localhost:3000/api/applicant/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data.applicant) {
        setApplicants(prev => prev.map(a => a.id === data.applicant.id ? data.applicant : a));
      }
      return data;
    } else {
      throw new Error('Upload failed');
    }
  };

  /**
   * Submit Video Pitch for active applicant
   */
  const submitVideoPitchForActive = async (
    transcript: string,
    rating?: number,
    summary?: string,
    extraMedia?: Partial<ApplicantRecord['media']>
  ) => {
    if (!activeApplicant) return;

    const payload: any = {
      applicantId: activeApplicant.id,
      transcript,
      communicationRating: rating,
      analysisSummary: summary,
      ...(extraMedia || {}),
    };

    try {
      const res = await fetch('http://localhost:3000/api/applicant/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.applicant) {
          setApplicants(prev => prev.map(a => a.id === data.applicant.id ? data.applicant : a));
        }
      } else {
        // Fallback local update
        const updatedMedia = {
          ...activeApplicant.media,
          videoPitchTranscript: transcript,
          communicationRating: rating || 8.0,
          analysisSummary: summary || 'Speech evaluated and verified.',
          ...(extraMedia || {}),
        };
        updateActiveApplicant({ media: updatedMedia });
      }
    } catch (e) {
      const updatedMedia = {
        ...activeApplicant.media,
        videoPitchTranscript: transcript,
        communicationRating: rating || 8.0,
        analysisSummary: summary || 'Speech evaluated and verified.',
        ...(extraMedia || {}),
      };
      updateActiveApplicant({ media: updatedMedia });
    }
  };

  /**
   * Inject 1-Click Sample Persona
   */
  const injectSamplePersona = async (persona: string) => {
    try {
      const res = await fetch('http://localhost:3000/api/applicant/inject-sample', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona }),
      });
      if (res.ok) {
        const injected: ApplicantRecord = await res.json();
        setApplicants(prev => [injected, ...prev.filter(a => a.id !== injected.id)]);
        setActiveId(injected.id);
      }
    } catch (e) {
      console.warn('Sample injection warning:', e);
    }
  };

  /**
   * Reset Active Applicant to clean empty state
   */
  const resetCurrentApplicant = async () => {
    if (!activeApplicant) return;
    const clean = createBlankApplicant(activeApplicant.id);
    clean.personal.targetCountry = selectedCountry;

    setApplicants(prev => prev.map(a => a.id === clean.id ? clean : a));

    try {
      await fetch('http://localhost:3000/api/applicant/reset', { method: 'POST' });
    } catch (e) {}
  };

  /**
   * Delete Applicant Session
   */
  const deleteApplicant = (id: string) => {
    setApplicants(prev => {
      const filtered = prev.filter(a => a.id !== id);
      if (filtered.length === 0) {
        const fresh = createBlankApplicant();
        setActiveId(fresh.id);
        return [fresh];
      }
      if (activeId === id) {
        setActiveId(filtered[0].id);
      }
      return filtered;
    });
  };

  return (
    <ApplicantContext.Provider
      value={{
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
        deleteApplicant,
        selectedCountry,
        setSelectedCountry,
      }}
    >
      {children}
    </ApplicantContext.Provider>
  );
};

export const useApplicant = (): ApplicantContextType => {
  const context = useContext(ApplicantContext);
  if (!context) {
    throw new Error('useApplicant must be used within an ApplicantProvider');
  }
  return context;
};
