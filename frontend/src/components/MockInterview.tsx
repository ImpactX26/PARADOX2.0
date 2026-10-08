import React, { useState } from 'react';
import { Mic, Play, CheckCircle2, AlertTriangle, Sparkles, HelpCircle, RefreshCw } from 'lucide-react';
import { ApplicantRecord } from '../types';

interface MockInterviewProps {
  applicant: ApplicantRecord | null;
  selectedCountry: 'Germany' | 'Austria';
}

interface QuestionItem {
  id: number;
  questionDe: string;
  questionEn: string;
  category: 'Motivation' | 'Finance' | 'Academic' | 'Culture';
  tip: string;
}

export const MockInterview: React.FC<MockInterviewProps> = ({
  applicant,
  selectedCountry,
}) => {
  const pathway = applicant?.motivation?.pathway || 'STUDY';

  const questions: QuestionItem[] = pathway === 'AUSBILDUNG' ? [
    {
      id: 1,
      questionDe: "Warum möchten Sie eine Ausbildung in Deutschland machen und kein Studium im Heimatland?",
      questionEn: "Why do you want to pursue a vocational apprenticeship in Germany rather than university in your home country?",
      category: "Motivation",
      tip: "Highlight practical hands-on patient/technical learning, early financial independence, and German dual-training standards."
    },
    {
      id: 2,
      questionDe: "Wie schätzen Sie Ihre deutschen Sprachkenntnisse im Krankenhaus- oder Berufsalltag ein?",
      questionEn: "How do you assess your German language abilities in day-to-day hospital or workplace settings?",
      category: "Culture",
      tip: "Cite your Goethe B1/B2 certification, active medical terminology vocabulary, and readiness for daily team handovers."
    },
    {
      id: 3,
      questionDe: "Was wissen Sie über die Arbeitszeiten und Pflichten eines Auszubildenden?",
      questionEn: "What do you know about working hours, shift systems, and duties of a German apprentice?",
      category: "Academic",
      tip: "Explain the split between vocational school (Berufsschule) and practical shifts (Ausbildungsbetrieb)."
    }
  ] : pathway === 'CHANCENKARTE' ? [
    {
      id: 1,
      questionDe: "Welche Fachkenntnisse bringen Sie für den deutschen Arbeitsmarkt mit?",
      questionEn: "What specialized technical skills do you bring to the German labor market under the Opportunity Card?",
      category: "Academic",
      tip: "Mention your degree recognition, verified years in IT/Engineering, and high demand in German shortage occupations (MINT)."
    },
    {
      id: 2,
      questionDe: "Wie finanzieren Sie Ihren Lebensunterhalt während der ersten 12 Monate der Stellensuche?",
      questionEn: "How will you finance your living expenses during the first 12 months of job seeking in Germany?",
      category: "Finance",
      tip: "Reference the statutory blocked account (€1,027/month) and permissible 20 hrs/week secondary trial employment."
    },
    {
      id: 3,
      questionDe: "Warum haben Sie sich für den Standort Deutschland statt englischsprachiger Länder entschieden?",
      questionEn: "Why did you choose Germany over English-speaking countries like the US or UK?",
      category: "Motivation",
      tip: "Discuss European labor rights, long-term EU Blue Card residency pathways, and central European industrial hubs."
    }
  ] : [
    {
      id: 1,
      questionDe: "Warum haben Sie diesen spezifischen Studiengang und diese deutsche Universität gewählt?",
      questionEn: "Why did you choose this specific Master's degree and this German university?",
      category: "Academic",
      tip: "Refer to the university's research chairs, lab facilities, and alignment with your previous Bachelor's thesis."
    },
    {
      id: 2,
      questionDe: "Wie planen Sie Ihren Lebensunterhalt und die Sperrkonto-Anforderungen?",
      questionEn: "How are you financing your studies, and have you set up your German Blocked Account?",
      category: "Finance",
      tip: "Cite the statutory €11,904 blocked account deposit and German health insurance coverage."
    },
    {
      id: 3,
      questionDe: "Was sind Ihre beruflichen Pläne nach Abschluss des Studiums in Deutschland?",
      questionEn: "What are your career plans after completing your degree in Germany?",
      category: "Motivation",
      tip: "Mention the 18-month German job search visa (Paragraph 20 AufenthG) and entering high-tech industry."
    }
  ];

  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<{
    score: number;
    intentStatus: string;
    strengths: string[];
    improvements: string[];
  } | null>(null);

  const activeQuestion = questions[currentIdx];

  const handleEvaluateAnswer = () => {
    if (!userAnswer || userAnswer.trim().length < 15) {
      setFeedback({
        score: 5.0,
        intentStatus: 'Needs Elaboration',
        strengths: ['Good foundational attempt'],
        improvements: ['Response is brief. Provide concrete examples from your academic or professional background.'],
      });
      return;
    }

    // Deterministic interview scoring
    let score = 8.0;
    const lower = userAnswer.toLowerCase();
    const strengths: string[] = [];
    const improvements: string[] = [];

    if (lower.includes('deutschland') || lower.includes('germany') || lower.includes('austria')) {
      strengths.push('Demonstrates direct destination intent and focus.');
      score += 0.5;
    }
    if (lower.includes('research') || lower.includes('career') || lower.includes('experience') || lower.includes('skills')) {
      strengths.push('Articulates clear professional and technical motivations.');
      score += 0.5;
    }
    if (lower.includes('blocked account') || lower.includes('finance') || lower.includes('stipend')) {
      strengths.push('Addresses immigration financial self-sufficiency rules.');
      score += 0.5;
    }

    if (userAnswer.split(' ').length < 35) {
      improvements.push('Expand response with specific university module names or legal visa paragraphs.');
      score -= 0.5;
    }

    score = Math.max(5.5, Math.min(9.8, Math.round(score * 10) / 10));

    setFeedback({
      score,
      intentStatus: score >= 8.0 ? 'Embassy Ready' : 'Review Suggested',
      strengths: strengths.length > 0 ? strengths : ['Clear verbal formulation'],
      improvements: improvements.length > 0 ? improvements : ['Maintain natural eye contact and speaking cadence during consular interview.'],
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            German Embassy & Admissions Simulator
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Consular & University Mock Interview</h1>
          <p className="text-xs text-slate-500">
            Practice deterministic visa screening questions tailored to your {pathway} pathway into {selectedCountry}.
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => {
                setCurrentIdx(idx);
                setUserAnswer('');
                setFeedback(null);
              }}
              className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                currentIdx === idx
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Q{idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Active Question Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-rose-600 uppercase tracking-wider">
            Question {currentIdx + 1} of {questions.length} • {activeQuestion.category}
          </span>
          <span className="text-slate-400">German Consular Standard</span>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
          <div className="text-sm font-bold text-slate-900 leading-snug">
            🇩🇪 {activeQuestion.questionDe}
          </div>
          <div className="text-xs text-slate-600 italic">
            🇬🇧 {activeQuestion.questionEn}
          </div>
        </div>

        <div className="flex items-start gap-2 bg-amber-50/70 border border-amber-200/70 rounded-xl p-3 text-xs text-amber-900">
          <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Consular Officer Evaluation Tip:</strong> {activeQuestion.tip}
          </div>
        </div>

        {/* User Answer Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Your Spoken or Written Response:
          </label>
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            rows={5}
            placeholder="Type your response or rehearse your talking points here..."
            className="w-full text-xs p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-800"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => {
              setUserAnswer(
                pathway === 'STUDY'
                  ? `I chose this university due to its accredited curriculum in computer science and the research laboratories led by renowned faculty. I have already deposited the €11,904 in a statutory blocked account to ensure full financial independence.`
                  : pathway === 'AUSBILDUNG'
                  ? `Ich habe mich intensiv mit der dualen Ausbildung in Deutschland beschäftigt. Die Kombination aus Theorie an der Berufsschule und praktischer Patientenversorgung im Klinikum passt perfekt zu meinen Berufszielen.`
                  : `With my 6 years of proven engineering experience and recognized qualification, I meet all legal criteria for the Chancenkarte to transition into Germany's tech sector.`
              );
            }}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Insert Sample Strong Response
          </button>

          <button
            onClick={handleEvaluateAnswer}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-transform active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" /> Evaluate Response
          </button>
        </div>
      </div>

      {/* Real-time Feedback Card */}
      {feedback && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs animate-fadeIn space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase">Assessment Score</span>
              <div className="text-2xl font-black text-rose-700">{feedback.score} / 10</div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {feedback.intentStatus}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3 space-y-1">
              <span className="font-bold text-emerald-900 block mb-1">✓ Consular Strengths:</span>
              {feedback.strengths.map((s, i) => (
                <div key={i} className="text-emerald-800">• {s}</div>
              ))}
            </div>

            <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3 space-y-1">
              <span className="font-bold text-amber-900 block mb-1">⚡ Recommendations:</span>
              {feedback.improvements.map((imp, i) => (
                <div key={i} className="text-amber-800">• {imp}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
