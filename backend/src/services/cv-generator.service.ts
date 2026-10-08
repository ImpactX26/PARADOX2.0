import { Injectable } from '@nestjs/common';
import { ApplicantRecord } from '../store/applicant.store';

@Injectable()
export class CvGeneratorService {
  /**
  /**
   * Generates a DIN 5008 / Europass compliant, standardized German or English CV HTML document
   */
  public generateLebenslaufHtml(applicant: ApplicantRecord, lang: string = 'de'): string {
    const isEn = lang === 'en';
    const personal = applicant.personal;
    const education = applicant.education;
    const employment = applicant.employment;
    const languages = applicant.languages;
    const skills = applicant.skills;

    const t = {
      docTitle: isEn ? `Curriculum Vitae - ${personal.name || 'Applicant'}` : `Tabellarischer Lebenslauf - ${personal.name || 'Bewerber'}`,
      subtitle: isEn ? 'Application for Higher Education & Skilled Immigration (Germany / Austria)' : 'Bewerbung für Bildung & Beschäftigung in Deutschland / Österreich',
      personalData: isEn ? 'Personal Information' : 'Persönliche Daten',
      nameLabel: isEn ? 'Full Legal Name' : 'Name',
      birthLabel: isEn ? 'Birth Year' : 'Geburtsjahrgang',
      natLabel: isEn ? 'Nationality' : 'Staatsangehörigkeit',
      eduTitle: isEn ? 'Education & Academic Qualifications' : 'Schul- & Hochschulausbildung',
      expTitle: isEn ? 'Professional Work Experience' : 'Berufliche Praxis & Praktika',
      langTitle: isEn ? 'Language Proficiencies (CEFR)' : 'Sprachkenntnisse (GER)',
      skillsTitle: isEn ? 'Core Technical Skills & Tools' : 'Fachliche Kompetenzen',
      verified: isEn ? '✓ Officially Verified' : '✓ Amtlich verifiziert (Official)',
      selfReported: isEn ? 'Self-Reported Claim' : 'Angabe des Bewerbers',
      footerLeft: isEn ? 'Generated in compliance with DIN 5008 & Europass standards • Educaro Germany' : 'Erstellt nach DIN 5008 Standard • Educaro Deutschland GmbH',
      footerRight: isEn ? 'Digital Document Dossier' : 'Elektronisches Bewerbungsdossier',
    };

    const formattedDob = personal.age ? `${2026 - personal.age} (Age: ${personal.age})` : 'Not specified';
    const verifiedBadge = (isVerified: boolean) => isVerified
      ? `<span style="display:inline-block;background-color:#d1fae5;color:#065f46;font-size:11px;font-weight:600;padding:2px 8px;border-radius:9999px;margin-left:6px;">${t.verified}</span>`
      : `<span style="display:inline-block;background-color:#fef3c7;color:#92400e;font-size:11px;font-weight:600;padding:2px 8px;border-radius:9999px;margin-left:6px;">${t.selfReported}</span>`;

    return `<!DOCTYPE html>
<html lang="${isEn ? 'en' : 'de'}">
<head>
  <meta charset="UTF-8">
  <title>${t.docTitle}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: #1e293b;
      line-height: 1.5;
      background-color: #ffffff;
      margin: 0;
      padding: 30px;
    }
    .header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .header h1 {
      font-size: 26px;
      margin: 0;
      color: #0f172a;
      letter-spacing: -0.5px;
      text-transform: uppercase;
    }
    .header .subtitle {
      font-size: 13px;
      color: #64748b;
      margin-top: 4px;
    }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #0284c7;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-top: 24px;
      margin-bottom: 12px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
    }
    .entry-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
    }
    .entry-table td {
      padding: 6px 0;
      vertical-align: top;
      font-size: 13px;
    }
    .col-date {
      width: 28%;
      color: #475569;
      font-weight: 500;
    }
    .col-content {
      width: 72%;
    }
    .col-content strong {
      color: #0f172a;
      font-size: 13.5px;
    }
    .skills-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 4px;
    }
    .badge {
      background-color: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 12px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #cbd5e1;
      font-size: 12px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>

  <div class="header">
    <div>
      <h1>${personal.name || 'Vorname Nachname'}</h1>
      <div class="subtitle">${t.subtitle}</div>
    </div>
    <div style="text-align: right; font-size: 12px; color: #475569;">
      <div>${personal.email || 'email@example.com'}</div>
      <div>${personal.phone || '+49 123 4567890'}</div>
      <div>${personal.city ? personal.city + ', ' : ''}${personal.countryOfOrigin || 'India'}</div>
    </div>
  </div>

  <div class="section-title">${t.personalData}</div>
  <table class="entry-table">
    <tr>
      <td class="col-date">${t.nameLabel}</td>
      <td class="col-content"><strong>${personal.name || 'Kandidat'}</strong></td>
    </tr>
    <tr>
      <td class="col-date">${t.birthLabel}</td>
      <td class="col-content">${formattedDob}</td>
    </tr>
    <tr>
      <td class="col-date">${t.natLabel}</td>
      <td class="col-content">${personal.countryOfOrigin || 'Indisch'}</td>
    </tr>
    <tr>
      <td class="col-date">${isEn ? 'Target Program' : 'Zielprogramm'}</td>
      <td class="col-content">${applicant.motivation.pathway || 'Akademisches Studium'} in ${personal.targetCountry || 'Deutschland'}</td>
    </tr>
  </table>

  <div class="section-title">${t.eduTitle}</div>
  <table class="entry-table">
    <tr>
      <td class="col-date">${education.graduationYear ? education.graduationYear - 4 + ' - ' + education.graduationYear : 'Abschluss'}</td>
      <td class="col-content">
        <strong>${education.degree || 'Bachelorabschluss'} (${education.fieldOfStudy || 'Fachrichtung'})</strong>
        ${verifiedBadge(education.isVerified)}
        <br>
        <span>${education.institution || 'Universität'}</span>
        ${education.grade ? `<br><span style="color:#0369a1; font-weight: 500;">Original: ${education.grade} ${education.germanGrade ? '| German GPA (Bavarian Formula): ' + education.germanGrade.toFixed(2) : ''}</span>` : ''}
      </td>
    </tr>
  </table>

  <div class="section-title">${t.expTitle}</div>
  <table class="entry-table">
    <tr>
      <td class="col-date">${employment.durationMonths ? Math.round(employment.durationMonths / 12) + (isEn ? ' Yrs Experience' : ' Jahre Praxis') : (isEn ? 'Experience' : 'Berufserfahrung')}</td>
      <td class="col-content">
        <strong>${employment.role || 'Fachkraft / Spezialist'}</strong>
        ${verifiedBadge(employment.isVerified)}
        <br>
        <span>${employment.employer || 'Unternehmen'}</span>
        ${employment.responsibilities ? `<br><span style="color:#475569;">${employment.responsibilities}</span>` : ''}
      </td>
    </tr>
  </table>

  <div class="section-title">${t.langTitle}</div>
  <table class="entry-table">
    ${languages.length > 0 ? languages.map(l => `
      <tr>
        <td class="col-date">${l.language}</td>
        <td class="col-content">
          <strong>${isEn ? 'Level ' : 'Niveau '}${l.level}</strong> ${l.certificateType ? '(' + l.certificateType + ')' : ''}
          ${verifiedBadge(l.isVerified)}
        </td>
      </tr>
    `).join('') : `
      <tr>
        <td class="col-date">Deutsch</td>
        <td class="col-content">${isEn ? 'In preparation / Basic' : 'In Vorbereitung / Grundkenntnisse'}</td>
      </tr>
      <tr>
        <td class="col-date">Englisch</td>
        <td class="col-content">${isEn ? 'Fluent (C1)' : 'Fließend in Wort und Schrift (C1)'}</td>
      </tr>
    `}
  </table>

  <div class="section-title">${t.skillsTitle}</div>
  <div style="font-size: 13px; margin-bottom: 20px;">
    <div class="skills-badges">
      ${skills.length > 0 ? skills.map(s => `<span class="badge">${s}</span>`).join('') : '<span class="badge">Problem Solving</span><span class="badge">Intercultural Competence</span><span class="badge">Analytical Thinking</span>'}
    </div>
  </div>

  <div class="footer">
    <div>${isEn ? 'Location, Date: ' : 'Ort, Datum: '}${personal.city || 'Frankfurt am Main'}, ${new Date().toLocaleDateString(isEn ? 'en-US' : 'de-DE')}</div>
    <div style="border-top: 1px dotted #94a3b8; width: 160px; text-align: center; padding-top: 4px;">${isEn ? 'Signature' : 'Unterschrift'}</div>
  </div>

</body>
</html>`;
  }
}
