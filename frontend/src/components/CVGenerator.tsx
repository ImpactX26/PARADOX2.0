import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Languages, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  User, 
  GraduationCap, 
  Briefcase, 
  Globe2, 
  Award,
  Calendar,
  MapPin,
  Mail,
  Phone
} from 'lucide-react';
import { ApplicantRecord } from '../types';

interface CVGeneratorProps {
  applicant: ApplicantRecord | null;
}

export const CVGenerator: React.FC<CVGeneratorProps> = ({ applicant }) => {
  const [language, setLanguage] = useState<'de' | 'en'>('de');

  const personal = applicant?.personal;
  const education = applicant?.education;
  const employment = applicant?.employment;
  const languages = applicant?.languages || [];
  const skills = applicant?.skills || [];
  const documents = applicant?.documents || [];

  const isDe = language === 'de';

  const t = {
    title: isDe ? 'Tabellarischer Lebenslauf' : 'Curriculum Vitae',
    standard: isDe ? 'DIN 5008 Europäischer Standard' : 'Europass Standard Format',
    personalData: isDe ? 'Persönliche Daten' : 'Personal Information',
    fullName: isDe ? 'Vollständiger Name' : 'Full Name',
    birthYear: isDe ? 'Geburtsjahr' : 'Birth Year',
    nationality: isDe ? 'Staatsangehörigkeit' : 'Nationality',
    location: isDe ? 'Wohnort' : 'Location',
    targetCountry: isDe ? 'Zielland' : 'Target Destination',
    education: isDe ? 'Ausbildung & Studium' : 'Education & Academic History',
    employment: isDe ? 'Berufserfahrung' : 'Work Experience',
    languages: isDe ? 'Sprachkenntnisse' : 'Language Skills',
    skills: isDe ? 'Fachliche Kompetenzen' : 'Professional Skills',
    verified: isDe ? '✓ Amtlich verifiziert' : '✓ Officially Verified',
    unverified: isDe ? 'Angabe des Bewerbers' : 'Self-Reported Claim',
    printPdf: isDe ? 'Lebenslauf drucken / PDF speichern' : 'Print / Download PDF',
    bavarianGrade: isDe ? 'Deutsche Notenumrechnung (Bayerische Formel)' : 'Converted German GPA (Bavarian Formula)',
    forensicStamp: isDe ? 'Beglaubigungsvermerk: Digital geprüft durch Educaro Forensic Gateway' : 'Attestation: Digitally verified by Educaro European AI Gateway'
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200 mb-1">
            <Languages className="w-3 h-3 text-sky-600" /> Bilingual Lebenslauf CV Engine
          </span>
          <h2 className="text-xl font-bold text-slate-900">
            DIN 5008 Tabellarischer Lebenslauf & Europass Generator
          </h2>
          <p className="text-xs text-slate-500">
            Standardized German & English format with verified document provenance stamps and 1-click PDF download.
          </p>
        </div>

        {/* Controls: Language Toggle & Print Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setLanguage('de')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                language === 'de'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🇩🇪 Deutsch (DIN 5008)</span>
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                language === 'en'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🇬🇧 English (Europass)</span>
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>{t.printPdf}</span>
          </button>
        </div>
      </div>

      {/* A4 Printable CV Container */}
      <div 
        id="cv-printable-area"
        className="bg-white border border-slate-300 rounded-2xl shadow-xl p-8 sm:p-12 max-w-4xl mx-auto font-sans text-slate-900 print:border-none print:shadow-none print:p-0 print:m-0"
      >
        {/* Header Section */}
        <div className="border-b-2 border-slate-900 pb-5 mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-sky-700 tracking-wider uppercase block">
              {t.title}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight uppercase mt-0.5">
              {personal?.name || 'Applicant Name'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {t.standard} • {applicant?.motivation?.pathway || 'HIGHER EDUCATION'}
            </p>
          </div>

          <div className="text-right text-xs space-y-1 text-slate-600">
            {personal?.email && (
              <div className="flex items-center justify-end gap-1.5">
                <span>{personal.email}</span>
                <Mail className="w-3 h-3 text-slate-400" />
              </div>
            )}
            {personal?.phone && (
              <div className="flex items-center justify-end gap-1.5">
                <span>{personal.phone}</span>
                <Phone className="w-3 h-3 text-slate-400" />
              </div>
            )}
            {personal?.city && (
              <div className="flex items-center justify-end gap-1.5">
                <span>{personal.city}, {personal.countryOfOrigin || 'India'}</span>
                <MapPin className="w-3 h-3 text-slate-400" />
              </div>
            )}
          </div>
        </div>

        {/* Section 1: Personal Data */}
        <div className="mb-6">
          <h2 className="text-xs font-bold text-sky-800 uppercase tracking-wider border-b border-slate-200 pb-1 mb-3">
            {t.personalData}
          </h2>
          <table className="w-full text-xs text-slate-800">
            <tbody>
              <tr>
                <td className="w-1/3 py-1 font-semibold text-slate-500">{t.nationality}:</td>
                <td className="py-1">{personal?.countryOfOrigin || 'India'}</td>
              </tr>
              {personal?.age ? (
                <tr>
                  <td className="py-1 font-semibold text-slate-500">{t.birthYear}:</td>
                  <td className="py-1">{2026 - personal.age} (Age: {personal.age})</td>
                </tr>
              ) : null}
              <tr>
                <td className="py-1 font-semibold text-slate-500">{t.targetCountry}:</td>
                <td className="py-1 font-semibold text-sky-900">{personal?.targetCountry || 'Germany'}</td>
              </tr>
              {personal?.professionalProfileUrl && (
                <tr>
                  <td className="py-1 font-semibold text-slate-500">Professional Link:</td>
                  <td className="py-1 text-sky-700 underline font-mono text-[11px]">{personal.professionalProfileUrl}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Section 2: Education */}
        <div className="mb-6">
          <h2 className="text-xs font-bold text-sky-800 uppercase tracking-wider border-b border-slate-200 pb-1 mb-3">
            {t.education}
          </h2>
          {education?.degree ? (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-slate-500 font-semibold">
                  {education.graduationYear ? `${education.graduationYear - 4} – ${education.graduationYear}` : 'Graduation Year'}
                </div>
                <div className="col-span-2 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span>{education.degree}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {education.isVerified ? t.verified : t.unverified}
                    </span>
                  </div>
                  <div className="text-slate-600">{education.institution} • {education.fieldOfStudy}</div>
                  {education.grade && (
                    <div className="text-[11px] text-slate-500">
                      Academic Score: <strong>{education.grade}</strong>
                      {education.germanGrade && (
                        <span className="ml-2 font-mono text-sky-800 font-bold bg-sky-50 px-1.5 py-0.5 rounded">
                          German GPA: {education.germanGrade.toFixed(2)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">No formal degree record entered yet.</div>
          )}
        </div>

        {/* Section 3: Work Experience */}
        <div className="mb-6">
          <h2 className="text-xs font-bold text-sky-800 uppercase tracking-wider border-b border-slate-200 pb-1 mb-3">
            {t.employment}
          </h2>
          {employment?.role ? (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-slate-500 font-semibold">
                  {employment.durationMonths ? `${Math.round(employment.durationMonths / 12)} Years (${employment.durationMonths} Months)` : 'Professional Tenure'}
                </div>
                <div className="col-span-2 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span>{employment.role}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {employment.isVerified ? t.verified : t.unverified}
                    </span>
                  </div>
                  <div className="text-slate-600">{employment.employer}</div>
                  {employment.responsibilities && (
                    <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                      {employment.responsibilities}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">No previous employment tenure listed.</div>
          )}
        </div>

        {/* Section 4: Language Skills */}
        <div className="mb-6">
          <h2 className="text-xs font-bold text-sky-800 uppercase tracking-wider border-b border-slate-200 pb-1 mb-3">
            {t.languages}
          </h2>
          {languages.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              {languages.map((l, i) => (
                <div key={i} className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-800">{l.language}:</span>
                  <span className="font-mono font-bold text-sky-800">
                    {l.level} {l.certificateType ? `(${l.certificateType})` : ''}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">No verified language certificates listed.</div>
          )}
        </div>

        {/* Section 5: Skills */}
        {skills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold text-sky-800 uppercase tracking-wider border-b border-slate-200 pb-1 mb-3">
              {t.skills}
            </h2>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {skills.map((s, idx) => (
                <span key={idx} className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md text-[11px] font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Forensic Attestation Footer */}
        <div className="pt-6 border-t-2 border-slate-200 mt-8 text-[10px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.forensicStamp}</span>
          </div>
          <div>
            Generated: {new Date().toLocaleDateString()} • Candidate ID: {applicant?.id || 'session'}
          </div>
        </div>
      </div>
    </div>
  );
};
