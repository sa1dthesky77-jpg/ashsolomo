import { BeatItem } from '../types';

export const INITIAL_BEATS: BeatItem[] = [
  {
    beat_id: 'ASH-2026-105',
    slug: 'neon-shadows-z88',
    title: 'NEON SHADOWS',
    status: 'available',
    updated_at: '2026-10-28 19:30:00 KST',
    public_note: '신규 업로드 / 라이선스 미배정 / 15초 프리뷰 등록 완료',
    active: true,
    bpm: 144,
    musical_key: 'D# Minor',
    genre: 'Cyber Trap / Wave',
    audio_filename: 'neon_shadows_15s_preview.mp3',
    preview_duration: 15,
    preview_start: 0,
    fade_enabled: true,
    fade_duration: 2,
  },
  {
    beat_id: 'ASH-2026-092',
    slug: 'blue-velvet-p21',
    title: 'BLUE VELVET',
    status: 'pending',
    updated_at: '2026-10-28 18:10:04 KST',
    public_note: '아티스트 협의 및 계약서 검토 진행 중',
    active: true,
    bpm: 96,
    musical_key: 'C Minor',
    genre: 'Soul Hip-Hop / Chill',
    audio_filename: 'blue_velvet_15s_preview.mp3',
    preview_duration: 15,
    preview_start: 0,
    fade_enabled: true,
    fade_duration: 2,
  },
  {
    beat_id: 'ASH-2026-089',
    slug: 'midnight-drive-x79',
    title: 'MIDNIGHT DRIVE',
    status: 'unavailable',
    updated_at: '2026-10-28 17:45:12 KST',
    public_note: '독점 라이선스(Exclusive) 양도 계약 완료',
    active: true,
    bpm: 132,
    musical_key: 'F# Minor',
    genre: 'Dark R&B / Trap',
    audio_filename: 'midnight_drive_15s_preview.mp3',
    preview_duration: 15,
    preview_start: 0,
    fade_enabled: true,
    fade_duration: 2,
  },
  {
    beat_id: 'ASH-2026-095',
    slug: 'tokyo-drifting-m44',
    title: 'TOKYO DRIFTING',
    status: 'available',
    updated_at: '2026-10-28 14:20:00 KST',
    public_note: '라이선스 미배정 / 즉시 작업 및 문의 가능',
    active: true,
    bpm: 140,
    musical_key: 'D Minor',
    genre: 'Synthwave / Trap',
    audio_filename: 'tokyo_drifting_15s_preview.mp3',
    preview_duration: 15,
    preview_start: 0,
    fade_enabled: true,
    fade_duration: 2,
  },
  {
    beat_id: 'ASH-2026-101',
    slug: 'ghost-city-a90',
    title: 'GHOST CITY',
    status: 'available',
    updated_at: '2026-10-28 12:00:00 KST',
    public_note: '라이선스 미배정 / 1차 가이드 보컬 미포함',
    active: true,
    bpm: 120,
    musical_key: 'G# Minor',
    genre: 'Ambient Boom Bap',
    audio_filename: 'ghost_city_15s_preview.mp3',
    preview_duration: 15,
    preview_start: 0,
    fade_enabled: true,
    fade_duration: 2,
  },
  {
    beat_id: 'ASH-2026-084',
    slug: 'seoul-rain-k12',
    title: 'SEOUL RAIN',
    status: 'pending',
    updated_at: '2026-10-27 22:15:00 KST',
    public_note: '해외 배급사 라이선스 협의 대기',
    active: true,
    bpm: 88,
    musical_key: 'A Minor',
    genre: 'Lo-Fi / R&B',
    audio_filename: 'seoul_rain_15s_preview.mp3',
    preview_duration: 15,
    preview_start: 0,
    fade_enabled: true,
    fade_duration: 2,
  },
  {
    beat_id: 'ASH-2026-078',
    slug: 'cosmic-drift-c33',
    title: 'COSMIC DRIFT',
    status: 'available',
    updated_at: '2026-10-27 16:40:00 KST',
    public_note: '라이선스 즉시 취득 가능',
    active: true,
    bpm: 128,
    musical_key: 'E Minor',
    genre: 'Electronic / Trap',
    audio_filename: 'cosmic_drift_15s_preview.mp3',
    preview_duration: 15,
    preview_start: 0,
    fade_enabled: true,
    fade_duration: 2,
  },
  {
    beat_id: 'ASH-2026-072',
    slug: 'silent-echoes-s45',
    title: 'SILENT ECHOES',
    status: 'unavailable',
    updated_at: '2026-10-26 11:05:00 KST',
    public_note: '아티스트 정규 앨범 수록곡 계약 완료',
    active: true,
    bpm: 105,
    musical_key: 'B Minor',
    genre: 'Cinematic Hip-Hop',
    audio_filename: 'silent_echoes_15s_preview.mp3',
    preview_duration: 15,
    preview_start: 0,
    fade_enabled: true,
    fade_duration: 2,
  },
];

const STORAGE_KEY = 'ash_solomo_beats_v4';

export function getStoredBeats(): BeatItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BEATS));
      return INITIAL_BEATS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_BEATS;
  } catch {
    return INITIAL_BEATS;
  }
}

export function saveStoredBeats(beats: BeatItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(beats));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export function resetStoredBeats(): BeatItem[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BEATS));
  } catch {
    // ignore
  }
  return INITIAL_BEATS;
}

export function generateRandomSlug(title: string): string {
  const sanitized = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'beat';
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${sanitized}-${randomSuffix}`;
}

export function formatCurrentKstTimestamp(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss} KST`;
}

/**
 * Parses KST string e.g. "2026-10-28 19:30:00 KST" into timestamp for accurate chronological sorting
 */
export function parseKstDate(dateStr: string): number {
  if (!dateStr) return 0;
  try {
    const cleaned = dateStr.replace(' KST', '').trim().replace(' ', 'T');
    const d = new Date(cleaned);
    const time = d.getTime();
    if (!isNaN(time)) return time;
    const fallback = Date.parse(dateStr);
    return isNaN(fallback) ? 0 : fallback;
  } catch {
    return 0;
  }
}
