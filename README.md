# Educaro European AI Applicant Journey & Forensic Gateway

> **IMPACTX '26 Hackathon**  
> **Track:** Agentic AI Track (Educaro Deutschland GmbH - *"AI-Powered Applicant Journey for Germany Education & Employment"*)

---

## 🚀 Overview

The **Educaro European AI Applicant Journey & Forensic Gateway** is an enterprise-grade, end-to-end relocation platform purpose-built for international candidates aspiring to study, complete a vocational apprenticeship (*Duale Ausbildung*), or work (*Chancenkarte / Opportunity Card & EU Blue Card*) in Germany and Austria.

The platform bridges document forensics, legal credential validation, multimodal communication scoring, and deterministic immigration visa logic into a unified, user-friendly digital journey.

---

## 🏛️ System Architecture

1. **Frontend Experience Layer**
   - **Framework:** React 18 with TypeScript on Vite.
   - **Styling:** Tailwind CSS with modern SaaS aesthetics (`slate-50` background, glassmorphism badges, and rounded-2xl cards).
   - **Icons & Visuals:** Lucide React icons + dynamic SVG pictorial pathway cards.
   - **Tabs & Tools:**
     - 🧭 **5-Step Applicant Wizard:** Visual pathway selection, forensic document dropzone, 30-sec video pitch, Chancenkarte gap analytics, split-screen *Tabellarischer Lebenslauf* (CV).
     - 🎓 **University Ranker:** Multidimensional matching across CHE (DAAD), QS Europe, and THE World with Bavarian GPA thresholding.
     - 🎙️ **Mock Interview Simulator:** German embassy & admissions question trainer with real-time feedback.
     - 💶 **Financial & Blocked Account Calculator:** Real-time €11,904 blocked account breakdowns, health insurance, and part-time student wage projections.
     - 👔 **Counselor CRM Portal:** Multi-applicant pipeline, forensic alert monitoring, and case status dispatch.

2. **Backend Forensic & Decisioning Engine**
   - **Server Framework:** NestJS + Express (TypeScript).
   - **Document OCR:** Tesseract.js (100% open-source Optical Character Recognition engine running locally).
   - **Forensic Tamper Detection:** Institutional seal identification, font/stamp boundary extraction, text density checking, and chronological degree-progression sanity checks.
   - **Deterministic Legal Rules Engine:**
     - **Bavarian Formula (`Bayerische Formel`):**  
       `German Grade = 1 + 3 * ((Nmax - Nd) / (Nmax - Nmin))`
     - **German Chancenkarte Points Grid:** Evaluates recognized foreign degrees (4 pts), experience (2–3 pts), CEFR language proficiency (1–3 pts), and age (1–2 pts) with 6-point qualification threshold.
     - **Austrian Rot-Weiß-Rot-Karte:** Evaluates vocational & academic qualifications (20–30 pts), professional tenure (10–20 pts), German/English language (10–15 pts), and age criteria with a 55-point threshold.
     - **APS Requirement Detection:** Mandates Akademische Prüfstelle validation for Indian university degree holders.
   - **CV Engine:** Formats verified applicant data into a compliant German *Tabellarischer Lebenslauf*.
   - **Resilient Multi-Driver Data Store:** Prisma ORM ready for PostgreSQL with automatic zero-dependency SQLite/In-Memory fallback for 100% offline hackathon execution.

---

## 📜 Formal Open-Source Library Citations & Acknowledgments

In strict compliance with Hackathon Rules 9 & 10, the following open-source libraries, packages, and frameworks are gratefully acknowledged and utilized:

| Library / Tool | Version / Scope | License | Purpose / Architectural Role |
| :--- | :--- | :--- | :--- |
| **NestJS (`@nestjs/core`, `@nestjs/common`)** | ^10.x | MIT | Enterprise modular backend framework for controllers, services, and dependency injection. |
| **React & React DOM** | ^18.3 | MIT | Component-based user interface library. |
| **Vite** | ^5.x | MIT | Next-generation frontend build tooling and lightning-fast HMR server. |
| **TypeScript** | ^5.x | Apache 2.0 | Static typing system across full stack monorepo. |
| **Tesseract.js** | ^5.x | Apache 2.0 | Pure JavaScript / WebAssembly OCR port of the renowned Tesseract OCR engine for local document text extraction. |
| **Prisma ORM (`@prisma/client`, `prisma`)** | ^5.x | Apache 2.0 | Type-safe database client and schema management with resilient fallback. |
| **Tailwind CSS** | ^3.4 | MIT | Utility-first styling framework powering the modern SaaS interface. |
| **Lucide React** | ^0.348+ | ISC | Streamlined, accessible iconography. |
| **Multer & @types/multer** | ^1.4 | MIT | Node.js multipart/form-data upload middleware for local PDF/image processing. |
| **Concurrently** | ^8.2 | MIT | Parallelized process runner for simultaneous backend and frontend dev environments. |

---

## 🛠️ Quick Start & Installation

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Setup & Run All Services
From the root folder:

```bash
# 1. Install root, backend, and frontend dependencies
npm run install:all

# 2. Launch both backend (:3000) and frontend (:5173) concurrently
npm run dev
```

The frontend will be available at: `http://localhost:5173`  
The NestJS API will be available at: `http://localhost:3000`

---

## 🧪 Testing with 1-Click Jury Quick-Pitch Injectors
In the top navigation bar, the jury can click any of the 3 pre-built personas to observe instant, end-to-end forensic scanning, data provenance tagging, and visa rules calculation:
1. **[Aarav • Study]**: B.Tech graduate from Anna University seeking German Master's (Bavarian formula conversion + APS validation trigger).
2. **[Priya • Ausbildung]**: 12th standard graduate with Goethe-Institut B2 German applying for Healthcare Duale Ausbildung.
3. **[Rahul • Chancenkarte]**: Experienced Software Engineer with 6 years experience seeking German Opportunity Card (evaluating 9/6 points score).
