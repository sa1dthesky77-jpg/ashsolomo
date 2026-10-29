/**
 * Helper to generate synthetic realistic beat waveform peaks (48 bars)
 */
export function generateDefaultPeaks(seedString = 'beat'): number[] {
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i);
    hash |= 0;
  }
  const peaks: number[] = [];
  const barCount = 48;
  for (let i = 0; i < barCount; i++) {
    // Rhythm pattern: accent on beat kicks (every 4 bars) and snares
    const isKick = i % 8 === 0;
    const isSnare = i % 8 === 4;
    const pseudoRand = Math.abs(Math.sin((hash + i * 13) * 0.17));
    let base = 0.25 + pseudoRand * 0.45;
    if (isKick) base = Math.min(1.0, base + 0.35);
    if (isSnare) base = Math.min(0.95, base + 0.25);
    peaks.push(Number(base.toFixed(2)));
  }
  return peaks;
}

/**
 * Extracts normalized peak values from an Audio File ArrayBuffer
 */
export async function extractWaveformPeaks(
  file: File,
  numPeaks = 48
): Promise<number[]> {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return generateDefaultPeaks(file.name);
    const ctx = new AudioCtx();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    const channelData = audioBuffer.getChannelData(0);
    const step = Math.floor(channelData.length / numPeaks);
    const peaks: number[] = [];

    for (let i = 0; i < numPeaks; i++) {
      let max = 0;
      const start = i * step;
      const end = Math.min(start + step, channelData.length);
      for (let j = start; j < end; j += 10) {
        const val = Math.abs(channelData[j]);
        if (val > max) max = val;
      }
      // Normalize to 0.15 - 1.0
      const normalized = Math.max(0.15, Math.min(1.0, max * 1.5));
      peaks.push(Number(normalized.toFixed(2)));
    }
    try {
      ctx.close();
    } catch {
      // ignore
    }
    return peaks;
  } catch (err) {
    console.warn('Failed to extract waveform, using default curve:', err);
    return generateDefaultPeaks(file.name);
  }
}
