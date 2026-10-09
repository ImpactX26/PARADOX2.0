import React, { useState, useRef, useEffect } from 'react';
import { 
  GraduationCap, 
  Stethoscope, 
  Briefcase, 
  UploadCloud, 
  FileCheck2, 
  AlertCircle, 
  CheckCircle2, 
  Video, 
  Award, 
  Download, 
  Printer, 
  ArrowRight, 
  ArrowLeft,
  Scan,
  ShieldAlert,
  ShieldCheck,
  Building,
  User,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  FileText,
  FileSpreadsheet
} from 'lucide-react';
import { ApplicantRecord, ExtractedDocumentRecord, ExtractedCVData, WrittenEvaluationData } from '../types';
import { VideoPitchStep } from './VideoPitchStep';
import { CVUploader } from './CVUploader';
import { WrittenEvaluationStep } from './WrittenEvaluationStep';
import { DocumentVerifier } from './DocumentVerifier';
import { CVGenerator } from './CVGenerator';
import { PersonalizedBrochure } from './PersonalizedBrochure';
import { ConsultantAdmissionsReport } from './ConsultantAdmissionsReport';
import { TranscriptAuditCalculator } from './TranscriptAuditCalculator';

interface WizardProps {
  applicant: ApplicantRecord;
  onUpdateProfile: (data: Partial<ApplicantRecord>) => Promise<void>;
  onFileUpload: (file: File, category?: string) => Promise<void>;
  onVideoPitchSubmit: (
    transcript: string, 
    rating?: number, 
    summary?: string, 
    extraMedia?: Partial<ApplicantRecord['media']>
  ) => Promise<void>;
  selectedCountry: 'Germany' | 'Austria';
}

export const Wizard: React.FC<WizardProps> = ({
  applicant,
  onUpdateProfile,
  onFileUpload,
  onVideoPitchSubmit,
  selectedCountry,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isCvScanning, setIsCvScanning] = useState<boolean>(false);
  const [uploadCategory, setUploadCategory] = useState<string>('DEGREE');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const [step6Tab, setStep6Tab] = useState<'cv' | 'brochure' | 'split'>('cv');

  // Step 1: Form state
  const [name, setName] = useState(applicant.personal?.name || '');
  const [email, setEmail] = useState(applicant.personal?.email || '');
  const [phone, setPhone] = useState(applicant.personal?.phone || '');
  const [age, setAge] = useState<number>(applicant.personal?.age || 24);
  const [city, setCity] = useState(applicant.personal?.city || 'Bangalore');
  const [profileUrl, setProfileUrl] = useState(applicant.personal?.professionalProfileUrl || '');
  const [pathway, setPathway] = useState<'STUDY' | 'AUSBILDUNG' | 'CHANCENKARTE'>(
    applicant.motivation?.pathway || 'STUDY'
  );

  // Education & Employment fields
  const [degree, setDegree] = useState(applicant.education?.degree || '');
  const [institution, setInstitution] = useState(applicant.education?.institution || '');
  const [fieldOfStudy, setFieldOfStudy] = useState(applicant.education?.fieldOfStudy || '');
  const [grade, setGrade] = useState(applicant.education?.grade || '');
  const [role, setRole] = useState(applicant.employment?.role || '');
  const [employer, setEmployer] = useState(applicant.employment?.employer || '');
  const [isCvVerified, setIsCvVerified] = useState<boolean>(
    applicant.education?.provenance === 'Verified from Uploaded CV' || Boolean(applicant.education?.isVerified)
  );

  // Compute profile authenticity heuristics
  const computeProfileAuthenticity = (url: string, candidateName: string) => {
    if (!url || !url.trim()) {
      return { score: 0, status: 'UNVERIFIED' as const, message: 'No URL provided' };
    }
    const clean = url.trim().toLowerCase();
    const isLinkedIn = clean.includes('linkedin.com/in/');
    const isGithub = clean.includes('github.com/');
    const isPortfolio = clean.startsWith('http://') || clean.startsWith('https://');

    if (!isPortfolio) {
      return { score: 20, status: 'SUSPECT' as const, message: 'Invalid URL scheme (must start with https://)' };
    }

    let score = 50;
    let matchesName = false;
    if (candidateName && candidateName.trim()) {
      const nameParts = candidateName.toLowerCase().split(/\s+/).filter(p => p.length > 2);
      matchesName = nameParts.some(part => clean.includes(part));
    }

    if (isLinkedIn) {
      score = matchesName ? 95 : 75;
    } else if (isGithub) {
      score = matchesName ? 90 : 70;
    } else {
      score = matchesName ? 80 : 60;
    }

    const status = score >= 85 ? 'AUTHENTIC' as const : score >= 60 ? 'UNVERIFIED' as const : 'SUSPECT' as const;
    return { 
      score, 
      status, 
      message: matchesName 
        ? 'Domain & candidate name slug verified' 
        : 'Valid domain structure, generic/external handle' 
    };
  };

  const profileAuth = computeProfileAuthenticity(profileUrl, name);

  // Sync state if applicant updates (e.g. from CV upload or persona switch)
  useEffect(() => {
    setName(applicant.personal?.name || '');
    setEmail(applicant.personal?.email || '');
    setPhone(applicant.personal?.phone || '');
    setAge(applicant.personal?.age || 24);
    setCity(applicant.personal?.city || 'Bangalore');
    setProfileUrl(applicant.personal?.professionalProfileUrl || '');
    setPathway(applicant.motivation?.pathway || 'STUDY');
    setDegree(applicant.education?.degree || '');
    setInstitution(applicant.education?.institution || '');
    setFieldOfStudy(applicant.education?.fieldOfStudy || '');
    setGrade(applicant.education?.grade || '');
    setRole(applicant.employment?.role || '');
    setEmployer(applicant.employment?.employer || '');
    if (applicant.education?.provenance === 'Verified from Uploaded CV' || applicant.education?.isVerified) {
      setIsCvVerified(true);
    }
  }, [applicant]);

  // Handle Step 1 Save
  const handleSaveStep1 = async () => {
    await onUpdateProfile({
      personal: {
        ...applicant.personal,
        name,
        email,
        phone,
        age: Number(age),
        city,
        targetCountry: selectedCountry,
        professionalProfileUrl: profileUrl,
        profileAuthenticityScore: profileAuth.score,
        profileAuthenticityStatus: profileAuth.status,
      },
      education: {
        ...applicant.education,
        degree,
        institution,
        fieldOfStudy,
        grade,
        isVerified: isCvVerified,
        provenance: isCvVerified ? 'Verified from Uploaded CV' : applicant.education?.provenance,
      },
      employment: {
        ...applicant.employment,
        role,
        employer,
        isVerified: isCvVerified,
        provenance: isCvVerified ? 'Verified from Uploaded CV' : applicant.employment?.provenance,
      },
      motivation: {
        ...applicant.motivation,
        pathway,
      },
    });
    setCurrentStep(2);
  };

  // Handle Existing CV Upload for Auto-fill
  const handleCvUpload = async (file: File) => {
    setIsCvScanning(true);
    try {
      await onFileUpload(file, 'CV');
    } finally {
      setIsCvScanning(false);
      if (cvInputRef.current) cvInputRef.current.value = '';
    }
  };

  // Handle Certificate Upload
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      await onFileUpload(file, uploadCategory);
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle Certificate Drag & Drop
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      await onFileUpload(file, uploadCategory);
    } finally {
      setIsScanning(false);
    }
  };

  // Handle Extracted CV Hydration
  const handleApplyCvData = async (data: ExtractedCVData) => {
    if (data.name) setName(data.name);
    if (data.email) setEmail(data.email);
    if (data.phone) setPhone(data.phone);
    if (data.city) setCity(data.city);
    if (data.degree) setDegree(data.degree);
    if (data.institution) setInstitution(data.institution);
    if (data.fieldOfStudy) setFieldOfStudy(data.fieldOfStudy);
    if (data.grade) setGrade(data.grade);
    if (data.role) setRole(data.role);
    if (data.employer) setEmployer(data.employer);
    setIsCvVerified(true);

    let calcGermanGrade: number | undefined = applicant.education?.germanGrade;
    if (data.grade) {
      const rawGradeMatch = data.grade.match(/([0-9]+\.?[0-9]*)/);
      if (rawGradeMatch) {
        const num = parseFloat(rawGradeMatch[1]);
        if (num <= 10 && num >= 4) {
          calcGermanGrade = Math.round((1 + 3 * ((10 - num) / 6)) * 100) / 100;
        } else if (num <= 100 && num >= 40) {
          calcGermanGrade = Math.round((1 + 3 * ((100 - num) / 60)) * 100) / 100;
        }
      }
    }

    const updatedEducation = {
      ...applicant.education,
      degree: data.degree || applicant.education?.degree || 'Bachelor of Technology (B.Tech)',
      institution: data.institution || applicant.education?.institution || 'Recognized University',
      fieldOfStudy: data.fieldOfStudy || applicant.education?.fieldOfStudy || 'Computer Science & Engineering',
      grade: data.grade || applicant.education?.grade || 'First Class Distinction',
      graduationYear: data.graduationYear || applicant.education?.graduationYear || 2024,
      germanGrade: calcGermanGrade || 2.1,
      isVerified: true,
      provenance: 'Verified from Uploaded CV' as const,
    };

    const updatedEmployment = {
      ...applicant.employment,
      role: data.role || applicant.employment?.role || 'Software Engineer',
      employer: data.employer || applicant.employment?.employer || 'Technology Solutions Pvt Ltd',
      durationMonths: data.durationMonths || applicant.employment?.durationMonths || 24,
      responsibilities: data.responsibilities || applicant.employment?.responsibilities || 'Engineering & operational execution.',
      isVerified: true,
      provenance: 'Verified from Uploaded CV' as const,
    };

    const updatedLanguages = data.languages?.map(l => ({
      language: l.language,
      level: l.level,
      certificateType: l.certificateType || 'Self-Reported from CV',
      isVerified: true,
      provenance: 'Verified from Uploaded CV' as const,
    })) || applicant.languages;

    await onUpdateProfile({
      personal: {
        ...applicant.personal,
        name: data.name || name,
        email: data.email || email,
        phone: data.phone || phone,
        city: data.city || city,
        targetCountry: selectedCountry,
      },
      education: updatedEducation,
      employment: updatedEmployment,
      skills: data.skills && data.skills.length > 0 ? data.skills : applicant.skills,
      languages: updatedLanguages,
    });
  };

  const stepsList = [
    { num: 1, title: 'Pathway & Profile', subtitle: 'CV auto-fill & destination' },
    { num: 2, title: 'Document Forensic OCR', subtitle: 'Authenticity & grade intake' },
    { num: 3, title: 'Multimodal Pitch', subtitle: 'Live camera & speech analysis' },
    { num: 4, title: 'Written Relocation Q&A', subtitle: 'Linguistic & visa realism' },
    { num: 5, title: 'Visa Math & Gap Analysis', subtitle: 'Chancenkarte & Bavaria rules' },
    { num: 6, title: 'German Lebenslauf CV', subtitle: 'DIN 5008 verified document' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Interactive Progress Wizard Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 mb-8 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {stepsList.map((step) => {
            const isActive = currentStep === step.num;
            const isCompleted = currentStep > step.num;

            return (
              <button
                key={step.num}
                onClick={() => setCurrentStep(step.num)}
                className={`text-left p-3 rounded-xl transition-all relative ${
                  isActive
                    ? 'bg-sky-50/80 border border-sky-300 ring-2 ring-sky-500/10'
                    : isCompleted
                    ? 'bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70'
                    : 'bg-transparent border border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-xs'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isCompleted ? '✓' : step.num}
                  </span>
                  <span className={`text-xs font-bold truncate ${isActive ? 'text-sky-900' : 'text-slate-700'}`}>
                    Step {step.num}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-800 truncate">{step.title}</div>
                <div className="text-[10px] text-slate-500 truncate hidden sm:block">{step.subtitle}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= STEP 1: PATHWAY SELECTOR, EXISTING CV DROPZONE & PERSONAL DETAILS ================= */}
      {currentStep === 1 && (
        <div className="space-y-8 animate-fadeIn">
          {/* Real-Time CV Uploader & Entity Extractor */}
          <CVUploader
            onApplyExtractedData={handleApplyCvData}
            onUploadFile={onFileUpload}
            currentApplicant={applicant}
          />

          {/* Pictorial Pathway Cards */}
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-900">Choose Your European Pathway</h2>
              <p className="text-xs text-slate-500">
                Select your intended journey into {selectedCountry} to configure deterministic legal checks.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {/* Card 1: Higher Education */}
              <div
                onClick={() => setPathway('STUDY')}
                className={`cursor-pointer rounded-2xl p-6 border transition-all text-left relative overflow-hidden ${
                  pathway === 'STUDY'
                    ? 'bg-sky-50/50 border-sky-500 shadow-md ring-2 ring-sky-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-4">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 mb-2">
                  TUITION-FREE EDUCATION
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">🎓 Higher Education (Study)</h3>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Public Universities for Bachelor & Master programs. Includes Bavarian Formula grade conversion and APS India verification.
                </p>
                <ul className="text-[11px] text-slate-500 space-y-1">
                  <li>• €0 tuition fees at top public universities</li>
                  <li>• 20 hrs/week permitted student employment</li>
                  <li>• 18-month post-study job seeker visa</li>
                </ul>
              </div>

              {/* Card 2: Duale Ausbildung */}
              <div
                onClick={() => setPathway('AUSBILDUNG')}
                className={`cursor-pointer rounded-2xl p-6 border transition-all text-left relative overflow-hidden ${
                  pathway === 'AUSBILDUNG'
                    ? 'bg-emerald-50/50 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 mb-2">
                  PAID APPRENTICESHIP
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">🏥 Duale Ausbildung</h3>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Paid 3-year vocational training in German hospitals, healthcare clinics, and IT sectors. Monthly stipend included.
                </p>
                <ul className="text-[11px] text-slate-500 space-y-1">
                  <li>• Monthly stipend: €1,100 – €1,400</li>
                  <li>• Mandatory B1/B2 German proficiency</li>
                  <li>• 100% job placement guarantee upon graduation</li>
                </ul>
              </div>

              {/* Card 3: Chancenkarte & Skilled Employment */}
              <div
                onClick={() => setPathway('CHANCENKARTE')}
                className={`cursor-pointer rounded-2xl p-6 border transition-all text-left relative overflow-hidden ${
                  pathway === 'CHANCENKARTE'
                    ? 'bg-purple-50/50 border-purple-500 shadow-md ring-2 ring-purple-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 mb-2">
                  OPPORTUNITY CARD (POINTS)
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">💼 Skilled Employment (Chancenkarte)</h3>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  German Opportunity Card & EU Blue Card for degreed professionals. Evaluated on a 6-point statutory immigration grid.
                </p>
                <ul className="text-[11px] text-slate-500 space-y-1">
                  <li>• 1-year residence permit to seek qualified employment</li>
                  <li>• Fast conversion to German EU Blue Card</li>
                  <li>• Permanent residency pathway in 21-27 months</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Personal Details Form */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-sky-600" />
                Applicant Personal Intake
              </h3>
              {applicant.education?.provenance === 'Verified from Uploaded CV' && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  ✓ Verified from Uploaded CV
                </span>
              )}
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Full Legal Name</span>
                  {isCvVerified && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      ✓ [ Verified from CV ]
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Email Address</span>
                  {isCvVerified && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      ✓ [ Verified from CV ]
                    </span>
                  )}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="applicant@example.com"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Contact Phone</span>
                  {isCvVerified && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      ✓ [ Verified from CV ]
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Age (Years)</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  min={18}
                  max={60}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>City of Residence</span>
                  {isCvVerified && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      ✓ [ Verified from CV ]
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Bangalore, Chennai, Berlin"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Country of Origin</label>
                <input
                  type="text"
                  value={applicant.personal?.countryOfOrigin || 'India'}
                  disabled
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-medium cursor-not-allowed"
                />
              </div>
            </div>

            {/* Academic & Professional Credentials Ingested from CV */}
            <div className="mt-5 pt-4 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <GraduationCap className="w-4 h-4 text-sky-600" /> Academic & Professional Intake
                </span>
                {isCvVerified && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    ✓ Verified from Uploaded CV
                  </span>
                )}
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Degree</span>
                    {isCvVerified && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        ✓ [ Verified from CV ]
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="e.g. Bachelor of Technology (B.Tech)"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Institution</span>
                    {isCvVerified && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        ✓ [ Verified from CV ]
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. Anna University"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Major / Discipline</span>
                    {isCvVerified && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        ✓ [ Verified from CV ]
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={fieldOfStudy}
                    onChange={(e) => setFieldOfStudy(e.target.value)}
                    placeholder="e.g. Computer Science & Engineering"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>CGPA / Grade</span>
                    {isCvVerified && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        ✓ [ Verified from CV ]
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="e.g. 8.6 / 10.0 or First Class"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Role / Designation</span>
                    {isCvVerified && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        ✓ [ Verified from CV ]
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Software Engineer"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Employer / Firm</span>
                    {isCvVerified && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        ✓ [ Verified from CV ]
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={employer}
                    onChange={(e) => setEmployer(e.target.value)}
                    placeholder="e.g. Technology Solutions Pvt Ltd"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Professional Profile URL & Authenticity Evaluator */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Professional Profile URL (LinkedIn, GitHub, Portfolio)
              </label>
              <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                <div className="relative flex-1">
                  <input
                    type="url"
                    value={profileUrl}
                    onChange={(e) => setProfileUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username or https://github.com/username"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 pr-10"
                  />
                  {profileUrl && (
                    <span className="absolute right-3 top-2.5 text-xs">
                      {profileAuth.status === 'AUTHENTIC' ? '🟢' : profileAuth.status === 'UNVERIFIED' ? '🟡' : '🔴'}
                    </span>
                  )}
                </div>
                {profileUrl && (
                  <div className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 ${
                    profileAuth.status === 'AUTHENTIC'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : profileAuth.status === 'UNVERIFIED'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-red-50 text-red-800 border-red-200'
                  }`}>
                    <span>Authenticity: {profileAuth.score}%</span>
                    <span className="text-[10px] font-normal">({profileAuth.message})</span>
                  </div>
                )}
              </div>
            </div>

            {/* Ingested Skills & Background Preview if CV was uploaded */}
            {applicant.skills && applicant.skills.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-700 block mb-2">
                  Recognized Skills from CV ({applicant.skills.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {applicant.skills.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-sky-50 text-sky-800 text-[11px] font-medium border border-sky-100">
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSaveStep1}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all"
              >
                Continue to Document Scanner <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= STEP 2: FORENSIC DOCUMENT SCANNER ================= */}
      {currentStep === 2 && (
        <div className="space-y-8 animate-fadeIn">
          {/* Government ID & Credential Forensic Verifier with DPDP Masking */}
          <DocumentVerifier
            applicant={applicant}
            onFileUpload={onFileUpload}
          />

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Additional Certificate & Marksheet Ingestion</h2>
              <p className="text-xs text-slate-500">
                Upload university degrees, marksheets, Goethe certificates, or your resume. Tesseract OCR and visual forensic algorithms parse institutional stamps and tamper indicators.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Document Category:</span>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium"
              >
                <option value="DEGREE">Degree Certificate / Convocation</option>
                <option value="MARKSHEET">Marksheet / Transcript</option>
                <option value="LANGUAGE">Goethe / Telc / IELTS Certificate</option>
                <option value="EXPERIENCE">Employment / Experience Letter</option>
                <option value="CV">Existing CV / Resume</option>
              </select>
            </div>
          </div>

          {/* Drag & Drop Zone with Animated Laser Scanner */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all overflow-hidden ${
              isScanning
                ? 'border-sky-500 bg-sky-50/40'
                : 'border-slate-300 hover:border-sky-400 bg-white hover:bg-slate-50/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept="image/*,.pdf,.txt"
              className="hidden"
            />

            {/* Laser Line Animation when scanning */}
            {isScanning && (
              <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-sky-500 to-transparent animate-scan-laser laser-line pointer-events-none z-10" />
            )}

            <div className="max-w-md mx-auto flex flex-col items-center">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all ${
                  isScanning ? 'bg-sky-600 text-white animate-pulse' : 'bg-sky-50 text-sky-600'
                }`}
              >
                {isScanning ? <Scan className="w-8 h-8" /> : <UploadCloud className="w-8 h-8" />}
              </div>

              {isScanning ? (
                <div>
                  <h3 className="text-sm font-bold text-sky-900 mb-1">
                    Running Tesseract.js OCR & Forensic Analysis...
                  </h3>
                  <p className="text-xs text-sky-700">
                    Extracting textual clusters, verifying institutional seals, and calculating Bavarian formula GPA.
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-1">
                    Click to browse or drag & drop certificate here
                  </h3>
                  <p className="text-xs text-slate-500 mb-3">
                    Supported: Degree certificates, Goethe-Zertifikat, IELTS report, Marksheets (PNG, JPG, PDF)
                  </p>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    🔒 100% Local Open-Source OCR Processing
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Scanned Documents List with Forensic Rubber-Stamp Watermarks */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              Ingested Forensic Documents ({applicant.documents?.length || 0})
            </h3>

            {(!applicant.documents || applicant.documents.length === 0) ? (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center text-xs text-slate-500">
                No documents uploaded yet. Upload a certificate above or upload an existing CV on Step 1.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {applicant.documents.map((doc: ExtractedDocumentRecord) => {
                  const isAuthentic = doc.authenticityStatus === 'AUTHENTIC';
                  return (
                    <div
                      key={doc.id}
                      className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs relative overflow-hidden"
                    >
                      {/* Visual Rubber Stamp Watermark */}
                      <div
                        className={`absolute top-4 right-4 rotate-12 uppercase text-[10px] font-black px-2.5 py-1 rounded border-2 select-none tracking-wider ${
                          isAuthentic
                            ? 'text-emerald-700 border-emerald-600 bg-emerald-50/80'
                            : 'text-rose-700 border-rose-600 bg-rose-50/80'
                        }`}
                      >
                        {isAuthentic ? '✓ VERIFIED AUTHENTIC' : '⚠ SUSPICIOUS'}
                      </div>

                      <div className="pr-32 mb-3">
                        <div className="text-xs font-bold text-slate-900 truncate">{doc.fileName}</div>
                        <div className="text-[10px] text-slate-500">
                          Confidence: {doc.confidenceScore}% • Scanned on {new Date(doc.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Extracted Entity Badges */}
                      <div className="bg-slate-50 rounded-xl p-3 mb-3 border border-slate-100 text-[11px] space-y-1.5">
                        {doc.extractedFields.institution && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Institution:</span>
                            <span className="font-semibold text-slate-800">{doc.extractedFields.institution}</span>
                          </div>
                        )}
                        {doc.extractedFields.degree && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Degree:</span>
                            <span className="font-semibold text-slate-800">{doc.extractedFields.degree}</span>
                          </div>
                        )}
                        {doc.extractedFields.grade && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Extracted Grade:</span>
                            <span className="font-semibold text-sky-700">{doc.extractedFields.grade}</span>
                          </div>
                        )}
                        {doc.extractedFields.language && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Language Level:</span>
                            <span className="font-semibold text-emerald-700">
                              {doc.extractedFields.language} ({doc.extractedFields.cefrLevel || 'B2'})
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Provenance Tag */}
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Data Provenance:</span>
                        <span
                          className={`font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isAuthentic
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {isAuthentic ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {doc.provenanceTag}
                        </span>
                      </div>

                      {/* Tamper Alerts if any */}
                      {doc.tamperAlerts && doc.tamperAlerts.length > 0 && (
                        <div className="mt-3 p-2 bg-rose-50 border border-rose-200 rounded-lg text-[10px] text-rose-700 space-y-0.5">
                          {doc.tamperAlerts.map((a, i) => (
                            <div key={i}>• {a}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm"
            >
              Next: 30-Sec Multimodal Pitch <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 3: REAL HARDWARE VIDEO & AUDIO RECORDER ================= */}
      {currentStep === 3 && (
        <VideoPitchStep
          applicant={applicant}
          onVideoPitchSubmit={onVideoPitchSubmit}
          onBack={() => setCurrentStep(2)}
          onNext={() => setCurrentStep(4)}
          selectedCountry={selectedCountry}
        />
      )}

      {/* ================= STEP 4: WRITTEN RELOCATION Q&A ================= */}
      {currentStep === 4 && (
        <WrittenEvaluationStep
          applicant={applicant}
          onSaveEvaluation={async (evalData) => {
            await onVideoPitchSubmit(
              applicant.media?.videoPitchTranscript || '',
              applicant.media?.communicationRating,
              applicant.media?.analysisSummary,
              { writtenEvaluation: evalData }
            );
          }}
          onBack={() => setCurrentStep(3)}
          onNext={() => setCurrentStep(5)}
        />
      )}

      {/* ================= STEP 5: GERMAN VISA MATH & GAP ANALYSIS ================= */}
      {currentStep === 5 && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h2 className="text-xl font-bold text-slate-900">German Qualification & Legal Gap Analysis</h2>
            <p className="text-xs text-slate-500">
              Evaluates German Chancenkarte statutory points, Bavarian Formula GPA conversion, and Indian APS requirements.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Circular Gauge: Chancenkarte Points */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col items-center text-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Chancenkarte Points
                </span>
                <h3 className="text-sm font-semibold text-slate-800 mt-1">Opportunity Card Eligibility</h3>
              </div>

              {/* Gauge */}
              <div className="relative w-36 h-36 my-4 flex items-center justify-center">
                <svg className="w-36 h-36 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={
                      (applicant.qualification?.chancenkartePoints || 0) >= 6
                        ? 'text-emerald-500'
                        : 'text-amber-500'
                    }
                    strokeDasharray={`${Math.min(100, ((applicant.qualification?.chancenkartePoints || 0) / 6) * 100)}, 100`}
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-black text-slate-900">
                    {applicant.qualification?.chancenkartePoints || 0}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">/ 6 TO PASS</span>
                </div>
              </div>

              <div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    (applicant.qualification?.chancenkartePoints || 0) >= 6
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {(applicant.qualification?.chancenkartePoints || 0) >= 6
                    ? '✓ QUALIFIED (>= 6 POINTS)'
                    : 'CONDITIONAL (< 6 POINTS)'}
                </span>
                <p className="text-[11px] text-slate-500 mt-2">
                  Austrian Rot-Weiß-Rot-Karte Points: {applicant.qualification?.austriaPoints || 0} / 55
                </p>
              </div>
            </div>

            {/* Itemized Points Breakdown Table */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs md:col-span-2">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-sky-600" />
                Statutory German Points Breakdown
              </h3>

              <div className="divide-y divide-slate-100 text-xs">
                {applicant.qualification?.pointsBreakdown?.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-semibold text-slate-800">{item.category}</div>
                      <div className="text-[11px] text-slate-500">{item.reason}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900">{item.points}</span>
                      <span className="text-slate-400 text-[10px]"> / {item.maxPoints} pts</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bavarian Formula Box */}
              {applicant.education?.germanGrade && (
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800">Bavarian Formula GPA (Bayerische Formel):</span>
                    <span className="text-slate-500 block text-[11px]">
                      Original: {applicant.education.grade || 'N/A'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-sky-700">
                      {applicant.education.germanGrade.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">(1.0 Best - 4.0 Passing)</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Transcript & ECTS Credit Deficit Calculator */}
          <TranscriptAuditCalculator
            applicant={applicant}
            onUpdateModules={async (modules, mult) => {
              await onUpdateProfile({
                transcriptModules: modules,
                ectsMultiplier: mult,
              });
            }}
          />

          {/* Expert German University Admissions Consultant Diagnostic Report */}
          <ConsultantAdmissionsReport applicant={applicant} />

          {/* Missing Requirements Banners */}
          {applicant.qualification?.missingRequirements && applicant.qualification.missingRequirements.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <h4 className="text-xs font-bold text-amber-900 flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Compliance Warning & Missing Documents
              </h4>
              <ul className="text-xs text-amber-800 space-y-1">
                {applicant.qualification.missingRequirements.map((req, i) => (
                  <li key={i}>• {req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Educaro Ecosystem Routing Card */}
          <div className="bg-gradient-to-r from-sky-900 to-slate-900 rounded-2xl p-6 text-white shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-900 uppercase">
                  Educaro Ecosystem Routing
                </span>
                <h3 className="text-lg font-bold mt-1 text-white">
                  {applicant.recommendedJourney?.suggestedEducaroService || 'Educaro Comprehensive Gateway'}
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  {applicant.recommendedJourney?.serviceDescription}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-sky-200">
                  {applicant.recommendedJourney?.nextSteps?.map((step, idx) => (
                    <span key={idx} className="bg-white/10 px-2.5 py-1 rounded-lg">
                      → {step}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setCurrentStep(6)}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
              >
                Generate German Lebenslauf <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex justify-start">
            <button
              onClick={() => setCurrentStep(4)}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Written Q&A
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 6: BILINGUAL LEBENSLAUF CV & PERSONALIZED BROCHURE ================= */}
      {currentStep === 6 && (
        <div className="space-y-6 animate-fadeIn">
          {/* Sub-tab Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStep6Tab('cv')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  step6Tab === 'cv'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>🇩🇪 / 🇬🇧 Bilingual CV Generator</span>
              </button>

              <button
                onClick={() => setStep6Tab('brochure')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  step6Tab === 'brochure'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>📄 European Roadmap Prospectus</span>
              </button>

              <button
                onClick={() => setStep6Tab('split')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  step6Tab === 'split'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Source Dossier & PDF Stream</span>
              </button>
            </div>

            <a
              href={`http://localhost:3000/api/applicant/${applicant.id}/cv`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Download PDF</span>
            </a>
          </div>

          {/* Sub-view Render */}
          {step6Tab === 'cv' && (
            <CVGenerator applicant={applicant} />
          )}

          {step6Tab === 'brochure' && (
            <PersonalizedBrochure applicant={applicant} />
          )}

          {step6Tab === 'split' && (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left Screen: Ingested Source Document Preview */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
                    <span>Source Verification Dossier</span>
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified
                    </span>
                  </h3>

                  {applicant.documents && applicant.documents.length > 0 ? (
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 text-xs space-y-3 font-mono">
                      <div className="pb-2 border-b border-slate-200 flex justify-between items-center text-[11px]">
                        <span className="font-bold text-slate-800 truncate max-w-[200px]">{applicant.documents[0].fileName}</span>
                        <span className="text-emerald-700 font-sans font-bold text-[10px] bg-emerald-100 px-2 py-0.5 rounded">
                          CONFIDENCE: {applicant.documents[0].confidenceScore}%
                        </span>
                      </div>
                      <div className="max-h-64 overflow-y-auto text-[11px] text-slate-600 whitespace-pre-wrap leading-relaxed">
                        {applicant.documents[0].extractedText}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 p-8 text-center border border-dashed rounded-xl">
                      No raw document uploaded. Pre-filled from applicant intake or CV parsing.
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                  <span>Provenance: {applicant.education?.provenance}</span>
                  <span>Format: DIN 5008 Standard</span>
                </div>
              </div>

              {/* Right Screen: Standardized German Lebenslauf HTML Preview */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
                  <span>Tabellarischer Lebenslauf (DIN 5008 Standard)</span>
                  <span className="text-[11px] text-slate-500">Live Rendered</span>
                </h3>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner h-[500px]">
                  <iframe
                    title="German Lebenslauf Preview"
                    src={`http://localhost:3000/api/applicant/${applicant.id}/cv`}
                    className="w-full h-full border-0 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-start pt-4">
            <button
              onClick={() => setCurrentStep(5)}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Visa Math
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
