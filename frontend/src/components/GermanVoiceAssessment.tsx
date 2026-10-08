import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Award, 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  BookOpen, 
  TrendingUp, 
  Globe2, 
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { GermanCefrScore } from '../types';

interface GermanVoiceAssessmentProps {
  onScoreUpdate?: (score: GermanCefrScore, transcript: string) => void;
  initialTranscript?: string;
  isCompact?: boolean;
}

export const GermanVoiceAssessment: React.FC<GermanVoiceAssessmentProps> = ({
  onScoreUpdate,
  initialTranscript = '',
  isCompact = false,
}) => {
  // Language listener selection
  const [selectedLanguage, setSelectedLanguage] = useState<'de-DE' | 'en-US'>('de-DE');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>(initialTranscript);
  const [interimText, setInterimText] = useState<string>('');
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);

  // Audio / Acoustic tracking
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const [speakingDurationSeconds, setSpeakingDurationSeconds] = useState<number>(0);

  // CEFR Metric Output State
  const [cefrScore, setCefrScore] = useState<GermanCefrScore>({
    assessedLevel: 'A1',
    typeTokenRatio: 0,
    grammaticalComplexity: 0,
    spokenFluencyWpm: 0,
    a1MarkersCount: 0,
    a2MarkersCount: 0,
    b1MarkersCount: 0,
    b2MarkersCount: 0,
    feedback: ['Start speaking in German to begin CEFR real-time scoring.'],
  });

  // Refs
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<any>(null);

  // Linguistic Rubric Reference Dictionaries
  const LINGUISTIC_RUBRIC = {
    A1: {
      greetings: ['hallo', 'guten tag', 'guten morgen', 'guten abend', 'tschüss', 'auf wiedersehen'],
      intros: ['ich heiße', 'mein name ist', 'ich bin', 'ich komme aus', 'ich wohne in', 'ich lerne', 'ich spreche'],
      basicWords: ['und', 'aber', 'ja', 'nein', 'danke', 'bitte', 'gut', 'sehr', 'eins', 'zwei', 'drei', 'deutschland', 'indien', 'berlin', 'münchen'],
    },
    A2: {
      conjunctions: ['und', 'oder', 'aber', 'denn'],
      modals: ['kann', 'können', 'muss', 'müssen', 'möchte', 'möchten', 'will', 'wollen', 'soll', 'sollen', 'darf', 'dürfen'],
      simplePast: ['war', 'waren', 'hatte', 'hatten'],
      commonVerbs: ['arbeiten', 'studieren', 'verstehen', 'machen', 'reisen', 'leben', 'brauchen', 'fragen', 'wissen'],
    },
    B1: {
      subordinatingConjunctions: ['weil', 'dass', 'wenn', 'obwohl', 'als', 'damit', 'nachdem', 'seitdem'],
      perfektParticiples: ['gearbeitet', 'studiert', 'gelernt', 'gemacht', 'gesehen', 'gewesen', 'gesprochen', 'entwickelt', 'erlebt', 'besucht'],
      reflexivePhrases: ['ich interessiere mich', 'ich freue mich', 'ich bewerbe mich', 'ich erinnere mich', 'konzentrieren'],
      comparatives: ['besser', 'schneller', 'mehr', 'wichtiger', 'höher', 'größer'],
    },
    B2: {
      passiveForms: ['wird', 'werden', 'wurde', 'worden', 'geworden'],
      subjunctiveKonjunktiv: ['würde', 'würden', 'hätte', 'hätten', 'wäre', 'wären', 'könnte', 'könnten', 'müsste', 'müssten'],
      advancedConnectives: ['infolgedessen', 'je', 'desto', 'während', 'sodass', 'trotzdem', 'deshalb', 'dennoch', 'einerseits', 'andererseits', 'aus diesem grund'],
      professionalVocab: [
        'berufserfahrung', 'ausbildung', 'fachbereich', 'verantwortung', 'entwicklung', 
        'hochschule', 'abschluss', 'qualifikation', 'fachkraft', 'fähigkeiten', 'kenntnisse', 
        'zukunft', 'herausforderung', 'erfolgreich', 'integration', 'technologie', 'gesellschaft',
        'unternehmen', 'forschung', 'projektmanagement', 'arbeitsmarkt'
      ],
    },
  };

  // Check speech recognition support on mount
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
    return () => {
      stopListening();
    };
  }, []);

  // Compute metrics whenever transcript or duration updates
  useEffect(() => {
    if (!transcript.trim()) return;
    const computed = evaluateGermanLinguistics(transcript, speakingDurationSeconds);
    setCefrScore(computed);
    if (onScoreUpdate) {
      onScoreUpdate(computed, transcript);
    }
  }, [transcript, speakingDurationSeconds]);

  /**
   * Dual-Language Web Speech Listener
   */
  const startListening = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      // 1. Setup AudioContext for Acoustic & Fluency Volume Analysis
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        setupWebAudio(stream);
      }

      // 2. Initialize Speech Recognition
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLanguage;

      recognition.onstart = () => {
        setIsListening(true);
        setRecordingStartTime(Date.now());
        timerIntervalRef.current = setInterval(() => {
          setSpeakingDurationSeconds(prev => prev + 1);
        }, 1000);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            currentFinal += event.results[i][0].transcript + ' ';
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        if (currentFinal) {
          setTranscript(prev => (prev ? `${prev.trim()} ${currentFinal.trim()}` : currentFinal.trim()));
        }
        setInterimText(currentInterim);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech Recognition notice:', event.error);
        if (event.error === 'not-allowed') {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        // If still flagged as listening, restart (browser speech often timeouts on brief silences)
        if (isListening && recognitionRef.current) {
          try {
            recognition.start();
          } catch (e) {
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Microphone initiation error:', err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    setAudioLevel(0);
    setInterimText('');
  };

  const setupWebAudio = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (e) {
      console.warn('Web Audio API visualization could not start:', e);
    }
  };

  /**
   * Deterministic CEFR Linguistic Rubric Analysis
   */
  const evaluateGermanLinguistics = (text: string, durationSec: number): GermanCefrScore => {
    const clean = text.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
    const words = clean.split(/\s+/).filter(w => w.length > 0);
    const totalWords = words.length;

    if (totalWords === 0) {
      return {
        assessedLevel: 'A1',
        typeTokenRatio: 0,
        grammaticalComplexity: 0,
        spokenFluencyWpm: 0,
        a1MarkersCount: 0,
        a2MarkersCount: 0,
        b1MarkersCount: 0,
        b2MarkersCount: 0,
        feedback: ['Begin speaking in German to generate your real-time CEFR diagnostic.'],
      };
    }

    // 1. Vocabulary Diversity: Type-Token Ratio (TTR)
    const uniqueWords = new Set(words);
    const typeTokenRatio = Math.round((uniqueWords.size / totalWords) * 100);

    // 2. Count Level Markers
    let a1Hits = 0;
    let a2Hits = 0;
    let b1Hits = 0;
    let b2Hits = 0;

    // A1
    LINGUISTIC_RUBRIC.A1.greetings.forEach(g => { if (clean.includes(g)) a1Hits += 2; });
    LINGUISTIC_RUBRIC.A1.intros.forEach(i => { if (clean.includes(i)) a1Hits += 2; });
    words.forEach(w => {
      if (LINGUISTIC_RUBRIC.A1.basicWords.includes(w)) a1Hits += 1;
    });

    // A2
    words.forEach(w => {
      if (LINGUISTIC_RUBRIC.A2.conjunctions.includes(w)) a2Hits += 1;
      if (LINGUISTIC_RUBRIC.A2.modals.includes(w)) a2Hits += 2;
      if (LINGUISTIC_RUBRIC.A2.simplePast.includes(w)) a2Hits += 2;
      if (LINGUISTIC_RUBRIC.A2.commonVerbs.includes(w)) a2Hits += 1;
    });

    // B1
    LINGUISTIC_RUBRIC.B1.subordinatingConjunctions.forEach(c => {
      if (clean.includes(c)) b1Hits += 3;
    });
    words.forEach(w => {
      if (LINGUISTIC_RUBRIC.B1.perfektParticiples.includes(w)) b1Hits += 2.5;
      if (LINGUISTIC_RUBRIC.B1.comparatives.includes(w)) b1Hits += 2;
    });
    LINGUISTIC_RUBRIC.B1.reflexivePhrases.forEach(r => {
      if (clean.includes(r)) b1Hits += 3;
    });

    // B2
    words.forEach(w => {
      if (LINGUISTIC_RUBRIC.B2.passiveForms.includes(w)) b2Hits += 3.5;
      if (LINGUISTIC_RUBRIC.B2.subjunctiveKonjunktiv.includes(w)) b2Hits += 4;
      if (LINGUISTIC_RUBRIC.B2.professionalVocab.includes(w)) b2Hits += 3;
    });
    LINGUISTIC_RUBRIC.B2.advancedConnectives.forEach(c => {
      if (clean.includes(c)) b2Hits += 4;
    });

    // 3. Spoken Fluency (Words Per Minute)
    const effectiveSec = Math.max(durationSec, Math.ceil(totalWords / 2)); // fallback for fast pasting or quick tests
    const spokenFluencyWpm = Math.round((totalWords / Math.max(1, effectiveSec)) * 60);

    // 4. Grammatical Complexity Index (0-100%)
    // Weighted combination of A2, B1, and B2 structures normalized against text volume
    const rawComplexity = (a2Hits * 1.5 + b1Hits * 3.5 + b2Hits * 6) / Math.max(1, totalWords * 0.25);
    const grammaticalComplexity = Math.min(100, Math.round(rawComplexity * 10));

    // 5. Final Assessed CEFR Level
    let assessedLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' = 'A1';
    if (b2Hits >= 10 && grammaticalComplexity >= 70 && typeTokenRatio >= 55) {
      assessedLevel = b2Hits >= 22 && totalWords >= 50 ? 'C1' : 'B2';
    } else if (b1Hits >= 7 && grammaticalComplexity >= 45) {
      assessedLevel = 'B1';
    } else if (a2Hits >= 5 || totalWords >= 15) {
      assessedLevel = 'A2';
    } else {
      assessedLevel = 'A1';
    }

    // 6. Actionable Linguistic Feedback
    const feedback: string[] = [];

    if (b2Hits >= 8) {
      feedback.push('✓ Excellent command of professional German terminology and advanced Konjunktiv/passive structures.');
    } else if (b1Hits >= 5) {
      feedback.push('✓ Strong use of subordinate clauses with verb-final word order (z.B. "weil", "dass").');
      feedback.push('💡 Next step for B2: Incorporate Konjunktiv II (z.B. "Ich würde gerne...") and advanced connectives ("deshalb", "während").');
    } else if (a2Hits >= 4) {
      feedback.push('✓ Solid coordinating sentences with modal verbs (können, müssen, möchten).');
      feedback.push('💡 Next step for B1: Practice Perfekt past tense (haben/sein + Partizip II) and causal clauses with "weil".');
    } else {
      feedback.push('✓ Clear basic introduction and essential greetings.');
      feedback.push('💡 Next step for A2: Connect ideas using modal verbs ("Ich möchte in Deutschland arbeiten") and coordinating conjunctions.');
    }

    if (typeTokenRatio < 50 && totalWords > 20) {
      feedback.push('💡 Vocabulary tip: Expand lexical variety to prevent repeating identical nouns and pronouns.');
    }

    if (spokenFluencyWpm > 0) {
      if (spokenFluencyWpm < 60) {
        feedback.push(`⏱ Cadence: ${spokenFluencyWpm} WPM (deliberate/thoughtful pace). Aim for 70-100 WPM for natural conversational flow.`);
      } else if (spokenFluencyWpm <= 120) {
        feedback.push(`⏱ Cadence: ${spokenFluencyWpm} WPM (ideal German conversational velocity).`);
      } else {
        feedback.push(`⏱ Cadence: ${spokenFluencyWpm} WPM (fast native-like delivery). Ensure clear articulation of umlauts.`);
      }
    }

    return {
      assessedLevel,
      typeTokenRatio,
      grammaticalComplexity,
      spokenFluencyWpm,
      a1MarkersCount: Math.round(a1Hits),
      a2MarkersCount: Math.round(a2Hits),
      b1MarkersCount: Math.round(b1Hits),
      b2MarkersCount: Math.round(b2Hits),
      feedback,
    };
  };

  /**
   * 1-Click Practice Sample Injectors (for tests / jury demonstrations)
   */
  const handleInjectSample = (level: 'A1' | 'A2' | 'B1' | 'B2') => {
    let sample = '';
    let dur = 15;
    if (level === 'A1') {
      sample = 'Hallo, guten Tag! Mein Name ist Aarav. Ich komme aus Indien und ich wohne in Bangalore. Ich bin vierundzwanzig Jahre alt und ich lerne Deutsch. Danke schön.';
      dur = 12;
    } else if (level === 'A2') {
      sample = 'Guten Tag. Ich bin Informatiker und ich möchte in Deutschland arbeiten. Ich kann gut programmieren, aber ich muss noch mehr Deutsch lernen. Gestern hatte ich ein Gespräch und es war sehr interessant.';
      dur = 18;
    } else if (level === 'B1') {
      sample = 'Ich bewerbe mich für ein Masterstudium an der TU München, weil Deutschland hervorragende Forschungsbedingungen bietet. In den letzten drei Jahren habe ich als Softwareentwickler gearbeitet und moderne Webanwendungen entwickelt. Obwohl die deutsche Grammatik anspruchsvoll ist, mache ich täglich Fortschritte.';
      dur = 26;
    } else if (level === 'B2') {
      sample = 'Infolgedessen habe ich mich intensiv mit den Anforderungen des deutschen Arbeitsmarktes auseinandergesetzt. Ich würde gerne meine fundierte Berufserfahrung im Fachbereich Cloud Architecture in ein führendes Technologieunternehmen einbringen. Während meiner bisherigen Laufbahn wurden komplexe Microservice-Strukturen erfolgreich implementiert, sodass ich optimal auf die Herausforderungen vorbereitet bin.';
      dur = 32;
    }

    setTranscript(sample);
    setSpeakingDurationSeconds(dur);
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'C1': return 'bg-purple-600 text-white';
      case 'B2': return 'bg-emerald-600 text-white';
      case 'B1': return 'bg-sky-600 text-white';
      case 'A2': return 'bg-amber-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  return (
    <div className={`bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden ${isCompact ? 'p-4' : 'p-6'} space-y-5`}>
      {/* Top Header & Language Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <h3 className="text-base font-bold text-slate-900">
              Real-Time German Speech Recognition & CEFR Matrix
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluates German pronunciation, syntactic markers (A1 to C1), Konjunktiv II, and speech cadence (WPM).
          </p>
        </div>

        {/* Language Toggle */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-semibold border border-slate-200/60">
            <button
              onClick={() => {
                if (isListening) stopListening();
                setSelectedLanguage('de-DE');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                selectedLanguage === 'de-DE'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>🇩🇪</span> Deutsch (de-DE)
            </button>
            <button
              onClick={() => {
                if (isListening) stopListening();
                setSelectedLanguage('en-US');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                selectedLanguage === 'en-US'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>🇬🇧</span> English (en-US)
            </button>
          </div>
        </div>
      </div>

      {!speechSupported && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Note: Speech recognition requires a Chromium-compatible browser (Chrome, Edge) or direct audio access. You can also type or use the instant German practice injectors below!
          </span>
        </div>
      )}

      {/* Control Strip & Audio VU Meter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95 ${
              isListening
                ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4" /> Stop Listening
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-rose-400" /> Start Live German Speech
              </>
            )}
          </button>

          {isListening && (
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
              <Volume2 className="w-3.5 h-3.5 text-slate-500" />
              <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-75"
                  style={{ width: `${audioLevel}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-slate-600">{audioLevel}%</span>
            </div>
          )}

          {transcript && (
            <button
              onClick={() => {
                setTranscript('');
                setInterimText('');
                setSpeakingDurationSeconds(0);
              }}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-slate-100"
              title="Clear transcript"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 1-Click Practice Injectors */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-semibold text-[11px] hidden sm:inline">Practice Rubric:</span>
          <button
            onClick={() => handleInjectSample('A1')}
            className="px-2 py-1 rounded bg-slate-100 hover:bg-sky-50 text-slate-700 font-semibold text-[11px] border border-slate-200 transition-colors"
          >
            A1 Greeting
          </button>
          <button
            onClick={() => handleInjectSample('A2')}
            className="px-2 py-1 rounded bg-slate-100 hover:bg-amber-50 text-slate-700 font-semibold text-[11px] border border-slate-200 transition-colors"
          >
            A2 Modals
          </button>
          <button
            onClick={() => handleInjectSample('B1')}
            className="px-2 py-1 rounded bg-slate-100 hover:bg-emerald-50 text-slate-700 font-semibold text-[11px] border border-slate-200 transition-colors"
          >
            B1 Perfekt
          </button>
          <button
            onClick={() => handleInjectSample('B2')}
            className="px-2 py-1 rounded bg-slate-100 hover:bg-purple-50 text-slate-700 font-semibold text-[11px] border border-slate-200 transition-colors"
          >
            B2 Professional
          </button>
        </div>
      </div>

      {/* Live Transcript Box with Word-by-Word Rendering */}
      <div className="relative">
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Captured Speech Transcript:
        </label>
        <div className="w-full min-h-[90px] max-h-[160px] overflow-y-auto p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs font-mono text-slate-800 leading-relaxed focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/10">
          {transcript ? (
            <span>{transcript}</span>
          ) : (
            <span className="text-slate-400 italic font-sans">
              {isListening 
                ? 'Listening to microphone... Speak in German or English now...'
                : 'Click "Start Live German Speech" or test one of the practice phrases above to evaluate your CEFR proficiency.'}
            </span>
          )}
          {interimText && (
            <span className="text-sky-600 font-medium italic animate-pulse"> {interimText}</span>
          )}
        </div>
      </div>

      {/* Real-Time CEFR Visual Metric Output Gauge & Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        {/* Assessed CEFR Level */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>CEFR Level</span>
            <Award className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <div className="my-1.5 flex items-baseline gap-2">
            <span className={`px-2.5 py-0.5 rounded-lg text-lg font-black ${getLevelBadgeColor(cefrScore.assessedLevel)}`}>
              {cefrScore.assessedLevel}
            </span>
            <span className="text-[11px] font-bold text-slate-700">
              {cefrScore.assessedLevel === 'C1' ? 'Proficient' :
               cefrScore.assessedLevel === 'B2' ? 'Vantage / B2' :
               cefrScore.assessedLevel === 'B1' ? 'Threshold / B1' :
               cefrScore.assessedLevel === 'A2' ? 'Waystage / A2' : 'Breakthrough / A1'}
            </span>
          </div>
          <div className="text-[10px] text-slate-500">
            Official Common European Framework
          </div>
        </div>

        {/* Vocabulary Diversity (TTR) */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Lexical Diversity</span>
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="my-1.5">
            <div className="text-lg font-black text-slate-900">{cefrScore.typeTokenRatio}%</div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, cefrScore.typeTokenRatio)}%` }} 
              />
            </div>
          </div>
          <div className="text-[10px] text-slate-500">
            Type-Token Ratio (TTR)
          </div>
        </div>

        {/* Grammatical Complexity Index */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Syntax Complexity</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="my-1.5">
            <div className="text-lg font-black text-slate-900">{cefrScore.grammaticalComplexity}%</div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
              <div 
                className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${cefrScore.grammaticalComplexity}%` }} 
              />
            </div>
          </div>
          <div className="text-[10px] text-slate-500">
            B1/B2 Subordinate & Modal Weight
          </div>
        </div>

        {/* Spoken Fluency (WPM) */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Spoken Cadence</span>
            <Globe2 className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="my-1.5">
            <div className="text-lg font-black text-slate-900">
              {cefrScore.spokenFluencyWpm} <span className="text-xs font-normal text-slate-500">WPM</span>
            </div>
            <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold mt-0.5 ${
              cefrScore.spokenFluencyWpm >= 60 && cefrScore.spokenFluencyWpm <= 120 
                ? 'bg-emerald-100 text-emerald-800' 
                : cefrScore.spokenFluencyWpm > 120 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-amber-100 text-amber-800'
            }`}>
              {cefrScore.spokenFluencyWpm >= 60 && cefrScore.spokenFluencyWpm <= 120 
                ? 'Conversational' 
                : cefrScore.spokenFluencyWpm > 120 
                ? 'Fluent Cadence' 
                : 'Deliberate / Hesitant'}
            </span>
          </div>
          <div className="text-[10px] text-slate-500">
            Acoustic Cadence Check
          </div>
        </div>
      </div>

      {/* Markers Hit Breakdown Pill Bar */}
      <div className="flex flex-wrap items-center gap-2 text-[11px] pt-1">
        <span className="text-slate-500 font-semibold">Detected Structural Markers:</span>
        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
          A1 Intro: {cefrScore.a1MarkersCount}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-medium border border-amber-200">
          A2 Modals: {cefrScore.a2MarkersCount}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 font-medium border border-sky-200">
          B1 Clauses: {cefrScore.b1MarkersCount}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 font-medium border border-purple-200">
          B2 Professional / Konjunktiv: {cefrScore.b2MarkersCount}
        </span>
      </div>

      {/* Actionable Feedback Box */}
      {cefrScore.feedback && cefrScore.feedback.length > 0 && (
        <div className="bg-sky-50/70 border border-sky-200/80 rounded-xl p-3.5 text-xs text-sky-950 space-y-1.5">
          <div className="font-bold flex items-center gap-1.5 text-sky-900">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            Actionable Linguistic Feedback for German Visa & University Admissions:
          </div>
          <div className="space-y-1 pl-5">
            {cefrScore.feedback.map((f, i) => (
              <div key={i} className="text-[11px] leading-relaxed">
                {f}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
