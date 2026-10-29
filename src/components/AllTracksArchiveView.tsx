import React, { useState, useRef, useEffect, useMemo } from 'react';
import { BeatItem } from '../types';
import { parseKstDate } from '../data/mockBeats';
import { TrackArchiveAnalyzerCanvas } from './TrackArchiveAnalyzerCanvas';
import { useLanguage } from '../context/LanguageContext';
import {
  Clock,
  Music2,
  Search,
  Filter,
  Play,
  Pause,
} from 'lucide-react';

interface AllTracksArchiveViewProps {
  beats: BeatItem[];
  currentBeatId?: string | null;
  onSelectBeat?: (beatId: string) => void;
}

export const AllTracksArchiveView: React.FC<AllTracksArchiveViewProps> = ({
  beats,
}) => {
  const { t } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'pending' | 'unavailable'>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [playingBeatId, setPlayingBeatId] = useState<string | null>(null);
  const [playbackTime, setPlaybackTime] = useState<number>(0);

  // Drag-to-scroll state & refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMouseDownRef = useRef(false);
  const startYRef = useRef(0);
  const scrollTopRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  // Web Audio Context & Nodes for 15s preview playback + Analyzer
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const synthIntervalRef = useRef<number | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const mediaSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const progressTimerRef = useRef<number | null>(null);

  const maxDuration = 15; // Strictly fixed at 15s

  // Sort chronologically: latest at the top
  const sortedBeats = useMemo(() => {
    return [...beats]
      .filter((b) => b.active)
      .sort((a, b) => {
        const timeA = parseKstDate(a.updated_at);
        const timeB = parseKstDate(b.updated_at);
        return timeB - timeA; // Descending: newest first
      });
  }, [beats]);

  // Apply filters
  const filteredBeats = useMemo(() => {
    return sortedBeats.filter((item) => {
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const q = searchFilter.toLowerCase().trim();
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.beat_id.toLowerCase().includes(q) ||
        (item.genre && item.genre.toLowerCase().includes(q));
      return matchesStatus && matchesQuery;
    });
  }, [sortedBeats, statusFilter, searchFilter]);


  // Drag-to-scroll Mouse Event Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || !scrollContainerRef.current) return;
    isMouseDownRef.current = true;
    hasDraggedRef.current = false;
    startYRef.current = e.pageY;
    scrollTopRef.current = scrollContainerRef.current.scrollTop;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current || !scrollContainerRef.current) return;
    const deltaY = e.pageY - startYRef.current;
    if (Math.abs(deltaY) > 5) {
      hasDraggedRef.current = true;
      setIsDragging(true);
      scrollContainerRef.current.scrollTop = scrollTopRef.current - deltaY;
    }
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
    setTimeout(() => {
      setIsDragging(false);
      hasDraggedRef.current = false;
    }, 60);
  };

  const handleMouseLeave = () => {
    if (isMouseDownRef.current) {
      isMouseDownRef.current = false;
      setIsDragging(false);
      hasDraggedRef.current = false;
    }
  };

  // Touch Drag-to-scroll Event Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current || e.touches.length === 0) return;
    isMouseDownRef.current = true;
    hasDraggedRef.current = false;
    startYRef.current = e.touches[0].pageY;
    scrollTopRef.current = scrollContainerRef.current.scrollTop;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMouseDownRef.current || !scrollContainerRef.current || e.touches.length === 0) return;
    const deltaY = e.touches[0].pageY - startYRef.current;
    if (Math.abs(deltaY) > 5) {
      hasDraggedRef.current = true;
      setIsDragging(true);
      scrollContainerRef.current.scrollTop = scrollTopRef.current - deltaY;
    }
  };

  const handleTouchEnd = () => {
    isMouseDownRef.current = false;
    setTimeout(() => {
      setIsDragging(false);
      hasDraggedRef.current = false;
    }, 60);
  };

  // Ensure AudioContext and AnalyserNode
  const getOrCreateAudioContext = (): AudioContext | null => {
    try {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return null;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;
      } else if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      return audioContextRef.current;
    } catch (e) {
      console.warn('AudioContext init error:', e);
      return null;
    }
  };

  // Stop current active playback
  const stopCurrentPlayback = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    if (audioElementRef.current) {
      try {
        audioElementRef.current.pause();
      } catch {
        // ignore
      }
      audioElementRef.current = null;
    }
    if (masterGainRef.current) {
      try {
        masterGainRef.current.disconnect();
      } catch {
        // ignore
      }
      masterGainRef.current = null;
    }

    setPlayingBeatId(null);
    setPlaybackTime(0);

    // Notify ambient background analyzer that audio stopped
    window.dispatchEvent(
      new CustomEvent('app-audio-state', {
        detail: { isPlaying: false, analyser: null },
      })
    );
  };

  // Start procedural synthesizer for beat
  const startBeatSynthesizer = (beat: BeatItem, ctx: AudioContext) => {
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.01, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 1.0);

    if (analyserRef.current) {
      masterGain.connect(analyserRef.current);
      analyserRef.current.connect(ctx.destination);
    } else {
      masterGain.connect(ctx.destination);
    }
    masterGainRef.current = masterGain;

    const tempo = beat.bpm || 130;
    const intervalMs = 60000 / tempo / 2;
    let step = 0;

    const playStep = () => {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') return;
      const now = ctx.currentTime;

      // Kick drum
      if (step % 8 === 0 || step % 8 === 6) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.frequency.setValueAtTime(115, now);
        osc.frequency.exponentialRampToValueAtTime(36, now + 0.16);
        g.gain.setValueAtTime(0.7, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.18);
      }

      // Snare
      if (step % 8 === 4) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(240, now);
        g.gain.setValueAtTime(0.3, now);
        g.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.14);
      }

      // Hi-hat
      const hatOsc = ctx.createOscillator();
      const hatGain = ctx.createGain();
      hatOsc.type = 'square';
      hatOsc.frequency.setValueAtTime(9000, now);
      hatGain.gain.setValueAtTime(step % 2 === 0 ? 0.05 : 0.02, now);
      hatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      hatOsc.connect(hatGain);
      hatGain.connect(masterGain);
      hatOsc.start(now);
      hatOsc.stop(now + 0.04);

      // Bass pad
      if (step % 16 === 0) {
        const pad = ctx.createOscillator();
        const padG = ctx.createGain();
        pad.type = 'sawtooth';
        pad.frequency.setValueAtTime(160, now);
        padG.gain.setValueAtTime(0.12, now);
        padG.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        pad.connect(padG);
        padG.connect(masterGain);
        pad.start(now);
        pad.stop(now + 0.8);
      }

      step = (step + 1) % 32;
    };

    playStep();
    synthIntervalRef.current = window.setInterval(playStep, intervalMs);
  };

  // Dedicated Play & Analyzer click handler: ONLY PLAY & ANALYZER CAN BE CLICKED
  const handleTogglePlay = (e: React.MouseEvent, beat: BeatItem) => {
    e.stopPropagation(); // Never trigger row drag or parent actions

    if (hasDraggedRef.current || isDragging) {
      return; // Suppress during drag operation
    }

    if (playingBeatId === beat.beat_id) {
      stopCurrentPlayback();
      return;
    }

    // Switch to new track
    stopCurrentPlayback();

    const ctx = getOrCreateAudioContext();
    if (!ctx) return;

    setPlayingBeatId(beat.beat_id);
    setPlaybackTime(0);

    // If audio_url exists, play audio; otherwise procedural synth
    if (beat.audio_url) {
      try {
        const audio = new Audio(beat.audio_url);
        audioElementRef.current = audio;

        if (!mediaSourceRef.current) {
          try {
            const source = ctx.createMediaElementSource(audio);
            mediaSourceRef.current = source;
            if (analyserRef.current) {
              source.connect(analyserRef.current);
              analyserRef.current.connect(ctx.destination);
            } else {
              source.connect(ctx.destination);
            }
          } catch {
            // fallback
          }
        }

        audio.currentTime = beat.preview_start || 0;
        audio.volume = 0.8;
        audio.play().catch(() => {
          startBeatSynthesizer(beat, ctx);
        });
      } catch {
        startBeatSynthesizer(beat, ctx);
      }
    } else {
      startBeatSynthesizer(beat, ctx);
    }

    // Progress counter with 15-second cap and smooth fade
    let elapsed = 0;
    progressTimerRef.current = window.setInterval(() => {
      elapsed += 0.25;
      setPlaybackTime(elapsed);

      // Fade out over last 2 seconds
      if (elapsed > 13.0 && masterGainRef.current && audioContextRef.current) {
        const fadeRem = Math.max(0, 15 - elapsed) / 2.0;
        masterGainRef.current.gain.setValueAtTime(
          Math.max(0.001, 0.2 * fadeRem),
          audioContextRef.current.currentTime
        );
      }

      if (elapsed >= maxDuration) {
        stopCurrentPlayback();
      }
    }, 250);

    // Notify ambient background analyzer
    window.dispatchEvent(
      new CustomEvent('app-audio-state', {
        detail: { isPlaying: true, analyser: analyserRef.current },
      })
    );
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCurrentPlayback();
    };
  }, []);

  return (
    <section className="w-full max-w-5xl mx-auto px-2 sm:px-4 mt-8 md:mt-12 mb-16 select-none">
      {/* Retro Window Container */}
      <div className="retro-window">
        {/* Retro Windows 98/XP Title Bar */}
        <div className="retro-titlebar px-3 py-1.5 flex items-center justify-between text-white select-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2dd4bf] inline-block animate-ping" />
            <span className="font-mono text-xs font-bold tracking-wider text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {t('archiveTitle')}
            </span>
            <span className="text-[#c084fc] text-[10px] hidden md:inline font-pixel">
              {t('archiveSubtitle')}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono">
            <span className="text-[#2dd4bf] hidden sm:inline font-semibold">
              {t('totalTracks', { count: filteredBeats.length })}
            </span>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 retro-btn text-[9px] flex items-center justify-center font-bold">_</span>
              <span className="w-4 h-4 retro-btn text-[9px] flex items-center justify-center font-bold">□</span>
              <span className="w-4 h-4 retro-btn text-[9px] flex items-center justify-center text-[#f43f5e] font-bold">✕</span>
            </div>
          </div>
        </div>

        {/* Retro Browser Address Bar */}
        <div className="px-3 py-1 bg-[#0a0416] border-b border-[#2e1065] flex items-center gap-2 text-[11px] font-mono">
          <div className="flex items-center gap-1 shrink-0 text-[#c084fc]">
            <span className="w-5 h-5 retro-btn flex items-center justify-center text-[10px]">◀</span>
            <span className="w-5 h-5 retro-btn flex items-center justify-center text-[10px]">▶</span>
          </div>
          <div className="flex items-center gap-1.5 flex-1 min-w-0 retro-inset px-2.5 py-0.5 text-[11px]">
            <span className="text-[#a855f7] select-none shrink-0 font-semibold">Location:</span>
            <span className="text-[#f3e8ff] truncate font-mono">ash://retro-cyber.net/archive?sort=newest</span>
          </div>
        </div>

        {/* Filter and Control Bar */}
        <div className="p-3 sm:p-4 border-b border-[#2e1065] bg-[#0c051a] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-mono text-[#c084fc] mr-1 flex items-center gap-1 font-pixel">
              <Filter className="w-3 h-3 text-[#a855f7]" />
              <span>FILTER:</span>
            </span>

            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 text-xs font-mono border transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'border-[#a855f7] bg-[#7c3aed] text-white font-bold shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                  : 'retro-btn text-[#c084fc] hover:text-white'
              }`}
            >
              {t('filterAll')} ({sortedBeats.length})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('available')}
              className={`px-2.5 py-1 text-xs font-mono border transition-all cursor-pointer ${
                statusFilter === 'available'
                  ? 'border-[#2dd4bf] bg-[#2dd4bf] text-black font-bold shadow-[0_0_10px_rgba(45,212,191,0.4)]'
                  : 'retro-btn text-[#2dd4bf] hover:bg-[#2dd4bf]/20'
              }`}
            >
              {t('availableLabel')} ({sortedBeats.filter((b) => b.status === 'available').length})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`px-2.5 py-1 text-xs font-mono border transition-all cursor-pointer ${
                statusFilter === 'pending'
                  ? 'border-[#f59e0b] bg-[#f59e0b] text-black font-bold shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                  : 'retro-btn text-[#f59e0b] hover:bg-[#f59e0b]/20'
              }`}
            >
              {t('pendingLabel')} ({sortedBeats.filter((b) => b.status === 'pending').length})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('unavailable')}
              className={`px-2.5 py-1 text-xs font-mono border transition-all cursor-pointer ${
                statusFilter === 'unavailable'
                  ? 'border-[#f43f5e] bg-[#f43f5e] text-white font-bold shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                  : 'retro-btn text-[#f43f5e] hover:bg-[#f43f5e]/20'
              }`}
            >
              {t('unavailableLabel')} ({sortedBeats.filter((b) => b.status === 'unavailable').length})
            </button>
          </div>

          {/* Search box */}
          <div className="flex items-center gap-3">
            <div className="relative min-w-[190px] flex-1 md:flex-initial">
              <Search className="w-3.5 h-3.5 text-[#a855f7] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder={t('archiveSearchPlaceholder')}
                className="w-full retro-inset text-xs font-mono text-[#f3e8ff] pl-8 pr-3 py-1 placeholder:text-[#7e22ce] focus:outline-none focus:ring-1 focus:ring-[#a855f7] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Column Headers for Clear Structure */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 bg-[#120726] border-b border-[#2e1065] text-[10px] font-mono text-[#c084fc] font-pixel uppercase tracking-wider select-none">
          <div className="col-span-3 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{t('colDate')}</span>
          </div>
          <div className="col-span-3 flex items-center gap-1">
            <Music2 className="w-3 h-3" />
            <span>{t('colInfo')}</span>
          </div>
          <div className="col-span-4" />
          <div className="col-span-2 text-right">{t('colStatus')}</div>
        </div>

        {/* Scrollable Track List Container with Drag-to-Scroll */}
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`h-[440px] sm:h-[500px] overflow-y-auto divide-y divide-[#151515] transition-colors relative ${
            isDragging ? 'cursor-grabbing select-none bg-[#020202]' : 'cursor-grab'
          }`}
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#333333 #080808',
          }}
        >
          {filteredBeats.length === 0 ? (
            <div className="p-12 text-center font-mono text-xs text-[#777777] flex flex-col items-center justify-center gap-2 h-full">
              <div>{t('noTracksFound')}</div>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('all');
                  setSearchFilter('');
                }}
                className="text-white underline hover:no-underline cursor-pointer"
              >
                {t('resetList')}
              </button>
            </div>
          ) : (
            filteredBeats.map((beat, index) => {
              const statusColor =
                beat.status === 'available'
                  ? 'text-[#2dd4bf] border-[#2dd4bf] bg-[#2dd4bf]/15'
                  : beat.status === 'unavailable'
                  ? 'text-[#f43f5e] border-[#f43f5e] bg-[#f43f5e]/15'
                  : 'text-[#f59e0b] border-[#f59e0b] bg-[#f59e0b]/15';

              const statusLabel =
                beat.status === 'available'
                  ? t('availableLabel')
                  : beat.status === 'unavailable'
                  ? t('unavailableLabel')
                  : t('pendingLabel');

              const isPlaying = playingBeatId === beat.beat_id;

              return (
                <div
                  key={beat.beat_id}
                  className={`p-4 sm:px-6 sm:py-3.5 transition-all cursor-default border-l-4 ${
                    isPlaying
                      ? 'bg-[#1f0d3d] border-[#d946ef] shadow-[inset_0_0_15px_rgba(168,85,247,0.25)]'
                      : 'hover:bg-[#150729] border-transparent'
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center">
                    {/* Col 1: Date (Non-clickable plain info) */}
                    <div className="md:col-span-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#c084fc] bg-[#1a0833] px-1.5 py-0.5 border border-[#581c87]">
                          #{String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="text-xs font-mono text-[#e9d5ff] font-medium tracking-tight">
                          {beat.updated_at.replace(' KST', '')}
                        </span>
                      </div>
                    </div>

                    {/* Col 2: Title & Musical Details (Non-clickable plain info) */}
                    <div className="md:col-span-3 space-y-1">
                      <div className="text-sm sm:text-base font-bold font-mono text-white truncate">
                        {beat.title}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] font-mono text-[#a855f7] flex-wrap">
                        {beat.bpm && <span>{beat.bpm} BPM</span>}
                        {beat.musical_key && (
                          <>
                            <span className="text-[#581c87]" aria-hidden="true">·</span>
                            <span>{beat.musical_key}</span>
                          </>
                        )}
                        {beat.genre && (
                          <>
                            <span className="text-[#581c87]" aria-hidden="true">·</span>
                            <span className="text-[#c084fc]">{beat.genre}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Col 3: ONLY INTERACTIVE AREA - Play Button & Waveform Analyzer */}
                    <div className="md:col-span-4 flex items-center gap-2.5">
                      {/* 1. PLAY BUTTON (Clickable) */}
                      <button
                        type="button"
                        onClick={(e) => handleTogglePlay(e, beat)}
                        className={`h-[36px] px-2.5 text-xs font-mono transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                          isPlaying
                            ? 'bg-[#d946ef] text-black border-2 border-[#d946ef] font-bold shadow-[0_0_15px_rgba(217,70,239,0.6)]'
                            : 'retro-btn text-[#f3e8ff] hover:text-[#d946ef]'
                        }`}
                        title="15초 오디오 미리듣기 재생/일시정지"
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="w-3.5 h-3.5 fill-current" />
                            <span className="text-[11px] hidden sm:inline font-bold">
                              {Math.floor(playbackTime)}s
                            </span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current text-[#2dd4bf]" />
                            <span className="text-[11px] hidden sm:inline text-[#2dd4bf] font-bold">15s</span>
                          </>
                        )}
                      </button>

                      {/* 2. ANALYZER (Clickable) */}
                      <div className="flex-1 min-w-0">
                        <TrackArchiveAnalyzerCanvas
                          isPlaying={isPlaying}
                          analyserNode={analyserRef.current}
                          peaks={beat.waveform_peaks}
                          title={beat.title}
                          onClick={(e) => handleTogglePlay(e, beat)}
                          elapsedTime={isPlaying ? playbackTime : 0}
                          maxDuration={maxDuration}
                        />
                      </div>
                    </div>

                    {/* Col 4: Status Badge (Non-clickable read-only badge) */}
                    <div className="md:col-span-2 flex items-center justify-start md:justify-end">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 border text-xs font-mono font-medium ${statusColor}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>[{statusLabel}]</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};
