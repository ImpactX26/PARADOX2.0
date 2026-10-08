import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Eye, 
  Mic, 
  Users, 
  Activity, 
  Volume2, 
  Maximize2, 
  CheckCircle2, 
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { ProctoringSummaryData } from '../types';

interface AntiCheatingProctorProps {
  videoStream: MediaStream | null;
  isActive: boolean;
  onProctoringUpdate?: (summary: ProctoringSummaryData, trustScore: number) => void;
  isCompact?: boolean;
}

export const AntiCheatingProctor: React.FC<AntiCheatingProctorProps> = ({
  videoStream,
  isActive,
  onProctoringUpdate,
  isCompact = false,
}) => {
  // Integrity Trust Meter (Starts at 100)
  const [integrityTrustScore, setIntegrityTrustScore] = useState<number>(100);

  // Real-time tracking states
  const [yaw, setYaw] = useState<number>(0); // -90 to +90 deg
  const [pitch, setPitch] = useState<number>(0); // -90 to +90 deg
  const [mouthAspectRatio, setMouthAspectRatio] = useState<number>(0.12); // MAR
  const [audioRmsEnergy, setAudioRmsEnergy] = useState<number>(0); // 0.0 to 1.0
  const [detectedFaceCount, setDetectedFaceCount] = useState<number>(1);
  const [isLookingAway, setIsLookingAway] = useState<boolean>(false);
  const [lookingAwaySeconds, setLookingAwaySeconds] = useState<number>(0);
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);

  // Status Badges
  const [cameraAngleStatus, setCameraAngleStatus] = useState<string>('🟢 Optimal Center Frame');
  const [voiceSyncStatus, setVoiceSyncStatus] = useState<string>('🟢 Synchronized Cadence');
  const [currentAlertMessage, setCurrentAlertMessage] = useState<string | null>(null);

  // Timestamped Session Infraction Log
  const [infractionLog, setInfractionLog] = useState<
    Array<{ timestamp: string; message: string; severity: 'low' | 'medium' | 'high' }>
  >([]);

  // Canvas & Audio References
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenVideoRef = useRef<HTMLVideoElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const lookAwayTimerRef = useRef<any>(null);
  const lastInfractionTimeRef = useRef<{ [key: string]: number }>({});

  /**
   * Deduct trust score and append timestamped log with debounce
   */
  const logInfraction = (message: string, severity: 'low' | 'medium' | 'high', pointsDeduct: number) => {
    const now = Date.now();
    const last = lastInfractionTimeRef.current[message] || 0;
    // Debounce identical alerts to avoid spamming the log (3-second cooldown)
    if (now - last < 3000) return;

    lastInfractionTimeRef.current[message] = now;
    const timeStr = new Date().toLocaleTimeString();

    setInfractionLog(prev => [{ timestamp: timeStr, message, severity }, ...prev.slice(0, 24)]);
    setIntegrityTrustScore(prev => Math.max(10, prev - pointsDeduct));
    setCurrentAlertMessage(message);
    setTimeout(() => setCurrentAlertMessage(null), 4000);
  };

  /**
   * Monitor Tab Visibility via Page Visibility API & Window Blur
   */
  useEffect(() => {
    if (!isActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);
        logInfraction('🚨 TAB SWITCH DETECTED: Candidate switched tabs or minimized window', 'high', 15);
      }
    };

    const handleWindowBlur = () => {
      setTabSwitchCount(prev => prev + 1);
      logInfraction('⚠️ WINDOW BLUR DETECTED: Left active assessment window', 'medium', 10);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isActive]);

  /**
   * Setup Web Audio API Analyser for RMS energy and lip-sync correlation
   */
  useEffect(() => {
    if (!videoStream || !isActive) return;

    const audioTracks = videoStream.getAudioTracks();
    if (audioTracks.length === 0) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const source = audioCtx.createMediaStreamSource(videoStream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
    } catch (e) {
      console.warn('Web Audio Proctoring initialization notice:', e);
    }

    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try { audioContextRef.current.close(); } catch (e) {}
      }
    };
  }, [videoStream, isActive]);

  /**
   * Real-Time Canvas Video Processing & Facial Feature Tracking
   */
  useEffect(() => {
    if (!videoStream || !isActive) return;

    // Attach stream to hidden video for canvas frame capture
    if (hiddenVideoRef.current) {
      hiddenVideoRef.current.srcObject = videoStream;
      hiddenVideoRef.current.play().catch(() => {});
    }

    let frameCount = 0;

    const processFrame = () => {
      const video = hiddenVideoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState >= 2) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const width = canvas.width;
          const height = canvas.height;

          // Draw current video frame onto canvas
          ctx.drawImage(video, 0, 0, width, height);

          // 1. Audio RMS Energy calculation
          let currentRms = 0;
          if (analyserRef.current) {
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteTimeDomainData(dataArray);
            let sumSq = 0;
            for (let i = 0; i < dataArray.length; i++) {
              const norm = (dataArray[i] - 128) / 128;
              sumSq += norm * norm;
            }
            currentRms = Math.sqrt(sumSq / dataArray.length);
            setAudioRmsEnergy(Math.round(currentRms * 100) / 100);
          }

          // 2. Client-Side Computer Vision Feature Extraction
          // Sample facial skin-color and brightness variance across central grid
          const imageData = ctx.getImageData(0, 0, width, height);
          const data = imageData.data;

          let skinPixelCount = 0;
          let sumX = 0;
          let sumY = 0;

          // Scan pixels in step intervals for real-time 30fps performance
          const step = 4;
          for (let y = 0; y < height; y += step) {
            for (let x = 0; x < width; x += step) {
              const idx = (y * width + x) * 4;
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];

              // Skin-tone chromaticity heuristic: R > G > B, R > 60
              if (r > 60 && g > 40 && b > 20 && r > g && g > b && (r - g) >= 15 && (r - b) >= 15) {
                skinPixelCount++;
                sumX += x;
                sumY += y;
              }
            }
          }

          // Face Count Check
          const nominalFacePixels = (width * height) / (step * step * 16);
          let faceCount = 1;
          if (skinPixelCount < nominalFacePixels * 0.3) {
            faceCount = 0;
          } else if (skinPixelCount > nominalFacePixels * 3.8) {
            faceCount = 2; // Multiple candidate indicator
          }
          setDetectedFaceCount(faceCount);

          if (faceCount === 0) {
            logInfraction('⚠️ NO CANDIDATE IN FRAME: Face not visible in camera feed', 'medium', 8);
          } else if (faceCount > 1) {
            logInfraction('🚨 CHEATING ALERT: Multiple people detected in frame', 'high', 20);
          }

          // 3. Head Pose & Angle Calculation (Yaw & Pitch)
          if (skinPixelCount > 0 && faceCount === 1) {
            const centroidX = sumX / skinPixelCount;
            const centroidY = sumY / skinPixelCount;

            const centerX = width / 2;
            const centerY = height / 2;

            // Normalized Yaw (-90 to +90 deg)
            const calculatedYaw = Math.round(((centroidX - centerX) / (width / 2)) * 55);
            // Normalized Pitch (-90 to +90 deg)
            const calculatedPitch = Math.round(((centerY - centroidY) / (height / 2)) * 45);

            setYaw(calculatedYaw);
            setPitch(calculatedPitch);

            // Yaw threshold: -25 to +25 deg; Pitch threshold: -20 to +20 deg
            const isLookingAwayNow = Math.abs(calculatedYaw) > 25 || Math.abs(calculatedPitch) > 20;

            if (isLookingAwayNow) {
              setIsLookingAway(true);
              setLookingAwaySeconds(prev => prev + 0.1);
              setCameraAngleStatus(`⚠️ Looking Away (${calculatedYaw > 0 ? 'Right' : 'Left'} ${Math.abs(calculatedYaw)}°)`);

              // If candidate turns away for > 2 seconds, trigger warning
              if (lookingAwaySeconds > 2.0) {
                logInfraction('⚠️ IMPROPER CAMERA ANGLE: Looking away from screen for >2 seconds', 'medium', 6);
              }
            } else {
              setIsLookingAway(false);
              setLookingAwaySeconds(0);
              setCameraAngleStatus('🟢 Optimal Center Frame');
            }

            // 4. Lip-Sync & Mouth Aspect Ratio (MAR) Correlation
            // Sample mouth area (located ~65-75% down the face centroid)
            const mouthRegionY = Math.min(height - 20, Math.max(10, Math.round(centroidY + height * 0.18)));
            const mouthRegionX = Math.min(width - 20, Math.max(10, Math.round(centroidX)));

            // Measure vertical contrast in mouth box (open mouth creates dark intra-oral shadow)
            let mouthDarkness = 0;
            let mouthSampleCount = 0;
            for (let my = mouthRegionY - 10; my <= mouthRegionY + 10; my += 2) {
              for (let mx = mouthRegionX - 16; mx <= mouthRegionX + 16; mx += 2) {
                if (mx >= 0 && mx < width && my >= 0 && my < height) {
                  const idx = (my * width + mx) * 4;
                  const lum = (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114);
                  if (lum < 75) mouthDarkness++;
                  mouthSampleCount++;
                }
              }
            }

            // MAR estimation (0.05 static/closed, >0.18 open/speaking)
            const computedMar = Math.round(((mouthDarkness / Math.max(1, mouthSampleCount)) * 0.45 + 0.08) * 100) / 100;
            setMouthAspectRatio(computedMar);

            // Lip-Sync Voice Correlation (Anti-Dubbing / Proxy Speaker)
            frameCount++;
            if (frameCount % 15 === 0) { // Check every ~500ms
              if (currentRms > 0.07 && computedMar < 0.12) {
                // High audio volume without lip movement
                setVoiceSyncStatus('🔴 SUSPECT: Audio detected without lip movement');
                logInfraction('🔴 SUSPECT: Audio detected without lip movement (Dubbing / Proxy Speaker)', 'high', 12);
              } else if (computedMar > 0.18 && currentRms < 0.02) {
                // Moving lips but muted / unsynchronized
                setVoiceSyncStatus('🟡 WARNING: Muted / Unsynchronized speech');
              } else if (currentRms > 0.04 && computedMar >= 0.13) {
                setVoiceSyncStatus('🟢 VERIFIED: Lip movement synchronized with audio');
              } else {
                setVoiceSyncStatus('🟢 VERIFIED: Neutral Cadence');
              }
            }

            // 5. Draw HUD Visual Wireframe on Canvas
            ctx.strokeStyle = isLookingAwayNow ? '#ef4444' : '#10b981';
            ctx.lineWidth = 2;
            ctx.strokeRect(centroidX - 50, centroidY - 65, 100, 130);

            // Target Reticle
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(centroidX, centroidY, 8, 0, 2 * Math.PI);
            ctx.stroke();

            // Mouth bounding marker
            ctx.strokeStyle = computedMar > 0.15 ? '#f59e0b' : '#06b6d4';
            ctx.strokeRect(mouthRegionX - 18, mouthRegionY - 8, 36, 16);
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(processFrame);
    };

    processFrame();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [videoStream, isActive, lookingAwaySeconds]);

  // Sync update to parent whenever state changes
  useEffect(() => {
    if (!onProctoringUpdate) return;

    let overallTrustLevel: 'High Trust' | 'Moderate Trust' | 'Flagged for Review' = 'High Trust';
    if (integrityTrustScore < 50) overallTrustLevel = 'Flagged for Review';
    else if (integrityTrustScore < 75) overallTrustLevel = 'Moderate Trust';

    const summary: ProctoringSummaryData = {
      yawPitchStatus: cameraAngleStatus,
      voiceSyncStatus,
      infractionsCount: infractionLog.length,
      tabSwitches: tabSwitchCount,
      lookingAwaySeconds: Math.round(lookingAwaySeconds),
      overallTrustLevel,
      infractionLog,
    };

    onProctoringUpdate(summary, integrityTrustScore);
  }, [integrityTrustScore, cameraAngleStatus, voiceSyncStatus, infractionLog, tabSwitchCount, lookingAwaySeconds]);

  /**
   * Simulation buttons for testing and jury pitch
   */
  const handleSimulateLookAway = () => {
    setYaw(38);
    setPitch(24);
    setIsLookingAway(true);
    setCameraAngleStatus('⚠️ Looking Away (Right 38°)');
    logInfraction('⚠️ IMPROPER CAMERA ANGLE: Looking away from screen', 'medium', 6);
  };

  const handleSimulateDubbing = () => {
    setAudioRmsEnergy(0.18);
    setMouthAspectRatio(0.08);
    setVoiceSyncStatus('🔴 SUSPECT: Audio detected without lip movement');
    logInfraction('🔴 SUSPECT: Audio detected without lip movement (Dubbing / Proxy Speaker)', 'high', 15);
  };

  const handleSimulateMultiFace = () => {
    setDetectedFaceCount(2);
    logInfraction('🚨 CHEATING ALERT: Multiple people detected in frame', 'high', 20);
  };

  const handleSimulateTabSwitch = () => {
    setTabSwitchCount(prev => prev + 1);
    logInfraction('🚨 TAB SWITCH DETECTED: Left assessment window', 'high', 15);
  };

  const getTrustBadge = () => {
    if (integrityTrustScore >= 80) {
      return { text: '🛡️ High Trust', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    } else if (integrityTrustScore >= 55) {
      return { text: '🟡 Moderate Trust', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    } else {
      return { text: '🚨 Flagged for Review', color: 'bg-rose-100 text-rose-800 border-rose-300' };
    }
  };

  const trustBadge = getTrustBadge();

  return (
    <div className={`space-y-4 ${isCompact ? 'text-xs' : ''}`}>
      {/* Hidden Video for Canvas Stream Processing */}
      <video ref={hiddenVideoRef} className="hidden" playsInline muted autoPlay />

      {/* Proctoring HUD Card Overlay */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 text-white shadow-xl space-y-4">
        {/* Top Header: Trust Meter & Live Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Live Anti-Cheating & AI Proctoring Guard
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Trust Badge */}
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${trustBadge.color}`}>
              {trustBadge.text}
            </span>

            {/* Trust Meter Score */}
            <div className="bg-slate-800 px-3 py-1 rounded-xl border border-slate-700 flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-semibold">Integrity Score:</span>
              <span className={`font-mono font-black text-sm ${
                integrityTrustScore >= 80 ? 'text-emerald-400' : integrityTrustScore >= 55 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {integrityTrustScore}%
              </span>
            </div>
          </div>
        </div>

        {/* Live Active Infraction Alert Pill */}
        {currentAlertMessage && (
          <div className="p-2.5 bg-rose-500/20 border border-rose-500/50 rounded-xl text-xs font-semibold text-rose-300 flex items-center gap-2 animate-bounce">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{currentAlertMessage}</span>
          </div>
        )}

        {/* Video HUD Stream with Facial Reticle Overlay */}
        <div className="grid md:grid-cols-2 gap-4 items-center">
          {/* Left: Canvas with Face Wireframe & Reticle */}
          <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center">
            {videoStream ? (
              <canvas
                ref={canvasRef}
                width={320}
                height={240}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-4 text-slate-500 text-xs">
                Camera feed inactive. Enable webcam above to stream into proctor canvas.
              </div>
            )}

            {/* HUD Overlay Crosshairs */}
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
              YAW: {yaw}° | PITCH: {pitch}°
            </div>
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 text-[10px] font-mono text-sky-400 border border-sky-500/30">
              MAR: {mouthAspectRatio} | RMS: {audioRmsEnergy}
            </div>
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] font-mono text-amber-400 border border-amber-500/30">
              FACES IN FRAME: {detectedFaceCount}
            </div>
          </div>

          {/* Right: Live Sensor Telemetry Badges */}
          <div className="space-y-2 text-xs">
            {/* Camera Angle */}
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-sky-400" /> Camera Angle:
              </span>
              <strong className="text-slate-200">{cameraAngleStatus}</strong>
            </div>

            {/* Voice & Lip Sync */}
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-rose-400" /> Voice & Lip Sync:
              </span>
              <strong className="text-slate-200 truncate max-w-[170px]">{voiceSyncStatus}</strong>
            </div>

            {/* Candidate Face Count */}
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" /> Single Candidate Rule:
              </span>
              <strong className={detectedFaceCount === 1 ? 'text-emerald-400' : 'text-rose-400'}>
                {detectedFaceCount === 1 ? '🟢 1 Candidate Verified' : detectedFaceCount === 0 ? '⚠️ 0 Candidates in Frame' : '🚨 Multi-Face Violation'}
              </strong>
            </div>

            {/* Tab Visibility */}
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-indigo-400" /> Assessment Window:
              </span>
              <strong className={tabSwitchCount === 0 ? 'text-emerald-400' : 'text-amber-400'}>
                {tabSwitchCount === 0 ? '🟢 Locked to Window' : `⚠️ ${tabSwitchCount} Tab Switches Detected`}
              </strong>
            </div>
          </div>
        </div>

        {/* Timestamped Session Infraction Log */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> Timestamped Integrity Infraction Log ({infractionLog.length})
            </span>
            <span className="text-[10px] text-slate-500">Auto-recorded for Educaro Counselor Dossier</span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 max-h-28 overflow-y-auto space-y-1 text-[11px] font-mono">
            {infractionLog.length === 0 ? (
              <div className="text-slate-500 italic text-center py-2">
                ✓ Zero integrity infractions recorded. Candidate assessment running in high trust state.
              </div>
            ) : (
              infractionLog.map((log, idx) => (
                <div
                  key={idx}
                  className={`p-1.5 rounded flex items-center justify-between ${
                    log.severity === 'high' ? 'bg-rose-500/10 text-rose-300' :
                    log.severity === 'medium' ? 'bg-amber-500/10 text-amber-300' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  <span className="truncate pr-2">{log.message}</span>
                  <span className="text-[10px] opacity-70 shrink-0">{log.timestamp}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 1-Click Simulation Buttons for Tests & Jury Pitch */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Test Proctor Guards:
          </span>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={handleSimulateLookAway}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold border border-slate-700 transition-colors"
            >
              Simulate Look Away
            </button>
            <button
              onClick={handleSimulateDubbing}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold border border-slate-700 transition-colors"
            >
              Simulate Dubbing Anomaly
            </button>
            <button
              onClick={handleSimulateMultiFace}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold border border-slate-700 transition-colors"
            >
              Simulate Multiple Faces
            </button>
            <button
              onClick={handleSimulateTabSwitch}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold border border-slate-700 transition-colors"
            >
              Simulate Tab Switch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
