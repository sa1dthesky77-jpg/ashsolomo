import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, Sparkles, Disc } from 'lucide-react';
import { generateDefaultPeaks } from '../utils/audioUtils';
import { WaveformAnalyzer } from './WaveformAnalyzer';

export interface AudioPreviewPlayerProps {
  audioUrl?: string;
  filename?: string;
  previewDuration?: number; // Strictly fixed at 15
  previewStart?: number;    // Defaults to 0
  fadeEnabled?: boolean;    // Defaults to true
  fadeDuration?: number;    // Defaults to 2.0s
  waveformPeaks?: number[]; // Waveform amplitudes
  trackTitle?: string;
  bpm?: number;
  musicalKey?: string;
  genre?: string;
  compact?: boolean;        // Compact mode for Admin modal
  className?: string;
  showTitleWithPlayButton?: boolean; // When true, renders the Play button to the left of title
}

export const AudioPreviewPlayer: React.FC<AudioPreviewPlayerProps> = ({
  audioUrl,
  filename,
  previewDuration = 15,
  previewStart = 0,
  fadeEnabled = true,
  fadeDuration = 2,
  waveformPeaks,
  trackTitle = 'Track',
  bpm = 130,
  musicalKey,
  genre,
  compact = false,
  className = '',
  showTitleWithPlayButton = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isEnded, setIsEnded] = useState(false);

  // Peaks for visual waveform timeline
  const peaks = waveformPeaks && waveformPeaks.length > 0
    ? waveformPeaks
    : generateDefaultPeaks(filename || trackTitle);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [analyserNodeState, setAnalyserNodeState] = useState<AnalyserNode | null>(null);

  const synthGainRef = useRef<GainNode | null>(null);
  const synthIntervalRef = useRef<number | null>(null);
  const mediaSourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const maxDuration = 15; // Strictly fixed at 15 seconds
  const startOffset = previewStart || 0;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      stopSynth();
      window.dispatchEvent(
        new CustomEvent('app-audio-state', {
          detail: { isPlaying: false, analyser: null },
        })
      );
    };
  }, []);

  // Broadcast audio state to ambient background analyzer
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('app-audio-state', {
        detail: { isPlaying, analyser: analyserRef.current },
      })
    );
  }, [isPlaying]);

  // Update volume for HTML Audio element to apply fade in/out
  useEffect(() => {
    if (!audioRef.current || !isPlaying) return;

    if (!fadeEnabled) {
      audioRef.current.volume = 1;
      return;
    }

    const fadeInTime = 1.5;
    const fadeOutStart = maxDuration - (fadeDuration || 2.0);

    let targetVol = 1.0;
    if (currentTime < fadeInTime) {
      // Fade in: 0 -> 1
      targetVol = Math.max(0.05, currentTime / fadeInTime);
    } else if (currentTime > fadeOutStart) {
      // Fade out: 1 -> 0
      const remaining = maxDuration - currentTime;
      const fadeLen = maxDuration - fadeOutStart;
      targetVol = Math.max(0.0, Math.min(1.0, remaining / fadeLen));
    } else {
      targetVol = 1.0;
    }

    try {
      audioRef.current.volume = Math.min(1.0, Math.max(0.0, targetVol));
    } catch {
      // ignore
    }
  }, [currentTime, isPlaying, fadeEnabled, fadeDuration, maxDuration]);

  // Ensure AudioContext and AnalyserNode
  const getOrCreateAudioContext = (): AudioContext | null => {
    try {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return null;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;
        setAnalyserNodeState(analyser);
      } else if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      return audioContextRef.current;
    } catch (e) {
      console.warn('AudioContext creation error:', e);
      return null;
    }
  };

  // Connect native HTML audio element to analyser if possible
  const attachAudioElementToAnalyser = (ctx: AudioContext) => {
    if (!audioRef.current || mediaSourceRef.current) return;
    try {
      const source = ctx.createMediaElementSource(audioRef.current);
      mediaSourceRef.current = source;
      if (analyserRef.current) {
        source.connect(analyserRef.current);
        analyserRef.current.connect(ctx.destination);
      } else {
        source.connect(ctx.destination);
      }
    } catch (e) {
      // Browsers disallow createMediaElementSource twice or with certain CORS configurations
      console.warn('MediaElementSource attach fallback:', e);
    }
  };

  // Procedural synthesizer fallback
  const startSynth = () => {
    try {
      const ctx = getOrCreateAudioContext();
      if (!ctx) return;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(fadeEnabled ? 0.01 : 0.8, ctx.currentTime);

      if (analyserRef.current) {
        masterGain.connect(analyserRef.current);
        analyserRef.current.connect(ctx.destination);
      } else {
        masterGain.connect(ctx.destination);
      }
      synthGainRef.current = masterGain;

      const tempo = bpm || 130;
      const beatInterval = 60000 / tempo / 2;
      let step = 0;

      const playTone = () => {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') return;
        const now = ctx.currentTime;

        // Kick drum on 0, 4, 8, 12
        if (step % 8 === 0 || step % 8 === 6) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.setValueAtTime(110, now);
          osc.frequency.exponentialRampToValueAtTime(32, now + 0.16);
          gain.gain.setValueAtTime(0.75, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.2);
        }

        // Snare on 4, 12
        if (step % 8 === 4) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(220, now);
          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.14);
        }

        // Hi-hat on every step
        const hatOsc = ctx.createOscillator();
        const hatGain = ctx.createGain();
        hatOsc.type = 'highpass' as any;
        hatOsc.frequency.setValueAtTime(8800, now);
        hatGain.gain.setValueAtTime(step % 2 === 0 ? 0.09 : 0.04, now);
        hatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        hatOsc.connect(hatGain);
        hatGain.connect(masterGain);
        hatOsc.start(now);
        hatOsc.stop(now + 0.05);

        // Synth chord / bass pad
        if (step % 16 === 0) {
          const pad = ctx.createOscillator();
          const padGain = ctx.createGain();
          pad.type = 'sawtooth';
          pad.frequency.setValueAtTime(174.61, now);
          padGain.gain.setValueAtTime(0.14, now);
          padGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
          pad.connect(padGain);
          padGain.connect(masterGain);
          pad.start(now);
          pad.stop(now + 0.85);
        }

        step = (step + 1) % 32;
      };

      playTone();
      synthIntervalRef.current = window.setInterval(playTone, beatInterval);
    } catch (e) {
      console.warn('Synth playback failed:', e);
    }
  };

  const stopSynth = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
  };

  // Toggle play
  const handleTogglePlay = () => {
    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      stopSynth();
      setIsPlaying(false);
    } else {
      setIsEnded(false);
      const ctx = getOrCreateAudioContext();

      if (audioUrl) {
        if (audioRef.current) {
          if (ctx) attachAudioElementToAnalyser(ctx);

          if (currentTime >= maxDuration) {
            audioRef.current.currentTime = startOffset;
            setCurrentTime(0);
          } else {
            audioRef.current.currentTime = startOffset + currentTime;
          }

          if (fadeEnabled) {
            audioRef.current.volume = 0.05;
          }

          audioRef.current
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => {
              startSynth();
              setIsPlaying(true);
            });
        }
      } else {
        startSynth();
        setIsPlaying(true);
      }
    }
  };

  // Time tracker with 15s fixed cap
  useEffect(() => {
    let timer: number;
    if (isPlaying) {
      timer = window.setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.2;
          if (next >= maxDuration) {
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = startOffset;
            }
            stopSynth();
            setIsPlaying(false);
            setIsEnded(true);
            return maxDuration;
          }
          return next;
        });
      }, 200);
    }
    return () => clearInterval(timer);
  }, [isPlaying, maxDuration, startOffset]);

  const handleRestart = () => {
    setCurrentTime(0);
    setIsEnded(false);
    if (audioRef.current) {
      audioRef.current.currentTime = startOffset;
      if (isPlaying) audioRef.current.play();
    }
  };

  const progressRatio = Math.min(1, currentTime / maxDuration);
  const activeBarIndex = Math.floor(progressRatio * peaks.length);

  const formatSeconds = (sec: number) => {
    const s = Math.floor(sec);
    const m = Math.floor(s / 60);
    const remainder = s % 60;
    return `${String(m).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  return (
    <div className={`space-y-3 font-mono ${className}`}>
      {/* Hidden native audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
          crossOrigin="anonymous"
          onEnded={() => {
            setIsPlaying(false);
            setIsEnded(true);
          }}
        />
      )}

      {/* TRACK TITLE ROW WITH PLAY BUTTON ON THE LEFT */}
      {showTitleWithPlayButton && (
        <div className="flex items-center gap-3 sm:gap-4 py-1">
          {/* Prominent Play / Pause Button placed to the LEFT of the title */}
          <button
            type="button"
            onClick={handleTogglePlay}
            aria-label={isPlaying ? '일시정지' : '15초 미리듣기 재생'}
            className={`group shrink-0 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 border transition-all cursor-pointer ${
              isPlaying
                ? 'bg-white text-black border-white shadow-[0_0_16px_rgba(255,255,255,0.4)]'
                : 'bg-[#0e0e0e] text-white border-[#333333] hover:border-white hover:bg-[#1a1a1a]'
            }`}
            title={isPlaying ? '일시정지 (PAUSE)' : '15초 미리듣기 재생 (PLAY 15s)'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            ) : (
              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current translate-x-0.5" />
            )}
          </button>

          {/* Title & Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="font-mono text-xl sm:text-3xl font-bold text-white tracking-tight break-words">
                {trackTitle}
              </h2>

              {isPlaying ? (
                <span className="flex items-center gap-1.5 text-[10px] font-mono text-[#22c55e] border border-[#22c55e]/40 bg-[#22c55e]/10 px-2 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-ping" />
                  <span>PLAYING 15s</span>
                </span>
              ) : isEnded ? (
                <span className="text-[10px] font-mono text-[#f59e0b] border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-2 py-0.5">
                  STOPPED (15s)
                </span>
              ) : null}
            </div>

            {/* Musical Metadata */}
            {(bpm || musicalKey || genre) && (
              <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono text-[#888888] pt-1 flex-wrap">
                {bpm && <span className="text-[#cccccc]">{bpm} BPM</span>}
                {musicalKey && (
                  <>
                    <span aria-hidden="true" className="text-[#444444]">·</span>
                    <span className="text-[#cccccc]">{musicalKey}</span>
                  </>
                )}
                {genre && (
                  <>
                    <span aria-hidden="true" className="text-[#444444]">·</span>
                    <span className="text-[#cccccc]">{genre}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* WAVEFORM ANALYZER (파형 아날라이저) */}
      <WaveformAnalyzer
        isPlaying={isPlaying}
        analyserNode={analyserNodeState}
        bpm={bpm}
        height={compact ? 100 : 135}
      />

      {/* 15-SECOND PREVIEW TIMELINE & CONTROLS */}
      <div className="border border-[#222222] bg-[#070707] p-3 space-y-2.5">
        {/* Waveform timeline bars */}
        <div className="space-y-1">
          <div className="h-8 w-full bg-[#030303] border border-[#1c1c1c] px-2 py-1 flex items-center gap-[2px] sm:gap-[3px] justify-between overflow-hidden">
            {peaks.map((peak, idx) => {
              const isPlayed = idx <= activeBarIndex;
              const barHeight = Math.max(12, Math.round(peak * 100));

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col justify-center items-center h-full"
                >
                  <div
                    className={`w-full rounded-none transition-colors duration-100 ${
                      isPlayed
                        ? 'bg-white'
                        : 'bg-[#252525] hover:bg-[#353535]'
                    }`}
                    style={{
                      height: `${barHeight}%`,
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Progress timecode & fade markers */}
          <div className="flex items-center justify-between text-[11px] text-[#888888]">
            <div className="flex items-center gap-1.5">
              <span className="text-white font-semibold tabular-nums text-xs">
                {formatSeconds(currentTime)}
              </span>
              <span className="text-[#555555]">/</span>
              <span className="text-[#888888] tabular-nums text-xs">
                00:15
              </span>
              {fadeEnabled && (
                <span className="text-[10px] text-[#777777] hidden sm:inline ml-1">
                  (Fade In 1.5s / Fade Out {fadeDuration}s)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#22c55e] border border-[#22c55e]/30 px-1 py-0.2">
                15초 고정
              </span>
              {isEnded ? (
                <span className="text-[#f59e0b] text-[10px] font-semibold">
                  [ 15초 재생 완료 ]
                </span>
              ) : isPlaying ? (
                <span className="text-[#22c55e] text-[10px] animate-pulse">
                  PLAYING...
                </span>
              ) : (
                <span className="text-[#666666] text-[10px]">READY</span>
              )}
            </div>
          </div>
        </div>

        {/* Action button bar */}
        <div className="flex items-center justify-between pt-1 border-t border-[#181818]">
          <div className="flex items-center gap-2">
            {!showTitleWithPlayButton && (
              <button
                type="button"
                onClick={handleTogglePlay}
                className={`flex items-center gap-1.5 py-1.5 px-3 border text-xs font-semibold transition-colors cursor-pointer ${
                  isPlaying
                    ? 'bg-white text-black border-white'
                    : 'bg-[#111111] text-white border-[#333333] hover:border-white hover:bg-[#1a1a1a]'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>일시정지</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isEnded ? '다시 듣기' : '15초 미리듣기 재생'}</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleRestart}
              title="처음부터 다시 재생"
              className="flex items-center gap-1.5 px-2.5 py-1.5 border border-[#252525] text-xs text-[#aaaaaa] hover:text-white hover:border-[#444444] transition-colors cursor-pointer bg-[#0e0e0e]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>처음부터</span>
            </button>

            {filename && (
              <span className="text-[11px] text-[#666666] truncate max-w-[160px] sm:max-w-[220px] hidden sm:inline">
                {filename}
              </span>
            )}
          </div>

          {!compact && (
            <div className="text-[10px] text-[#666666] hidden sm:block">
              * 15초 제한 및 페이드 아웃으로 저작권을 보호합니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
