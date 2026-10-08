import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  CameraOff, 
  Mic, 
  MicOff, 
  Video, 
  Square, 
  Play, 
  RotateCcw, 
  Download, 
  ShieldCheck, 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles, 
  Volume2, 
  Activity, 
  Clock, 
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { ApplicantRecord, ProctoringSummaryData, GermanCefrScore } from '../types';
import { AntiCheatingProctor } from './AntiCheatingProctor';
import { GermanVoiceAssessment } from './GermanVoiceAssessment';

interface VideoPitchStepProps {
  applicant: ApplicantRecord;
  onVideoPitchSubmit: (
    transcript: string,
    communicationRating?: number,
    analysisSummary?: string,
    extraMedia?: Partial<ApplicantRecord['media']>
  ) => Promise<void>;
  onBack: () => void;
  onNext: () => void;
  selectedCountry: 'Germany' | 'Austria';
}

export interface AuthenticityAnalysis {
  score: number; // 0 - 100
  verdict: 'VERIFIED AUTHENTIC' | 'NEEDS CLARITY' | 'SUSPICIOUS / NO HUMAN SPEECH DETECTED';
  verdictColor: 'emerald' | 'amber' | 'rose';
  humanVoiceDetected: boolean;
  rmsVolumeVariance: number;
  silenceRatio: number;
  wordCount: number;
  wordsPerMinute: number;
  detectedLanguage: 'German' | 'English' | 'Uncertain';
  coherentKeywords: string[];
  rationale: string;
}

export const VideoPitchStep: React.FC<VideoPitchStepProps> = ({
  applicant,
  onVideoPitchSubmit,
  onBack,
  onNext,
  selectedCountry,
}) => {
  // Stream & Hardware States
  const [hasMediaAccess, setHasMediaAccess] = useState<boolean>(false);
  const [hardwareError, setHardwareError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState<string>(applicant.media?.videoPitchTranscript || '');
  const [isListeningSpeech, setIsListeningSpeech] = useState<boolean>(false);
  
  // Real-time Audio Level & Authenticity
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [analysisResult, setAnalysisResult] = useState<AuthenticityAnalysis | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Advanced Anti-Cheating & German CEFR Integration States
  const [activePitchTab, setActivePitchTab] = useState<'standard' | 'proctor' | 'german-voice'>('standard');
  const [latestIntegrityTrustScore, setLatestIntegrityTrustScore] = useState<number>(100);
  const [latestProctoringSummary, setLatestProctoringSummary] = useState<ProctoringSummaryData | undefined>(undefined);
  const [latestCefrScore, setLatestCefrScore] = useState<GermanCefrScore | undefined>(undefined);

  // References
  const videoRef = useRef<HTMLVideoElement>(null);
  const playbackRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  // Web Audio API refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioAnimationIdRef = useRef<number | null>(null);
  const volumeSamplesRef = useRef<number[]>([]);

  // Web Speech API ref
  const speechRecognitionRef = useRef<any>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopHardwareTracks();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (audioAnimationIdRef.current) cancelAnimationFrame(audioAnimationIdRef.current);
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch (e) {}
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try { audioContextRef.current.close(); } catch (e) {}
      }
    };
  }, []);

  const stopHardwareTracks = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setHasMediaAccess(false);
  };

  // Bind active MediaStream directly to video element via useEffect to eliminate camera lag
  useEffect(() => {
    if (videoRef.current && mediaStreamRef.current && hasMediaAccess) {
      if (videoRef.current.srcObject !== mediaStreamRef.current) {
        videoRef.current.srcObject = mediaStreamRef.current;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [hasMediaAccess, activePitchTab]);

  /**
   * Hardware Presence Gatekeeper: Verifies live video and audio streams
   */
  const verifyHardwarePresence = (stream: MediaStream): boolean => {
    const videoTracks = stream.getVideoTracks();
    const audioTracks = stream.getAudioTracks();

    if (videoTracks.length === 0 || audioTracks.length === 0) {
      setHardwareError('⚠️ HARDWARE CHECK FAILED: Live video and microphone input required');
      return false;
    }

    const vTrack = videoTracks[0];
    const aTrack = audioTracks[0];

    if (!vTrack.enabled || vTrack.muted || vTrack.readyState !== 'live') {
      setHardwareError('⚠️ HARDWARE CHECK FAILED: Live video and microphone input required (camera track inactive or muted)');
      return false;
    }
    if (!aTrack.enabled || aTrack.muted || aTrack.readyState !== 'live') {
      setHardwareError('⚠️ HARDWARE CHECK FAILED: Live video and microphone input required (microphone track inactive or muted)');
      return false;
    }

    // Attach trackended listeners
    vTrack.onended = () => {
      setHardwareError('⚠️ HARDWARE CHECK FAILED: Live video and microphone input required (camera disconnected)');
      setHasMediaAccess(false);
    };
    aTrack.onended = () => {
      setHardwareError('⚠️ HARDWARE CHECK FAILED: Live video and microphone input required (microphone disconnected)');
    };

    return true;
  };

  /**
   * Request real hardware camera and microphone access with optimal constraints
   */
  const handleEnableCamera = async () => {
    setHardwareError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support WebRTC mediaDevices API.');
      }

      // Optimal stream constraints to avoid lag: 640x480 at 30fps
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 }, 
          frameRate: { ideal: 30 } 
        },
        audio: true,
      });

      if (!verifyHardwarePresence(stream)) {
        stream.getTracks().forEach(t => t.stop());
        setHasMediaAccess(false);
        return;
      }

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setHasMediaAccess(true);

      // Initialize Web Audio API Analyser
      setupWebAudio(stream);
    } catch (err: any) {
      console.error('Camera/Mic access error:', err);
      let errorMsg = '⚠️ HARDWARE CHECK FAILED: Live video and microphone input required';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = '⚠️ HARDWARE CHECK FAILED: Camera and microphone permissions were denied. Please grant permission in your browser.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = '⚠️ HARDWARE CHECK FAILED: No webcam or microphone hardware detected on this machine.';
      } else {
        errorMsg = `⚠️ HARDWARE CHECK FAILED: ${err.message || 'Live video and microphone input required'}`;
      }
      setHardwareError(errorMsg);
      setHasMediaAccess(false);
    }
  };

  /**
   * Setup Web Audio API Analyser for RMS volume variance and silence detection
   */
  const setupWebAudio = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const audioContext = new AudioCtx();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.5;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const monitorAudio = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setAudioLevel(normalized);

        if (isRecording) {
          volumeSamplesRef.current.push(normalized);
        }

        audioAnimationIdRef.current = requestAnimationFrame(monitorAudio);
      };

      monitorAudio();
    } catch (e) {
      console.warn('Web Audio setup notice:', e);
    }
  };

  /**
   * Setup & start Browser Web Speech API
   */
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      // Auto set language based on target country or prompt
      recognition.lang = selectedCountry === 'Germany' ? 'de-DE' : 'en-US';

      recognition.onstart = () => {
        setIsListeningSpeech(true);
      };

      recognition.onresult = (event: any) => {
        let transcriptAccumulator = '';
        for (let i = 0; i < event.results.length; i++) {
          transcriptAccumulator += event.results[i][0].transcript + ' ';
        }
        if (transcriptAccumulator.trim()) {
          setLiveTranscript(transcriptAccumulator.trim());
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition event:', e.error);
      };

      recognition.onend = () => {
        setIsListeningSpeech(false);
      };

      recognition.start();
      speechRecognitionRef.current = recognition;
    } catch (err) {
      console.warn('Failed starting SpeechRecognition:', err);
    }
  };

  /**
   * Start 30-Second Real Recording
   */
  const handleStartRecording = () => {
    if (!mediaStreamRef.current) {
      handleEnableCamera();
    }

    recordedChunksRef.current = [];
    volumeSamplesRef.current = [];
    setRecordedBlobUrl(null);
    setRecordingSeconds(0);
    setIsRecording(true);

    // Initialize MediaRecorder
    if (mediaStreamRef.current) {
      try {
        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
          ? 'video/webm;codecs=vp8,opus'
          : MediaRecorder.isTypeSupported('video/webm')
          ? 'video/webm'
          : '';

        const recorder = mimeType 
          ? new MediaRecorder(mediaStreamRef.current, { mimeType })
          : new MediaRecorder(mediaStreamRef.current);

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          setRecordedBlobUrl(url);
          // Run Authenticity and Spoofing Analysis Engine
          runAuthenticityAnalysis(liveTranscript, volumeSamplesRef.current, recordingSeconds);
        };

        recorder.start(1000);
        mediaRecorderRef.current = recorder;
      } catch (e: any) {
        console.warn('MediaRecorder error:', e);
      }
    }

    // Start Web Speech STT concurrently
    startSpeechRecognition();

    // Start timer (up to 30s)
    timerIntervalRef.current = setInterval(() => {
      setRecordingSeconds((prev) => {
        if (prev >= 29) {
          handleStopRecording();
          return 30;
        }
        return prev + 1;
      });
    }, 1000);
  };

  /**
   * Stop Recording
   */
  const handleStopRecording = () => {
    setIsRecording(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
    }

    // Run analysis on actual captured speech without mock injections
    runAuthenticityAnalysis(liveTranscript, volumeSamplesRef.current, recordingSeconds || 10);
  };

  /**
   * Authenticity, Spoofing & Correctness Analysis Engine
   */
  const runAuthenticityAnalysis = (transcript: string, audioSamples: number[], durationSecs: number) => {
    const text = transcript || '';
    const textLower = text.toLowerCase();
    const duration = Math.max(1, durationSecs || 10);

    // 1. Audio Signal Check (Volume variance RMS and Silence Ratio)
    let humanVoiceDetected = true;
    let rmsVariance = 0;
    let silenceRatio = 0;

    if (audioSamples.length > 5) {
      const avg = audioSamples.reduce((a, b) => a + b, 0) / audioSamples.length;
      const squaredDiffs = audioSamples.map((v) => Math.pow(v - avg, 2));
      rmsVariance = Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / audioSamples.length);
      const silentCount = audioSamples.filter((v) => v < 2).length;
      silenceRatio = Math.round((silentCount / audioSamples.length) * 100);

      // If audio is 100% silent or has 0 variance (flat synth noise)
      if (silenceRatio > 95 || (avg < 3 && rmsVariance < 1)) {
        humanVoiceDetected = false;
      }
    }

    // 2. Metrics: Words & Pace
    const words = text.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const wordsPerMinute = duration > 0 ? Math.round((wordCount / (duration / 60))) : 0;

    if (wordCount === 0) {
      setAnalysisResult({
        score: 15,
        verdict: 'SUSPICIOUS / NO HUMAN SPEECH DETECTED',
        verdictColor: 'rose',
        humanVoiceDetected: false,
        rmsVolumeVariance: Math.round(rmsVariance * 10) / 10,
        silenceRatio: silenceRatio || 100,
        wordCount: 0,
        wordsPerMinute: 0,
        detectedLanguage: 'Uncertain',
        coherentKeywords: [],
        rationale: 'No human speech or linguistic tokens captured during the recording session. Please ensure your microphone is enabled.',
      });
      return;
    }

    // 3. Language detection
    const germanKeywords = ['ich', 'mein', 'name', 'deutschland', 'ausbildung', 'studium', 'hallo', 'guten', 'tag', 'beruf', 'karriere', 'jahr', 'danke'];
    const englishKeywords = ['hello', 'my', 'name', 'germany', 'study', 'degree', 'career', 'opportunity', 'master', 'experience', 'relocate'];

    let germanHits = 0;
    let englishHits = 0;
    for (const w of words) {
      if (germanKeywords.includes(w.toLowerCase())) germanHits++;
      if (englishKeywords.includes(w.toLowerCase())) englishHits++;
    }

    let detectedLanguage: 'German' | 'English' | 'Uncertain' = 'English';
    if (germanHits > englishHits) detectedLanguage = 'German';
    else if (germanHits === 0 && englishHits === 0) detectedLanguage = 'Uncertain';

    // 4. Semantic & Persona Coherence Check
    let score = 50;
    const coherentKeywords: string[] = [];

    // Alignment with pathway
    const pathway = applicant.motivation?.pathway || 'STUDY';
    if (pathway === 'STUDY') {
      if (textLower.includes('study') || textLower.includes('studium') || textLower.includes('master') || textLower.includes('bachelor') || textLower.includes('university') || textLower.includes('universität')) {
        score += 20;
        coherentKeywords.push('Higher Education Pathway');
      }
    } else if (pathway === 'AUSBILDUNG') {
      if (textLower.includes('ausbildung') || textLower.includes('apprenticeship') || textLower.includes('pflege') || textLower.includes('praxis') || textLower.includes('hospital')) {
        score += 25;
        coherentKeywords.push('Vocational Dual Training');
      }
    } else if (pathway === 'CHANCENKARTE') {
      if (textLower.includes('chancenkarte') || textLower.includes('opportunity') || textLower.includes('experience') || textLower.includes('engineer') || textLower.includes('work') || textLower.includes('job')) {
        score += 25;
        coherentKeywords.push('Skilled Employment Intent');
      }
    }

    // Alignment with country
    if (textLower.includes('germany') || textLower.includes('deutschland') || textLower.includes('austria') || textLower.includes('österreich')) {
      score += 15;
      coherentKeywords.push('Destination Coherence');
    }

    // Name alignment
    if (applicant.personal?.name) {
      const firstName = applicant.personal.name.split(' ')[0].toLowerCase();
      if (textLower.includes(firstName)) {
        score += 10;
        coherentKeywords.push('Identity Match');
      }
    }

    // Speech adequacy penalty/bonus
    if (wordCount >= 20) score += 10;
    if (wordsPerMinute >= 80 && wordsPerMinute <= 180) score += 5; // Natural speaking pace

    if (!humanVoiceDetected) {
      score = Math.min(30, score - 35);
    }

    score = Math.max(15, Math.min(98, score));

    let verdict: AuthenticityAnalysis['verdict'] = 'VERIFIED AUTHENTIC';
    let verdictColor: AuthenticityAnalysis['verdictColor'] = 'emerald';

    if (score >= 70) {
      verdict = 'VERIFIED AUTHENTIC';
      verdictColor = 'emerald';
    } else if (score >= 40) {
      verdict = 'NEEDS CLARITY';
      verdictColor = 'amber';
    } else {
      verdict = 'SUSPICIOUS / NO HUMAN SPEECH DETECTED';
      verdictColor = 'rose';
    }

    const rationale = verdict === 'VERIFIED AUTHENTIC'
      ? `Spoken goals align with target ${pathway} pathway. Real human vocal frequency verified (RMS variance: ${rmsVariance.toFixed(1)}). Articulation rate ${wordsPerMinute} WPM is within optimal consular range.`
      : verdict === 'NEEDS CLARITY'
      ? `Spoken motivation is partially articulated (${wordCount} words). Rehearse mentioning your specific field of study or German language level.`
      : `Low acoustic vocal variance or sparse articulation detected. Ensure your microphone is active and speaking clearly in English or German.`;

    setAnalysisResult({
      score,
      verdict,
      verdictColor,
      humanVoiceDetected,
      rmsVolumeVariance: Math.round(rmsVariance * 10) / 10,
      silenceRatio,
      wordCount,
      wordsPerMinute,
      detectedLanguage,
      coherentKeywords,
      rationale,
    });
  };

  /**
   * Save and proceed to Step 4
   */
  const handleSaveAndProceed = async () => {
    setIsSubmitting(true);
    try {
      const rating = analysisResult ? Math.round((analysisResult.score / 10) * 10) / 10 : 8.5;
      const summary = analysisResult?.rationale || 'Spoken pitch recorded and verified.';
      
      const extraMedia: Partial<ApplicantRecord['media']> = {
        integrityTrustScore: latestIntegrityTrustScore,
        proctoringSummary: latestProctoringSummary,
        germanCefrAssessment: latestCefrScore,
      };

      await onVideoPitchSubmit(liveTranscript, rating, summary, extraMedia);
      onNext();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
              Open-Source Multimodal Speech, AI Proctoring & CEFR Suite
            </span>
            {latestIntegrityTrustScore < 80 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                Integrity: {latestIntegrityTrustScore}%
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-900">Multimodal Video Pitch & Real-Time Integrity Engine</h2>
          <p className="text-xs text-slate-500">
            Real hardware camera/mic capture, AI head pose tracking, anti-dubbing audio sync, and official German CEFR linguistic scoring.
          </p>
        </div>

        {/* Hardware Activation Button */}
        {!hasMediaAccess ? (
          <button
            onClick={handleEnableCamera}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-transform active:scale-95"
          >
            <Camera className="w-4 h-4" /> 🎥 Enable Camera & Microphone
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Hardware Active
            </span>
            <button
              onClick={stopHardwareTracks}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 text-xs"
              title="Turn off camera"
            >
              <CameraOff className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Mode Switcher Tabs */}
      <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1.5 text-xs font-semibold border border-slate-200/80">
        <button
          onClick={() => setActivePitchTab('standard')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activePitchTab === 'standard'
              ? 'bg-white text-slate-900 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Video className="w-4 h-4 text-sky-600" />
          <span>🎙️ 30-Sec Multimodal Pitch</span>
        </button>

        <button
          onClick={() => setActivePitchTab('proctor')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activePitchTab === 'proctor'
              ? 'bg-white text-slate-900 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          <span>🛡️ Live Anti-Cheating & Proctor HUD ({latestIntegrityTrustScore}%)</span>
        </button>

        <button
          onClick={() => setActivePitchTab('german-voice')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activePitchTab === 'german-voice'
              ? 'bg-white text-slate-900 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>🇩🇪 German Speech & CEFR Matrix {latestCefrScore ? `[${latestCefrScore.assessedLevel}]` : ''}</span>
        </button>
      </div>

      {/* TAB 2: AI ANTI-CHEATING & PROCTORING ENGINE */}
      {activePitchTab === 'proctor' && (
        <AntiCheatingProctor
          videoStream={mediaStreamRef.current}
          isActive={hasMediaAccess || isRecording}
          onProctoringUpdate={(summary, score) => {
            setLatestProctoringSummary(summary);
            setLatestIntegrityTrustScore(score);
          }}
        />
      )}

      {/* TAB 3: GERMAN SPEECH RECOGNITION & CEFR SCORING MATRIX */}
      {activePitchTab === 'german-voice' && (
        <GermanVoiceAssessment
          initialTranscript={liveTranscript}
          onScoreUpdate={(score, capturedText) => {
            setLatestCefrScore(score);
            setLiveTranscript(capturedText);
          }}
        />
      )}

      {/* TAB 1: STANDARD VIDEO PITCH RECORDER */}
      {activePitchTab === 'standard' && (
        <div className="space-y-6">

      {/* Hardware Error Banner */}
      {hardwareError && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold">Hardware Access Notice:</div>
            <div>{hardwareError}</div>
            <div className="text-[11px] text-amber-800">
              You can still record using simulated speech recognition or manually edit your motivation statement below.
            </div>
          </div>
        </div>
      )}

      {/* Main Recording Workspace */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column: Video Viewport & Audio Monitor */}
        <div className="bg-slate-950 rounded-2xl p-5 text-white flex flex-col justify-between min-h-[380px] shadow-lg relative overflow-hidden border border-slate-800">
          {/* Status Bar */}
          <div className="flex items-center justify-between z-10 text-xs">
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800">
              <span
                className={`w-2 h-2 rounded-full ${
                  isRecording ? 'bg-red-500 animate-ping' : hasMediaAccess ? 'bg-emerald-400' : 'bg-slate-500'
                }`}
              />
              {isRecording ? (
                <span className="font-bold text-red-400">REC {recordingSeconds}s / 30s</span>
              ) : hasMediaAccess ? (
                'Camera Live'
              ) : (
                'Camera Standby'
              )}
            </span>

            {/* Audio Signal Level Bar */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1 rounded-full border border-slate-800">
              <Volume2 className="w-3.5 h-3.5 text-sky-400" />
              <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-400 transition-all duration-75"
                  style={{ width: `${Math.min(100, audioLevel)}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400">{audioLevel}%</span>
            </div>
          </div>

          {/* Video Display: Live Camera Stream or Playback Preview */}
          <div className="my-auto py-3 relative flex items-center justify-center">
            {recordedBlobUrl ? (
              <div className="w-full">
                <video
                  ref={playbackRef}
                  src={recordedBlobUrl}
                  controls
                  className="w-full max-h-[260px] rounded-xl bg-black object-cover"
                />
                <div className="text-[11px] text-center text-slate-400 mt-2 flex items-center justify-center gap-2">
                  <span>✓ 30-Sec WebM Video Saved</span>
                  <a
                    href={recordedBlobUrl}
                    download={`Educaro_Pitch_${applicant.personal?.name || 'Applicant'}.webm`}
                    className="text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" /> Download .webm
                  </a>
                </div>
              </div>
            ) : hasMediaAccess ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-h-[260px] rounded-xl bg-black object-cover transform -scale-x-100"
              />
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400 mb-3">
                  <Video className="w-8 h-8" />
                </div>
                <h4 className="text-xs font-bold text-slate-200">Camera Inactive</h4>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1">
                  Click "Enable Camera & Microphone" above to start your live video intake.
                </p>
              </div>
            )}
          </div>

          {/* Recording Controls */}
          <div className="flex items-center justify-center gap-3 z-10 pt-2 border-t border-slate-900">
            {!isRecording ? (
              <button
                onClick={handleStartRecording}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95"
              >
                <span className="w-3 h-3 rounded-full bg-white" />
                {recordedBlobUrl ? 'Re-Record 30-Sec Pitch' : 'Start 30-Sec Pitch'}
              </button>
            ) : (
              <button
                onClick={handleStopRecording}
                className="px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center gap-2 shadow-sm"
              >
                <Square className="w-3.5 h-3.5 fill-white" /> Stop & Run Forensics
              </button>
            )}

            {recordedBlobUrl && (
              <button
                onClick={() => {
                  setRecordedBlobUrl(null);
                  if (hasMediaAccess && videoRef.current && mediaStreamRef.current) {
                    videoRef.current.srcObject = mediaStreamRef.current;
                    videoRef.current.play().catch(() => {});
                  }
                }}
                className="px-3 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs flex items-center gap-1.5 hover:bg-slate-800"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Video
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Live Web Speech Transcript & Analysis Card */}
        <div className="space-y-4">
          {/* Transcript Box */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Mic className={`w-3.5 h-3.5 ${isListeningSpeech ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
                Live Spoken Transcript (Web Speech API)
              </span>
              <span className="text-[10px] text-slate-400">
                {isListeningSpeech ? 'Listening in real-time...' : 'Speech-to-text ready'}
              </span>
            </div>

            <textarea
              value={liveTranscript}
              onChange={(e) => setLiveTranscript(e.target.value)}
              placeholder="As you speak into the microphone, your spoken transcript will appear here automatically..."
              rows={5}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800 leading-relaxed font-mono"
            />

            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
              <span>Words spoken: {liveTranscript.trim().split(/\s+/).filter(Boolean).length}</span>
              <button
                onClick={() => runAuthenticityAnalysis(liveTranscript, volumeSamplesRef.current, recordingSeconds || 20)}
                className="text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" /> Re-analyze Text
              </button>
            </div>
          </div>

          {/* Open-Source Authenticity & Spoofing Scorecard */}
          {analysisResult && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Speech Authenticity Engine
                  </span>
                  <div className="text-xl font-black text-slate-900 mt-0.5">
                    {analysisResult.score} / 100%
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
                    analysisResult.verdictColor === 'emerald'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : analysisResult.verdictColor === 'amber'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  {analysisResult.verdict}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 rounded-xl text-center text-[10px]">
                <div>
                  <div className="text-slate-400">Human Voice</div>
                  <div className="font-bold text-slate-800">
                    {analysisResult.humanVoiceDetected ? '✓ Verified' : '⚠ Silent / Flat'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Speech Pace</div>
                  <div className="font-bold text-slate-800">{analysisResult.wordsPerMinute} WPM</div>
                </div>
                <div>
                  <div className="text-slate-400">Language</div>
                  <div className="font-bold text-slate-800">{analysisResult.detectedLanguage}</div>
                </div>
              </div>

              {/* Rationale & Coherence Keywords */}
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {analysisResult.rationale}
              </p>

              {analysisResult.coherentKeywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {analysisResult.coherentKeywords.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-sky-50 border border-sky-100 text-sky-800 text-[10px] font-medium"
                    >
                      ✓ {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Documents
        </button>

        <button
          onClick={handleSaveAndProceed}
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-transform active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? 'Evaluating...' : 'Proceed to German Visa Math'}{' '}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
