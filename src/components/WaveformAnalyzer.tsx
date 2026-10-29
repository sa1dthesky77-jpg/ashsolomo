import React, { useEffect, useRef, useState } from 'react';
import { Activity, BarChart2, Radio, Zap } from 'lucide-react';

export type AnalyzerMode = 'dual' | 'spectrum' | 'oscilloscope';

interface WaveformAnalyzerProps {
  isPlaying: boolean;
  analyserNode?: AnalyserNode | null;
  bpm?: number;
  className?: string;
  height?: number;
}

export const WaveformAnalyzer: React.FC<WaveformAnalyzerProps> = ({
  isPlaying,
  analyserNode,
  bpm = 130,
  className = '',
  height = 140,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [mode, setMode] = useState<AnalyzerMode>('dual');
  const [peakDb, setPeakDb] = useState<number>(-48);
  const [rmsDb, setRmsDb] = useState<number>(-48);

  // Peak hold array for spectrum bars
  const peakHoldRef = useRef<number[]>(new Array(36).fill(0));
  const peakHoldDecayRef = useRef<number[]>(new Array(36).fill(0));

  // Synthesized fallback phase
  const phaseRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;
    const barCount = 36;

    // Buffer for Web Audio analyser
    const bufferLength = analyserNode ? analyserNode.frequencyBinCount : 128;
    const freqData = new Uint8Array(bufferLength);
    const timeData = new Uint8Array(bufferLength);

    const render = (time: number) => {
      if (!isMounted) return;
      const deltaTime = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      // Handle Canvas DPI
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight || height;

      if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const w = displayWidth;
      const h = displayHeight;

      // Clear with pitch black background
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, w, h);

      // Draw subtle background studio dB grid
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#141414';
      const gridDbs = [0.2, 0.4, 0.6, 0.8];
      gridDbs.forEach((ratio) => {
        const y = Math.round(h * ratio);
        ctx.beginPath();
        ctx.moveTo(28, y);
        ctx.lineTo(w - 6, y);
        ctx.stroke();
      });

      // Left dB labels
      ctx.font = '9px monospace';
      ctx.fillStyle = '#444444';
      ctx.textAlign = 'right';
      ctx.fillText('-0dB', 24, 12);
      ctx.fillText('-12dB', 24, h * 0.35);
      ctx.fillText('-24dB', 24, h * 0.65);
      ctx.fillText('-48dB', 24, h - 6);

      // Data retrieval
      let hasRealData = false;
      if (isPlaying && analyserNode) {
        try {
          analyserNode.getByteFrequencyData(freqData);
          analyserNode.getByteTimeDomainData(timeData);
          // Check if buffer contains non-zero signal
          let sum = 0;
          for (let i = 0; i < 32; i++) sum += freqData[i];
          if (sum > 0) hasRealData = true;
        } catch {
          hasRealData = false;
        }
      }

      // Compute or simulate amplitudes
      const barAmplitudes: number[] = new Array(barCount).fill(0);
      const waveformPoints: number[] = new Array(w - 36).fill(h / 2);

      if (isPlaying) {
        phaseRef.current += deltaTime * (bpm / 60) * Math.PI * 2;
        const phase = phaseRef.current;

        if (hasRealData) {
          // Downsample FFT bins to 36 logarithmic/octave bands
          for (let b = 0; b < barCount; b++) {
            // Logarithmic bin mapping for musical perception
            const binStart = Math.floor(Math.pow(b / barCount, 2) * (bufferLength * 0.7));
            const binEnd = Math.max(
              binStart + 1,
              Math.floor(Math.pow((b + 1) / barCount, 2) * (bufferLength * 0.7))
            );
            let binSum = 0;
            let binCount = 0;
            for (let i = binStart; i < binEnd && i < bufferLength; i++) {
              binSum += freqData[i];
              binCount++;
            }
            const avg = binCount > 0 ? binSum / binCount : 0;
            barAmplitudes[b] = avg / 255;
          }

          // Oscilloscope time-domain wave
          const waveW = w - 36;
          for (let x = 0; x < waveW; x++) {
            const dataIdx = Math.floor((x / waveW) * bufferLength);
            const raw = (timeData[dataIdx] - 128) / 128; // -1.0 to 1.0
            waveformPoints[x] = h / 2 + raw * (h * 0.38);
          }
        } else {
          // Synthetic beat-reactive analyzer (sub-bass kick + hihat sizzle + pads)
          const kickPulse = Math.pow(Math.max(0, Math.sin(phase)), 8);
          const snarePulse = Math.pow(Math.max(0, Math.sin(phase + Math.PI)), 12);
          const hatPulse = Math.pow(Math.max(0, Math.sin(phase * 4)), 4);

          for (let b = 0; b < barCount; b++) {
            const relFreq = b / barCount;
            let amp = 0.08 + 0.05 * Math.sin(phase * 0.5 + b);

            // Sub & Bass (bins 0-8)
            if (b < 8) {
              amp += kickPulse * 0.85 * (1 - b / 10);
            }
            // Mids & Snare (bins 8-20)
            if (b >= 6 && b <= 22) {
              amp += snarePulse * 0.6 * Math.sin(((b - 6) / 16) * Math.PI);
            }
            // Highs & Hats (bins 20-35)
            if (b > 18) {
              amp += hatPulse * 0.45 * ((b - 18) / 18);
            }

            // Natural audio frequency taper
            const noise = 0.08 * Math.sin(b * 19.3 + phase * 3);
            barAmplitudes[b] = Math.max(0.04, Math.min(0.98, amp + noise));
          }

          // Synthetic oscilloscope wave
          const waveW = w - 36;
          for (let x = 0; x < waveW; x++) {
            const normX = x / waveW;
            const w1 = Math.sin(normX * 18 + phase * 4) * kickPulse * (h * 0.3);
            const w2 = Math.sin(normX * 42 + phase * 8) * snarePulse * (h * 0.18);
            const w3 = Math.sin(normX * 80 + phase * 12) * hatPulse * (h * 0.1);
            waveformPoints[x] = h / 2 + w1 + w2 + w3;
          }
        }
      } else {
        // Idle state: subtle resting line
        for (let b = 0; b < barCount; b++) {
          barAmplitudes[b] = 0.03;
        }
        const waveW = w - 36;
        for (let x = 0; x < waveW; x++) {
          waveformPoints[x] = h / 2;
        }
      }

      // Update Peak dB & RMS readouts
      let maxAmp = 0;
      let sumSquares = 0;
      for (let i = 0; i < barCount; i++) {
        const val = barAmplitudes[i];
        if (val > maxAmp) maxAmp = val;
        sumSquares += val * val;
      }
      const calculatedRms = Math.sqrt(sumSquares / barCount);
      const targetPeakDb = isPlaying ? Math.max(-48, Math.round(20 * Math.log10(Math.max(0.001, maxAmp)))) : -48;
      const targetRmsDb = isPlaying ? Math.max(-48, Math.round(20 * Math.log10(Math.max(0.001, calculatedRms)))) : -48;

      setPeakDb((prev) => Math.round(prev * 0.8 + targetPeakDb * 0.2));
      setRmsDb((prev) => Math.round(prev * 0.8 + targetRmsDb * 0.2));

      // Draw RTA Spectrum Bars if mode is 'dual' or 'spectrum'
      const startX = 30;
      const availableW = w - startX - 8;
      const barSpacing = 2;
      const totalSpacing = barSpacing * (barCount - 1);
      const barWidth = Math.max(2, (availableW - totalSpacing) / barCount);

      if (mode === 'dual' || mode === 'spectrum') {
        const barOpacity = mode === 'dual' ? 0.8 : 1.0;

        for (let b = 0; b < barCount; b++) {
          const amp = barAmplitudes[b];
          const barH = Math.max(3, amp * (h - 18));
          const bx = startX + b * (barWidth + barSpacing);
          const by = h - 14 - barH;

          // Color gradient: green for normal, amber for high, white for peak
          let barColor = '#22c55e';
          if (amp > 0.85) {
            barColor = '#ffffff';
          } else if (amp > 0.65) {
            barColor = '#eab308';
          }

          ctx.fillStyle = barColor;
          ctx.globalAlpha = isPlaying ? barOpacity : 0.25;
          ctx.fillRect(bx, by, barWidth, barH);

          // Update & Draw Peak Hold Marker (dots/lines)
          if (amp >= peakHoldRef.current[b]) {
            peakHoldRef.current[b] = amp;
            peakHoldDecayRef.current[b] = 0;
          } else {
            peakHoldDecayRef.current[b] += deltaTime;
            if (peakHoldDecayRef.current[b] > 0.15) {
              peakHoldRef.current[b] = Math.max(0, peakHoldRef.current[b] - deltaTime * 0.8);
            }
          }

          const peakH = peakHoldRef.current[b] * (h - 18);
          const peakY = h - 14 - peakH;

          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = isPlaying ? 0.95 : 0.2;
          ctx.fillRect(bx, Math.max(4, peakY - 1), barWidth, 1.5);
        }
      }

      // Draw Oscilloscope Waveform if mode is 'dual' or 'oscilloscope'
      if (mode === 'dual' || mode === 'oscilloscope') {
        ctx.globalAlpha = 1.0;
        ctx.beginPath();
        const waveStartX = 30;
        const waveLen = waveformPoints.length;

        for (let i = 0; i < waveLen; i++) {
          const wx = waveStartX + i;
          const wy = waveformPoints[i];
          if (i === 0) {
            ctx.moveTo(wx, wy);
          } else {
            ctx.lineTo(wx, wy);
          }
        }

        ctx.strokeStyle = mode === 'oscilloscope' ? '#22c55e' : 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = mode === 'oscilloscope' ? 1.5 : 1.2;
        ctx.stroke();

        // Subtle glow in oscilloscope mode
        if (mode === 'oscilloscope' && isPlaying) {
          ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      }

      // Bottom Frequency Scale Markers
      ctx.globalAlpha = 1.0;
      ctx.font = '8.5px monospace';
      ctx.fillStyle = '#666666';
      ctx.textAlign = 'center';

      const freqMarkers = [
        { label: '30', xPct: 0.05 },
        { label: '60', xPct: 0.15 },
        { label: '120', xPct: 0.28 },
        { label: '250', xPct: 0.42 },
        { label: '500', xPct: 0.55 },
        { label: '1k', xPct: 0.68 },
        { label: '4k', xPct: 0.82 },
        { label: '16k', xPct: 0.95 },
      ];

      freqMarkers.forEach((m) => {
        const fx = startX + m.xPct * availableW;
        ctx.fillText(m.label, fx, h - 2);
      });

      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      isMounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, analyserNode, bpm, mode, height]);

  return (
    <div className={`border border-[#222222] bg-[#050505] font-mono select-none ${className}`}>
      {/* Waveform Analyzer Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#181818] bg-[#080808] text-xs flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#22c55e]" />
          <span className="text-white font-bold tracking-wider text-[11px] uppercase">
            WAVEFORM ANALYZER
          </span>
          <span className="text-[10px] text-[#888888] hidden sm:inline">
            [RTA 36-BAND · 44.1kHz]
          </span>
        </div>

        {/* Real-time Level Meter & Mode Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Real-time dB readout */}
          <div className="flex items-center gap-2 text-[10px] text-[#aaaaaa]">
            <span className="flex items-center gap-1">
              <span className="text-[#666666]">PEAK</span>
              <span
                className={`tabular-nums font-semibold ${
                  peakDb > -3 ? 'text-[#ef4444]' : peakDb > -12 ? 'text-[#f59e0b]' : 'text-white'
                }`}
              >
                {peakDb > -48 ? `${peakDb} dB` : '-INF'}
              </span>
            </span>
            <span className="text-[#333333]">|</span>
            <span className="flex items-center gap-1">
              <span className="text-[#666666]">RMS</span>
              <span className="tabular-nums font-semibold text-[#888888]">
                {rmsDb > -48 ? `${rmsDb} dB` : '-INF'}
              </span>
            </span>
          </div>

          {/* Analyzer View Mode Switcher */}
          <div className="flex items-center border border-[#252525] bg-[#000000] p-0.5 text-[10px]">
            <button
              type="button"
              onClick={() => setMode('dual')}
              title="듀얼 모드 (스펙트럼 + 오실로스코프 파형)"
              className={`px-1.5 py-0.5 cursor-pointer transition-colors ${
                mode === 'dual' ? 'bg-white text-black font-semibold' : 'text-[#888888] hover:text-white'
              }`}
            >
              DUAL
            </button>
            <button
              type="button"
              onClick={() => setMode('spectrum')}
              title="스펙트럼 RTA 주파수 바 모드"
              className={`px-1.5 py-0.5 cursor-pointer transition-colors ${
                mode === 'spectrum' ? 'bg-white text-black font-semibold' : 'text-[#888888] hover:text-white'
              }`}
            >
              RTA
            </button>
            <button
              type="button"
              onClick={() => setMode('oscilloscope')}
              title="오실로스코프 파형 모드"
              className={`px-1.5 py-0.5 cursor-pointer transition-colors ${
                mode === 'oscilloscope' ? 'bg-white text-black font-semibold' : 'text-[#888888] hover:text-white'
              }`}
            >
              WAVE
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Canvas */}
      <div className="relative w-full overflow-hidden bg-[#050505]">
        <canvas
          ref={canvasRef}
          className="w-full block"
          style={{ height: `${height}px` }}
        />

        {/* Ambient status overlay badge */}
        <div className="absolute top-2 right-2 pointer-events-none flex items-center gap-1.5">
          {isPlaying ? (
            <span className="flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-mono text-[#22c55e] border border-[#22c55e]/40 bg-[#000000]/80">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-ping" />
              <span>LIVE ANALYZING</span>
            </span>
          ) : (
            <span className="px-1.5 py-0.5 text-[9px] font-mono text-[#555555] border border-[#222222] bg-[#000000]/80">
              STANDBY
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
