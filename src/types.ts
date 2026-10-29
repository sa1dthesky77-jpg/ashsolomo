export type BeatStatus = 'available' | 'unavailable' | 'pending';

export interface BeatItem {
  beat_id: string;      // e.g. "ASH-2026-089"
  slug: string;         // e.g. "midnight-drive-x79"
  title: string;        // e.g. "MIDNIGHT DRIVE"
  status: BeatStatus;   // 'available' | 'unavailable' | 'pending'
  updated_at: string;   // e.g. "2026-10-28 14:20:00 KST"
  public_note?: string; // Optional public note
  active: boolean;      // Whether track is active
  bpm?: number;
  musical_key?: string;
  genre?: string;
  audio_url?: string;        // Audio data URL or file link
  audio_filename?: string;   // Name of uploaded file (e.g. "midnight_drive.mp3")
  preview_duration?: number; // Preview limit in seconds (fixed: 15)
  preview_start?: number;    // Start offset in seconds (default: 0)
  fade_enabled?: boolean;    // Apply fade in & fade out (default: true)
  fade_duration?: number;    // Fade duration in seconds (default: 2)
  waveform_peaks?: number[]; // Amplitude peaks for visualization
}

export type ViewMode = 'public' | 'admin' | '404';
