import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
  color: string;
}

interface CosmicDust {
  x: number;
  y: number;
  speedY: number;
  speedX: number;
  size: number;
  alpha: number;
}

/**
 * Purple Retro Internet + Cosmic Space Starfield Canvas
 * - Twinkling cosmic stars with electric purple & blue-violet starlight
 * - Retro cyberspace horizon grid lines
 * - Real-time audio spectrum analyzer responding to beat playback
 */
export const BackgroundWaveform: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const activeAnalyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    const handleAudioEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ isPlaying: boolean; analyser?: AnalyserNode | null }>;
      isPlayingRef.current = !!customEvent.detail?.isPlaying;
      activeAnalyserRef.current = customEvent.detail?.analyser || null;
    };

    window.addEventListener('app-audio-state', handleAudioEvent);
    return () => {
      window.removeEventListener('app-audio-state', handleAudioEvent);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let isMounted = true;
    let time = 0;
    const barCount = 42;
    const peakHold: number[] = new Array(barCount).fill(0);
    const dataArray = new Uint8Array(barCount * 2);

    // Cosmic starfield generation
    const starCount = 140;
    const starColors = [
      '#ffffff',
      '#f3e8ff',
      '#c084fc',
      '#a855f7',
      '#818cf8',
      '#38bdf8',
    ];
    const stars: Star[] = [];

    const initStars = (w: number, h: number) => {
      stars.length = 0;
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() < 0.2 ? Math.random() * 2 + 1.2 : Math.random() * 1.2 + 0.6,
          baseAlpha: Math.random() * 0.6 + 0.25,
          twinkleSpeed: Math.random() * 0.04 + 0.015,
          phase: Math.random() * Math.PI * 2,
          color: starColors[Math.floor(Math.random() * starColors.length)],
        });
      }
    };

    // Cosmic dust particles drifting upward
    const dustCount = 30;
    const dustParticles: CosmicDust[] = [];
    const initDust = (w: number, h: number) => {
      dustParticles.length = 0;
      for (let i = 0; i < dustCount; i++) {
        dustParticles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          speedY: -(Math.random() * 0.35 + 0.1),
          speedX: (Math.random() - 0.5) * 0.15,
          size: Math.random() * 1.5 + 0.5,
          alpha: Math.random() * 0.4 + 0.1,
        });
      }
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      initStars(w, h);
      initDust(w, h);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      if (!isMounted) return;

      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;

      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        initStars(w, h);
        initDust(w, h);
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Deep cosmic gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#05020a');
      bgGrad.addColorStop(0.5, '#090314');
      bgGrad.addColorStop(1, '#0e041d');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      time += 0.02;

      // 1. Draw Stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const alpha = Math.max(
          0.1,
          s.baseAlpha + Math.sin(time * s.twinkleSpeed * 10 + s.phase) * 0.35
        );
        ctx.fillStyle = s.color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(Math.floor(s.x), Math.floor(s.y), s.size, s.size);

        // Subtle 4-point sparkle for larger stars
        if (s.size > 2.0 && alpha > 0.6) {
          ctx.strokeStyle = s.color;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(s.x - 3, s.y);
          ctx.lineTo(s.x + 3, s.y);
          ctx.moveTo(s.x, s.y - 3);
          ctx.lineTo(s.x, s.y + 3);
          ctx.stroke();
        }
      }

      // 2. Draw Cosmic Dust drifting
      ctx.fillStyle = '#c084fc';
      for (let i = 0; i < dustParticles.length; i++) {
        const p = dustParticles[i];
        p.y += p.speedY;
        p.x += p.speedX;
        if (p.y < 0) p.y = h;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;

        ctx.globalAlpha = p.alpha;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }

      // 3. Retro Cyber Perspective Grid at bottom
      const gridHorizon = h * 0.72;
      ctx.globalAlpha = 0.18;
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1;

      // Horizontal perspective lines
      for (let i = 0; i < 7; i++) {
        const progress = Math.pow(i / 6, 2);
        const y = gridHorizon + progress * (h - gridHorizon);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Vanishing lines to center horizon
      const centerX = w * 0.5;
      const stepCount = 14;
      for (let i = -stepCount; i <= stepCount; i++) {
        const targetX = centerX + (i * w) / (stepCount * 0.85);
        ctx.beginPath();
        ctx.moveTo(centerX, gridHorizon);
        ctx.lineTo(targetX, h);
        ctx.stroke();
      }

      // 4. Audio-reactive Spectrum Visualizer along bottom
      const isPlaying = isPlayingRef.current;
      const analyser = activeAnalyserRef.current;

      if (analyser && isPlaying) {
        try {
          analyser.getByteFrequencyData(dataArray);
        } catch {
          // fallback
        }
      }

      const barWidth = Math.max(3, (w / barCount) * 0.65);
      const gap = (w - barWidth * barCount) / (barCount + 1);
      const maxSpectrumH = Math.min(180, h * 0.28);

      for (let i = 0; i < barCount; i++) {
        let value = 0;
        if (isPlaying && analyser) {
          const raw = dataArray[i * 2] || 0;
          value = raw / 255;
        } else {
          // Gentle ambient cyber pulse
          value =
            Math.sin(time * 1.5 + i * 0.25) * 0.12 +
            Math.cos(time * 0.8 - i * 0.15) * 0.08 +
            0.14;
        }

        const barH = Math.max(3, value * maxSpectrumH);
        const x = gap + i * (barWidth + gap);
        const y = h - barH;

        // Gradient for bars: Blue-violet -> Electric Purple -> Neon Pink
        const barGrad = ctx.createLinearGradient(0, y + barH, 0, y);
        barGrad.addColorStop(0, 'rgba(76, 29, 149, 0.4)');
        barGrad.addColorStop(0.6, 'rgba(168, 85, 247, 0.7)');
        barGrad.addColorStop(1, 'rgba(217, 70, 239, 0.95)');

        ctx.globalAlpha = isPlaying ? 0.85 : 0.45;
        ctx.fillStyle = barGrad;
        ctx.fillRect(x, y, barWidth, barH);

        // Peak hold dot
        if (barH > peakHold[i]) {
          peakHold[i] = barH;
        } else {
          peakHold[i] = Math.max(0, peakHold[i] - 1.2);
        }

        const peakY = h - peakHold[i] - 2;
        ctx.fillStyle = '#2dd4bf'; // Mint peak indicator
        ctx.globalAlpha = isPlaying ? 0.9 : 0.5;
        ctx.fillRect(x, peakY, barWidth, 2);
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      isMounted = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.95 }}
      aria-hidden="true"
    />
  );
};
