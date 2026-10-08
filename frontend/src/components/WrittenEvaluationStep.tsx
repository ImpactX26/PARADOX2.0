import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb, 
  Award, 
  TrendingUp, 
  BookOpen, 
  ArrowRight, 
  ArrowLeft,
  RotateCcw,
  Check,
  Send
} from 'lucide-react';
import { ApplicantRecord, WrittenEvaluationData } from '../types';

interface WrittenEvaluationStepProps {
  applicant: ApplicantRecord;
  onSaveEvaluation?: (data: WrittenEvaluationData) => Promise<void>;
  onBack?: () => void;
  onNext?: () => void;
  isCompact?: boolean;
}

export const WrittenEvaluationStep: React.FC<WrittenEvaluationStepProps> = ({
  applicant,
  onSaveEvaluation,
  onBack,
  onNext,
  isCompact = false,
}) => {
  // 3 Core Real-World Applicant Prompts
  const [motivationAnswer, setMotivationAnswer] = useState<string>(
    applicant.media?.writtenEvaluation?.answers?.motivation || ''
  );
  const [professionalFitAnswer, setProfessionalFitAnswer] = useState<string>(
    applicant.media?.writtenEvaluation?.answers?.professionalFit || ''
  );
  const [financialCulturalAnswer, setFinancialCulturalAnswer] = useState<string>(
    applicant.media?.writtenEvaluation?.answers?.financialCultural || ''
  );

  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Critical Domain Keywords to scan for German relocation readiness
  const CRITICAL_KEYWORDS = [
    'blocked account', 'sperrkonto', 'aps', 'ects', 'duale ausbildung', 
    'b2', 'goethe', 'career goals', 'daad', 'uni-assist', 'health insurance', 
    'chancenkarte', 'blue card', 'research', 'public university', 'tuition-free',
    'german language', 'berlin', 'munich', 'integration', 'job seeker'
  ];

  /**
   * Real-Time Linguistic & Argument Evaluator
   */
  const evaluationResults = useMemo((): WrittenEvaluationData => {
    const combinedText = `${motivationAnswer} ${professionalFitAnswer} ${financialCulturalAnswer}`.trim();
    const clean = combinedText.toLowerCase();

    // 1. Word and sentence counts
    const words = clean.split(/\s+/).filter(w => w.length > 0);
    const totalWords = words.length;
    const sentences = combinedText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const totalSentences = Math.max(1, sentences.length);

    // 2. Lexical Diversity (Type-Token Ratio)
    const uniqueWords = new Set(words);
    const typeTokenRatio = totalWords > 0 ? Math.round((uniqueWords.size / totalWords) * 100) : 0;

    // 3. LIX Readability Index
    // LIX = (words / sentences) + (long words [>6 chars] * 100 / words)
    const longWords = words.filter(w => w.length > 6).length;
    const avgSentenceLength = totalWords / totalSentences;
    const longWordPct = totalWords > 0 ? (longWords * 100) / totalWords : 0;
    const lixIndex = Math.round(avgSentenceLength + longWordPct);

    // 4. Keyword Relevancy Detection
    const detectedKeywords: string[] = [];
    CRITICAL_KEYWORDS.forEach(kw => {
      if (clean.includes(kw)) {
        detectedKeywords.push(kw);
      }
    });

    // 5. Individual Question Scores (0 - 100)
    const scoreText = (text: string, expectedKw: string[]): number => {
      const wCount = text.trim().split(/\s+/).filter(Boolean).length;
      if (wCount === 0) return 0;
      let score = 40;
      // Word count progression
      if (wCount >= 25) score += 20;
      if (wCount >= 50) score += 15;
      if (wCount >= 80) score += 10;
      // Keyword bonus
      const textLower = text.toLowerCase();
      expectedKw.forEach(kw => {
        if (textLower.includes(kw)) score += 6;
      });
      return Math.min(100, Math.round(score));
    };

    const motivationScore = scoreText(motivationAnswer, ['research', 'tuition-free', 'public university', 'daad', 'germany']);
    const professionalFitScore = scoreText(professionalFitAnswer, ['bachelor', 'ects', 'experience', 'software', 'engineering', 'career goals']);
    const financialCulturalScore = scoreText(financialCulturalAnswer, ['blocked account', 'sperrkonto', 'health insurance', 'b2', 'goethe', 'language']);

    // 6. Overall Coherence & Visa Realism Score (0 - 100)
    let overallCoherenceScore = 0;
    if (totalWords > 0) {
      const avgAnswerScore = (motivationScore + professionalFitScore + financialCulturalScore) / 3;
      const kwBonus = Math.min(25, detectedKeywords.length * 4);
      const diversityBonus = typeTokenRatio >= 50 ? 10 : 5;
      overallCoherenceScore = Math.min(100, Math.round(avgAnswerScore * 0.7 + kwBonus + diversityBonus));
    }

    // 7. Instant Constructive Feedback Pills
    const feedbackPills: string[] = [];

    if (motivationAnswer.length > 30) {
      if (clean.includes('tuition-free') || clean.includes('research') || clean.includes('daad')) {
        feedbackPills.push('🟢 Strong academic & economic rationale for Germany');
      } else {
        feedbackPills.push('💡 Add specific institutional focus (e.g. DAAD ranking, TU9 excellence)');
      }
    }

    if (professionalFitAnswer.length > 30) {
      if (clean.includes('ects') || clean.includes('bachelor') || clean.includes('b.tech') || clean.includes('experience')) {
        feedbackPills.push('🟢 Concrete academic alignment & degree continuity');
      } else {
        feedbackPills.push('💡 Mention ECTS credit prerequisites or specific coursework');
      }
    }

    if (financialCulturalAnswer.length > 30) {
      if (clean.includes('sperrkonto') || clean.includes('blocked account')) {
        feedbackPills.push('🟢 Practical financial realism (€11,904 Sperrkonto cited)');
      } else {
        feedbackPills.push('💡 Cite official German Blocked Account (Sperrkonto) compliance');
      }

      if (clean.includes('goethe') || clean.includes('b2') || clean.includes('b1')) {
        feedbackPills.push('🟢 Clear German language acquisition roadmap');
      } else {
        feedbackPills.push('🟡 Detail CEFR German preparation (e.g. Goethe B1/B2)');
      }
    }

    if (feedbackPills.length === 0) {
      feedbackPills.push('📝 Type your responses above to receive real-time visa argumentation feedback.');
    }

    return {
      motivationScore,
      professionalFitScore,
      financialCulturalScore,
      overallCoherenceScore,
      lixIndex,
      typeTokenRatio,
      detectedKeywords,
      feedbackPills,
      answers: {
        motivation: motivationAnswer,
        professionalFit: professionalFitAnswer,
        financialCultural: financialCulturalAnswer,
      },
    };
  }, [motivationAnswer, professionalFitAnswer, financialCulturalAnswer]);

  // Handle Save
  const handleSave = async () => {
    if (onSaveEvaluation) {
      await onSaveEvaluation(evaluationResults);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  /**
   * 1-Click Practice Answer Injectors for Jury Demonstration
   */
  const handleInjectSampleAnswers = (type: 'study' | 'ausbildung' | 'chancenkarte') => {
    if (type === 'study') {
      setMotivationAnswer(
        'Germany offers world-leading research infrastructure through the TU9 technical universities with €0 public tuition fees. While studying in India provided a strong theoretical foundation, German universities emphasize practical industrial application and provide an 18-month post-study job seeker visa to integrate into the European tech industry.'
      );
      setProfessionalFitAnswer(
        'My 4-year Bachelor of Technology degree from Anna University covers 180+ ECTS-equivalent credits across distributed systems, algorithms, and artificial intelligence. Having maintained an 8.6 CGPA and completed an industry internship, I satisfy the rigorous prerequisites for German Master programs evaluated via the Bavarian Formula.'
      );
      setFinancialCulturalAnswer(
        'I have already arranged the statutory €11,904 German Blocked Account (Sperrkonto) with Expatrio alongside statutory public health insurance (Techniker Krankenkasse). Culturally, I have attained a Goethe-Zertifikat B1 in German and plan to achieve B2 within my first semester to comfortably engage in student employment and daily German life.'
      );
    } else if (type === 'ausbildung') {
      setMotivationAnswer(
        'The German Duale Ausbildung system is globally recognized for integrating clinical hospital practice with state vocational schooling. I want to build a long-term healthcare career in Germany because the healthcare sector offers structured progression, fair remuneration from day one, and guaranteed employment upon qualification.'
      );
      setProfessionalFitAnswer(
        'My higher secondary education with a biology major and healthcare clinical shadowing in India gave me strong foundational patient-care principles. My vocational aptitude and empathy make me an ideal candidate for the 3-year Generalist Nursing (Pflegefachmann) curriculum.'
      );
      setFinancialCulturalAnswer(
        'The Duale Ausbildung pays an official monthly training stipend of €1,200 to €1,400, which completely covers my living expenses and health insurance in North Rhine-Westphalia without requiring a blocked account. I have completed my Goethe B2 German certificate to ensure seamless patient communication.'
      );
    } else {
      setMotivationAnswer(
        'Germany skilled immigration framework through the Chancenkarte (Opportunity Card) and EU Blue Card provides a direct, merit-based pathway for international software engineers. I wish to relocate to Germany to contribute to enterprise cloud modernization in cities like Berlin and Munich.'
      );
      setProfessionalFitAnswer(
        'With 6 years of progressive DevOps and cloud infrastructure tenure at enterprise scale, my recognized university degree and verified employment history provide 9 out of 6 points on the German statutory immigration grid, far surpassing the qualification threshold.'
      );
      setFinancialCulturalAnswer(
        'I possess verified liquid savings exceeding the €11,904 blocked account threshold to support myself during the initial job-seeking period. I hold an A2 German certificate and am actively studying towards B1 with Goethe-Institut to accelerate my path towards permanent residency in 21 months.'
      );
    }
    setActiveQuestionIndex(0);
  };

  const questions = [
    {
      title: 'Question 1: Motivation & Relocation Rationale',
      prompt: 'Why do you want to pursue your chosen pathway in Germany rather than India?',
      value: motivationAnswer,
      setter: setMotivationAnswer,
      score: evaluationResults.motivationScore,
      keywords: ['tuition-free', 'research', 'public university', 'daad', 'europe'],
      placeholder: 'Explain why German higher education or industry fits your personal and academic trajectory...',
    },
    {
      title: 'Question 2: Academic & Professional Fit',
      prompt: 'How does your educational background prepare you for your target program or job in Germany?',
      value: professionalFitAnswer,
      setter: setProfessionalFitAnswer,
      score: evaluationResults.professionalFitScore,
      keywords: ['ects', 'bachelor', 'gpa', 'coursework', 'experience', 'skills'],
      placeholder: 'Detail your undergraduate degree, ECTS credits, technical coursework, or vocational skills...',
    },
    {
      title: 'Question 3: Financial & Cultural Preparedness',
      prompt: 'How do you plan to handle the German language barrier and living expenses?',
      value: financialCulturalAnswer,
      setter: setFinancialCulturalAnswer,
      score: evaluationResults.financialCulturalScore,
      keywords: ['blocked account', 'sperrkonto', 'b1', 'b2', 'goethe', 'insurance'],
      placeholder: 'Describe your blocked account funding (€11,904), statutory insurance, and CEFR German level...',
    },
  ];

  const currentQ = questions[activeQuestionIndex];

  return (
    <div className={`space-y-6 ${isCompact ? 'p-2' : ''}`}>
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Real-Time Linguistic & Visa Realism Engine
          </span>
          <h2 className="text-xl font-bold text-slate-900">
            Interactive German Relocation Written Q&A Assessment
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluates argumentation strength, lexical diversity (TTR), LIX readability index, and embassy visa realism in real time as you type.
          </p>
        </div>

        {/* 1-Click Practice Answer Injectors */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-semibold text-[11px] hidden sm:inline">Load Sample Answers:</span>
          <button
            onClick={() => handleInjectSampleAnswers('study')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-700 font-semibold text-[11px] border border-slate-200 transition-colors"
          >
            🎓 Study Rationale
          </button>
          <button
            onClick={() => handleInjectSampleAnswers('ausbildung')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 font-semibold text-[11px] border border-slate-200 transition-colors"
          >
            🏥 Ausbildung Rationale
          </button>
          <button
            onClick={() => handleInjectSampleAnswers('chancenkarte')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-50 text-slate-700 font-semibold text-[11px] border border-slate-200 transition-colors"
          >
            💼 Chancenkarte Rationale
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Form & Live Linguistic Dashboard */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Question Tabs & Textarea */}
        <div className="lg:col-span-2 space-y-4">
          {/* Question Nav Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {questions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setActiveQuestionIndex(idx)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeQuestionIndex === idx
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>Part {idx + 1}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                  q.score >= 75 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-300'
                }`}>
                  {q.score}%
                </span>
              </button>
            ))}
          </div>

          {/* Active Question Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div>
              <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block mb-1">
                {currentQ.title}
              </span>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                "{currentQ.prompt}"
              </h3>
            </div>

            {/* Live Textarea with Keystroke Scoring */}
            <div className="relative">
              <textarea
                rows={7}
                value={currentQ.value}
                onChange={(e) => currentQ.setter(e.target.value)}
                placeholder={currentQ.placeholder}
                className="w-full text-xs p-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-sans"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 px-1 font-mono">
                <span>
                  Words: <strong className="text-slate-700">{currentQ.value.trim().split(/\s+/).filter(Boolean).length}</strong>
                </span>
                <span>
                  Section Readiness: <strong className="text-sky-700">{currentQ.score}%</strong>
                </span>
              </div>
            </div>

            {/* Quick Keyword Badges */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                Recommended Verification Keywords to Include:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentQ.keywords.map((kw, i) => {
                  const isPresent = currentQ.value.toLowerCase().includes(kw);
                  return (
                    <span
                      key={i}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all ${
                        isPresent
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}
                    >
                      {isPresent ? '✓ ' : '+ '} {kw}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Question Step Controls */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                disabled={activeQuestionIndex === 0}
                onClick={() => setActiveQuestionIndex(prev => prev - 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-30"
              >
                ← Previous Question
              </button>

              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                {isSaved ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                {isSaved ? 'Evaluation Saved!' : 'Save & Evaluate Q&A'}
              </button>

              <button
                disabled={activeQuestionIndex === questions.length - 1}
                onClick={() => setActiveQuestionIndex(prev => prev + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-30"
              >
                Next Question →
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Real-Time Open-Source Linguistic & Argument Evaluator Dashboard */}
        <div className="space-y-4">
          {/* Overall Coherence Gauge */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              <span>Visa Realism Score</span>
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
                      evaluationResults.overallCoherenceScore >= 75
                        ? 'text-emerald-500'
                        : evaluationResults.overallCoherenceScore >= 50
                        ? 'text-sky-500'
                        : 'text-amber-500'
                    }
                    strokeDasharray={`${evaluationResults.overallCoherenceScore}, 100`}
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute font-black text-xl text-slate-900">
                  {evaluationResults.overallCoherenceScore}%
                </div>
              </div>

              <div>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                  evaluationResults.overallCoherenceScore >= 75
                    ? 'bg-emerald-100 text-emerald-800'
                    : evaluationResults.overallCoherenceScore >= 50
                    ? 'bg-sky-100 text-sky-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {evaluationResults.overallCoherenceScore >= 75 ? 'Strong German Embassy Case' :
                   evaluationResults.overallCoherenceScore >= 50 ? 'Moderate Case (Needs Polish)' : 'Draft State'}
                </span>
                <p className="text-[11px] text-slate-500 mt-1 leading-tight">
                  Evaluated on linguistic richness, German legal terms, and institutional realism.
                </p>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Lexical Diversity:</span>
                <strong className="text-slate-800">{evaluationResults.typeTokenRatio}%</strong>
                <span className="text-[10px] text-slate-500 block">Type-Token Ratio</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl">
                <span className="text-slate-400 block text-[10px]">LIX Readability:</span>
                <strong className="text-slate-800">{evaluationResults.lixIndex}</strong>
                <span className="text-[10px] text-slate-500 block">
                  {evaluationResults.lixIndex > 50 ? 'Academic' : 'Conversational'}
                </span>
              </div>
            </div>
          </div>

          {/* Constructive Feedback Pills Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Real-Time Constructive Feedback:
            </h4>

            <div className="space-y-1.5">
              {evaluationResults.feedbackPills.map((pill, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-medium text-slate-800 leading-snug"
                >
                  {pill}
                </div>
              ))}
            </div>

            {/* Detected Keywords Tag Cloud */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Detected Legal & Technical Keywords ({evaluationResults.detectedKeywords.length}):
              </span>
              <div className="flex flex-wrap gap-1">
                {evaluationResults.detectedKeywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 text-[10px] font-semibold border border-sky-100"
                  >
                    ✓ {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      {(onBack || onNext) && (
        <div className="flex justify-between pt-4 border-t border-slate-200/70">
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          )}

          {onNext && (
            <button
              onClick={async () => {
                await handleSave();
                onNext();
              }}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm ml-auto"
            >
              Next: Visa Math & Gap Analysis <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
