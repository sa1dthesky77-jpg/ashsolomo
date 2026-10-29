import React, { useEffect, useRef } from 'react';
import { generateDefaultPeaks } from '../utils/audioUtils';

interface TrackArchiveAnalyzerCanvasProps {
  isPlaying: boolean;
  analyserNode: AnalyserNode | null;
  peaks?: number[];
  title: string;
  onClick: (e: React.MouseEvent) => void;
  elapsedTime: number;
  maxDuration?: number;
}

export const TrackArchiveAnalyzerCanvas: React.FC<TrackArchiveAnalyzerCanvasProps> = ({
  isPlaying,
  analyserNode,
  peaks: propPeaks,
  title,
  onClick,
  elapsedTime,
  maxDuration = 15,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const peaks = propPeaks && propPeaks.length > 0
    ? propPeaks
    : generateDefaultPeaks(title);

  // Peak hold data
  const barCount = 28;
  const peakHoldRef = useRef<number[]>(new Array(barCount).fill(0));
  const peakDecayRef = useRef<number[]>(new Array(barCount).fill(0));
  const phaseRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;
    const dataArray = new Uint8Array(barCount * 2);

    const render = () => {
      if (!isMounted) return;

      const dpr = window.devicePixelRatio || 1;
      const displayWidth = canvas.clientWidth || 220;
      const displayHeight = canvas.clientHeight || 34;

      if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const w = displayWidth;
      const h = displayHeight;

      // Deep purple cyber background with subtle border
      ctx.fillStyle = '#06020c';
      ctx.fillRect(0, 0, w, h);

      // Subtle horizontal center line
      ctx.strokeStyle = '#2e1065';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      if (analyserNode && isPlaying) {
        try {
          analyserNode.getByteFrequencyData(dataArray);
        } catch {
          // ignore
        }
      }

      phaseRef.current += isPlaying ? 0.08 : 0.01;

      const barWidth = (w - (barCount - 1) * 2) / barCount;
      const progressRatio = Math.min(1, Math.max(0, elapsedTime / maxDuration));
      const progressX = w * progressRatio;

      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + 2);
        let barHeight = 0;

        if (isPlaying) {
          if (analyserNode) {
            const bin = Math.min(dataArray.length - 1, Math.floor((i / barCount) * dataArray.length));
            const val = dataArray[bin] / 255;
            barHeight = Math.max(3, val * (h - 6));
          } else {
            // Procedural lively audio spectrum oscillation
            const wave1 = Math.sin(phaseRef.current * 1.5 + i * 0.4);
            const wave2 = Math.cos(phaseRef.current * 2.2 - i * 0.25);
            const amp = Math.abs(wave1 * 0.6 + wave2 * 0.4);
            const peakFactor = peaks[i % peaks.length] || 0.6;
            barHeight = Math.max(3, (amp * 0.7 + peakFactor * 0.3) * (h - 6));
          }
        } else {
          // Idle waveform silhouette
          const peakVal = peaks[i % peaks.length] || 0.4;
          barHeight = Math.max(3, peakVal * (h - 8));
        }

        // Peak hold decay
        if (barHeight >= peakHoldRef.current[i]) {
          peakHoldRef.current[i] = barHeight;
          peakDecayRef.current[i] = 0;
        } else {
          peakDecayRef.current[i] += 0.35;
          peakHoldRef.current[i] = Math.max(0, peakHoldRef.current[i] - peakDecayRef.current[i]);
        }

        const y = h - barHeight - 2;

        if (isPlaying) {
          // Active playing color: Electric Purple to Blue-Violet gradient
          const grad = ctx.createLinearGradient(0, y, 0, h);
          if (x <= progressX) {
            grad.addColorStop(0, '#d946ef');
            grad.addColorStop(0.5, '#a855f7');
            grad.addColorStop(1, '#4c1d95');
          } else {
            grad.addColorStop(0, '#818cf8');
            grad.addColorStop(0.5, '#6366f1');
            grad.addColorStop(1, '#2e1065');
          }
          ctx.fillStyle = grad;
          ctx.fillRect(x, y, barWidth, barHeight);

          // Peak dot: Mint
          if (peakHoldRef.current[i] > 3) {
            ctx.fillStyle = '#2dd4bf';
            ctx.fillRect(x, h - peakHoldRef.current[i] - 3, barWidth, 1.5);
          }
        } else {
          // Paused resting bars: Retro deep violet
          ctx.fillStyle = '#261047';
          ctx.fillRect(x, y, barWidth, barHeight);
        }
      }

      // Progress scrubber line when playing: Mint
      if (isPlaying && progressX > 0) {
        ctx.fillStyle = '#2dd4bf';
        ctx.fillRect(progressX - 1, 0, 2, h);
      }

      ctx.restore();

      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(render);
      }
    };

    render();

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(render);
    }

    return () => {
      isMounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, analyserNode, peaks, elapsedTime, maxDuration]);

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      title="아날라이저 클릭하여 15초 오디오 미리듣기 재생/일시정지"
      className="relative flex items-center justify-center retro-inset hover:border-[#a855f7] transition-all cursor-pointer group h-[36px] w-full max-w-[260px] overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />

      {/* Floating status tag */}
      <div className="absolute right-1.5 bottom-1 pointer-events-none text-[9px] font-mono tracking-tighter">
        {isPlaying ? (
          <span className="text-[#2dd4bf] bg-[#090314]/90 px-1 py-0.5 border border-[#2dd4bf]/40 font-bold font-pixel">
            RTA ACTIVE
          </span>
        ) : (
          <span className="text-[#7e22ce] group-hover:text-[#c084fc] transition-colors font-pixel">
            ANALYZER
          </span>
        )}
      </div>

      {/* Center click prompt on hover when paused */}
      {!isPlaying && (
        <div className="absolute inset-0 bg-[#090314]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="text-[10px] font-mono text-[#f3e8ff] tracking-wider bg-[#1d0b38] px-2 py-0.5 border border-[#a855f7] shadow-sm font-pixel">
            ▶ 15s 분석 재생
          </span>
        </div>
      )}
    </div>
  );
};
