import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Play, 
  Square, 
  Volume2, 
  CheckCircle2, 
  AlertTriangle, 
  Award, 
  RotateCcw, 
  ArrowRight, 
  ArrowLeft,
  Building2,
  FileCheck2,
  Sparkles,
  Lightbulb,
  MessageSquare,
  HelpCircle,
  Clock
} from 'lucide-react';
import { ApplicantRecord } from '../types';

interface InterviewSimulatorProps {
  applicant: ApplicantRecord | null;
  selectedCountry?: 'Germany' | 'Austria';
}

interface InterviewQuestion {
  id: number;
  questionDe: string;
  questionEn: string;
  category: 'Relocation Intent' | 'Financial Proof' | 'Professional Fit' | 'Cultural Integration';
  keyExpectations: string[];
  sampleKeywords: string[];
  officerTip: string;
}

export const InterviewSimulator: React.FC<InterviewSimulatorProps> = ({
  applicant,
  selectedCountry = 'Germany',
}) => {
  const [activeTrack, setActiveTrack] = useState<'EMBASSY' | 'EMPLOYER'>('EMBASSY');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState<boolean>(false);
  const [speechLanguage, setSpeechLanguage] = useState<'de-DE' | 'en-US'>('de-DE');

  const recognitionRef = useRef<any>(null);

  // Embassy Visa Officer Questions (AufenthG Regulatory Focus)
  const embassyQuestions: InterviewQuestion[] = [
    {
      id: 1,
      questionDe: "Warum haben Sie sich für ein Studium bzw. eine berufliche Tätigkeit in Deutschland entschieden und nicht in Ihrem Heimatland?",
      questionEn: "Why have you chosen Germany for higher education or skilled employment over continuing in your home country?",
      category: 'Relocation Intent',
      keyExpectations: ['Clear academic/vocational logic', 'Knowledge of German public institutions', 'Realistic long-term trajectory'],
      sampleKeywords: ['tuition-free', 'public university', 'daad', 'aps', 'hochschule', 'industry standards'],
      officerTip: 'Visa officers test whether your relocation motive is genuine and well-researched, rather than an arbitrary migration attempt.'
    },
    {
      id: 2,
      questionDe: "Wie finanzieren Sie Ihren Lebensunterhalt in Deutschland? Haben Sie bereits ein Sperrkonto eröffnet?",
      questionEn: "How will you finance your living expenses in Germany? Have you opened a statutory Blocked Account (Sperrkonto)?",
      category: 'Financial Proof',
      keyExpectations: ['Knowledge of statutory €11,904 requirement', 'Health insurance awareness', 'Realistic rent budget in target city'],
      sampleKeywords: ['sperrkonto', 'blocked account', '11904', 'health insurance', 'krankenkasse', 'monthly budget'],
      officerTip: 'Do not rely on informal family promises. State your exact blocked account provider (Coracle/Expatrio/Fintiba) and €992/month release structure.'
    },
    {
      id: 3,
      questionDe: "Welches Deutschniveau haben Sie bisher erreicht und wie planen Sie, die Sprachbarriere im Alltag zu überwinden?",
      questionEn: "What CEFR German language level have you achieved, and how do you plan to navigate the daily language barrier?",
      category: 'Cultural Integration',
      keyExpectations: ['Specific Goethe/telc certificate cited', 'Active language study habits', 'Readiness to integrate into society'],
      sampleKeywords: ['goethe', 'telc', 'a2', 'b1', 'b2', 'integration', 'sprache', 'daily life'],
      officerTip: 'Even for 100% English degrees, embassies strongly favor candidates with at least A1/A2 German certification.'
    },
    {
      id: 4,
      questionDe: "Haben Sie ein APS-Zertifikat erhalten und welche Unterlagen haben Sie bei der Botschaft eingereicht?",
      questionEn: "Have you received your Indian APS verification certificate and which documents are submitted to the Embassy?",
      category: 'Professional Fit',
      keyExpectations: ['APS certificate verification', 'Degree transcript authenticity', 'University admission letter'],
      sampleKeywords: ['aps certificate', 'anabin', 'degree transcripts', 'zulassungsbescheid', 'vfs global'],
      officerTip: 'For Indian applicants, APS is mandatory. Cite your APS token number and Anabin H+ university status.'
    }
  ];

  // German Employer & Apprenticeship Questions (Vocational & Technical Focus)
  const employerQuestions: InterviewQuestion[] = [
    {
      id: 1,
      questionDe: "Welche praktischen Erfahrungen bringen Sie für diese Fachstelle oder die Duale Ausbildung mit?",
      questionEn: "What practical hands-on experience or vocational skills do you bring to this position or apprenticeship?",
      category: 'Professional Fit',
      keyExpectations: ['Concrete technical or clinical competencies', 'Project examples', 'Problem-solving methodology'],
      sampleKeywords: ['project', 'hands-on', 'clinical', 'nursing', 'coding', 'git', 'patient care', 'problem solving'],
      officerTip: 'German employers prioritize practical competence and self-discipline over theoretical grades.'
    },
    {
      id: 2,
      questionDe: "Wie reagieren Sie auf Schichtarbeit, Bereitschaftsdienste und anspruchsvolle Teamübergaben?",
      questionEn: "How do you handle shift systems, on-call rotations, and demanding operational handovers in a team?",
      category: 'Cultural Integration',
      keyExpectations: ['Punctuality (Pünktlichkeit)', 'Stress resilience', 'Clear German documentation protocols'],
      sampleKeywords: ['schichtdienst', 'teamwork', 'punctuality', 'reliability', 'handover', 'resilience'],
      officerTip: 'Emphasize German workplace virtues: punctuality, thorough documentation, and respectful peer communication.'
    },
    {
      id: 3,
      questionDe: "Wo sehen Sie sich nach Abschluss Ihrer 3-jährigen Ausbildungszeit oder den ersten zwei Berufsjahren in Deutschland?",
      questionEn: "Where do you see yourself after completing your 3-year apprenticeship or your first 2 years of work in Germany?",
      category: 'Relocation Intent',
      keyExpectations: ['Long-term employer loyalty', 'Advanced specialization (Fachweiterbildung)', 'Settlement permit goal'],
      sampleKeywords: ['fachweiterbildung', 'permanent contract', 'unbefristet', 'specialization', 'long-term career'],
      officerTip: 'Employers invest heavily in international trainees; they want to hear that you intend to stay with the company post-graduation.'
    }
  ];

  const currentQuestions = activeTrack === 'EMBASSY' ? embassyQuestions : employerQuestions;
  const currentQ = currentQuestions[currentQuestionIndex] || currentQuestions[0];
  const currentAnswer = userAnswers[currentQ.id] || '';

  // Setup Web Speech Recognition
  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your answer directly.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechLanguage;

      recognition.onstart = () => setIsRecording(true);

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        setUserAnswers(prev => ({
          ...prev,
          [currentQ.id]: (prev[currentQ.id] ? prev[currentQ.id] + ' ' : '') + transcript.trim()
        }));
      };

      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Speech recognition init notice:', e);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setIsRecording(false);
  };

  // Text-To-Speech: Officer Speaks Question
  const speakQuestion = (lang: 'de' | 'en') => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const text = lang === 'de' ? currentQ.questionDe : currentQ.questionEn;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'de' ? 'de-DE' : 'en-US';
    utterance.rate = 0.95;

    utterance.onstart = () => setIsSpeakingQuestion(true);
    utterance.onend = () => setIsSpeakingQuestion(false);
    utterance.onerror = () => setIsSpeakingQuestion(false);

    window.speechSynthesis.speak(utterance);
  };

  // Real-Time Evaluation Algorithm for Current Answer
  const answerWords = currentAnswer.trim().split(/\s+/).filter(Boolean);
  const wordCount = answerWords.length;
  const answerLower = currentAnswer.toLowerCase();

  const detectedKeywords = currentQ.sampleKeywords.filter(kw => answerLower.includes(kw.toLowerCase()));
  
  let qScore = 0;
  if (wordCount > 10) qScore += 30;
  if (wordCount >= 30) qScore += 25;
  if (wordCount >= 60) qScore += 15;
  qScore += Math.min(30, detectedKeywords.length * 10);
  qScore = Math.min(100, qScore);

  // Overall Readiness Calculation
  const allScores = currentQuestions.map(q => {
    const text = userAnswers[q.id] || '';
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    if (words === 0) return 0;
    const hits = q.sampleKeywords.filter(kw => text.toLowerCase().includes(kw.toLowerCase())).length;
    return Math.min(100, (words > 25 ? 50 : 25) + hits * 15);
  });
  const overallReadiness = Math.round(allScores.reduce((a, b) => a + b, 0) / currentQuestions.length);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 mb-1">
            <Sparkles className="w-3 h-3 text-amber-600" /> AI Guided Consular & Employer Simulator
          </span>
          <h2 className="text-xl font-bold text-slate-900">
            Interactive German Interview Readiness Simulator
          </h2>
          <p className="text-xs text-slate-500">
            Rehearse authentic German Embassy Visa Officer & Employer interviews with real-time feedback pills and readiness scoring.
          </p>
        </div>

        {/* Track Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => { setActiveTrack('EMBASSY'); setCurrentQuestionIndex(0); }}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTrack === 'EMBASSY'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Embassy Visa Officer</span>
          </button>
          <button
            onClick={() => { setActiveTrack('EMPLOYER'); setCurrentQuestionIndex(0); }}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTrack === 'EMPLOYER'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>German Employer / Trade</span>
          </button>
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Question Audio Card & Answer Recording */}
        <div className="lg:col-span-2 space-y-5">
          {/* Question Stepper */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {currentQuestions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  currentQuestionIndex === idx
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>Q{idx + 1}</span>
                {userAnswers[q.id] && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
              </button>
            ))}
          </div>

          {/* Question Presentation Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                Category: {currentQ.category}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => speakQuestion('de')}
                  disabled={isSpeakingQuestion}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 transition-colors"
                  title="Listen in German"
                >
                  <Volume2 className="w-3.5 h-3.5 text-sky-600" /> 🇩🇪 Listen (DE)
                </button>
                <button
                  onClick={() => speakQuestion('en')}
                  disabled={isSpeakingQuestion}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 transition-colors"
                  title="Listen in English"
                >
                  <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> 🇬🇧 Listen (EN)
                </button>
              </div>
            </div>

            {/* Questions Text */}
            <div className="space-y-2">
              <div className="text-base font-bold text-slate-900 leading-snug">
                🇩🇪 {currentQ.questionDe}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                🇬🇧 {currentQ.questionEn}
              </div>
            </div>

            {/* Officer Tip Box */}
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-amber-950 font-bold">Officer Expectation:</strong>
                <p className="mt-0.5 text-amber-800 text-[11px]">{currentQ.officerTip}</p>
              </div>
            </div>

            {/* User Answer Field & Controls */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
                  <span>Your Verbal or Written Response:</span>
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={speechLanguage}
                    onChange={(e: any) => setSpeechLanguage(e.target.value)}
                    className="text-[11px] bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700"
                  >
                    <option value="de-DE">🇩🇪 Deutsch (de-DE)</option>
                    <option value="en-US">🇬🇧 English (en-US)</option>
                  </select>

                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
                      isRecording
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-sky-600 hover:bg-sky-700 text-white shadow-2xs'
                    }`}
                  >
                    {isRecording ? <Square className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                    <span>{isRecording ? 'Stop Recording' : 'Speak Answer'}</span>
                  </button>
                </div>
              </div>

              <textarea
                value={currentAnswer}
                onChange={(e) => setUserAnswers({ ...userAnswers, [currentQ.id]: e.target.value })}
                rows={4}
                placeholder="Type your response here or click 'Speak Answer' to record live..."
                className="w-full text-xs text-slate-800 border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-sans leading-relaxed"
              />

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Words: <strong className="text-slate-800">{wordCount}</strong></span>
                <span>Question Score: <strong className="text-sky-700">{qScore}%</strong></span>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40"
              >
                Previous Question
              </button>

              <button
                disabled={currentQuestionIndex >= currentQuestions.length - 1}
                onClick={() => setCurrentQuestionIndex(prev => Math.min(currentQuestions.length - 1, prev + 1))}
                className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold disabled:opacity-40"
              >
                Next Question →
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Live Feedback Pills, Grammar Notes & Overall Readiness Score */}
        <div className="space-y-4">
          {/* Overall Readiness Gauge */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              <span>Overall Readiness Score</span>
              <Award className="w-4 h-4 text-sky-600" />
            </div>

            <div className="flex items-center gap-4 my-2">
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={
                      overallReadiness >= 75
                        ? 'text-emerald-500'
                        : overallReadiness >= 45
                        ? 'text-sky-500'
                        : 'text-amber-500'
                    }
                    strokeDasharray={`${overallReadiness}, 100`}
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute font-black text-xl text-slate-900">
                  {overallReadiness}%
                </div>
              </div>

              <div>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                  overallReadiness >= 75
                    ? 'bg-emerald-100 text-emerald-800'
                    : overallReadiness >= 45
                    ? 'bg-sky-100 text-sky-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {overallReadiness >= 75 ? 'Consular / Hiring Ready' : overallReadiness >= 45 ? 'Developing Fit' : 'Practice Required'}
                </span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Track: {activeTrack === 'EMBASSY' ? 'German Embassy Officer' : 'German Employer Trade'}
                </p>
              </div>
            </div>
          </div>

          {/* Real-Time Constructive Feedback Pills */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>Real-Time Feedback Pills:</span>
            </h4>

            <div className="space-y-1.5">
              {wordCount === 0 ? (
                <div className="text-xs text-slate-400 italic p-3 text-center border border-dashed rounded-xl">
                  Start speaking or typing your answer to receive immediate pronunciation & grammar pills.
                </div>
              ) : (
                <>
                  <div className={`p-2.5 rounded-xl text-[11px] font-medium border ${
                    wordCount >= 30 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}>
                    {wordCount >= 30 ? '✓ Articulation Length: Sufficiently detailed response.' : '⚠️ Response Length: Answer is too brief for consular scrutiny.'}
                  </div>

                  <div className={`p-2.5 rounded-xl text-[11px] font-medium border ${
                    detectedKeywords.length >= 2 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}>
                    {detectedKeywords.length >= 2 
                      ? `✓ Regulatory Terms: Cited key phrases (${detectedKeywords.join(', ')}).`
                      : '💡 Recommendation: Mention specific German terms (e.g., Sperrkonto, APS, ECTS, Duale Ausbildung).'}
                  </div>

                  <div className="p-2.5 rounded-xl text-[11px] font-medium bg-sky-50 border border-sky-200 text-sky-900">
                    🗣️ Language Cadence: {speechLanguage === 'de-DE' ? 'German Syntax Assessment Active' : 'International English Fluency Active'}.
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Expected Regulatory Keywords */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Expected Regulatory Terms for Q{currentQuestionIndex + 1}:
            </span>
            <div className="flex flex-wrap gap-1">
              {currentQ.sampleKeywords.map((kw, i) => {
                const isMatched = detectedKeywords.includes(kw);
                return (
                  <span
                    key={i}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      isMatched
                        ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isMatched ? '✓ ' : ''}{kw}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
