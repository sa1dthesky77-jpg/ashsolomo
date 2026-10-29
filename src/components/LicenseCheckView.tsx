import React, { useState, useRef, useEffect } from 'react';
import { BeatItem } from '../types';
import { InstagramLink } from './InstagramLink';
import { AudioPreviewPlayer } from './AudioPreviewPlayer';
import { AllTracksArchiveView } from './AllTracksArchiveView';
import { SocialLinks } from './SocialLinks';
import { RetroWindowFrame } from './RetroWindowFrame';
import { useLanguage } from '../context/LanguageContext';
import { Search, X, ChevronRight, Sparkles, ArrowLeft, Terminal } from 'lucide-react';

interface LicenseCheckViewProps {
  beat: BeatItem;
  allBeats?: BeatItem[];
  onSelectBeat?: (beatId: string) => void;
  onTriggerInvalid?: () => void;
  onResetSearch?: () => void;
  onOpenAdmin?: () => void;
}

export const LicenseCheckView: React.FC<LicenseCheckViewProps> = ({
  beat,
  allBeats = [],
  onSelectBeat,
  onTriggerInvalid,
  onResetSearch,
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter beats based on query
  const matchingBeats = allBeats.filter((b) => {
    if (!searchQuery.trim()) return b.active;
    const q = searchQuery.toLowerCase().trim();
    return (
      b.active &&
      (b.title.toLowerCase().includes(q) ||
        (b.genre && b.genre.toLowerCase().includes(q)))
    );
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const trimmed = searchQuery.trim().toLowerCase();
    const found = allBeats.find(
      (b) =>
        b.active &&
        (b.title.toLowerCase() === trimmed ||
          b.title.toLowerCase().includes(trimmed))
    );

    if (found && onSelectBeat) {
      onSelectBeat(found.beat_id);
    } else if (onTriggerInvalid) {
      onTriggerInvalid();
    }
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  const handleSelectTrack = (beatId: string) => {
    if (onSelectBeat) {
      onSelectBeat(beatId);
    }
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  // Status label and color configuration
  // Mint for available, Pink/Red for unavailable, Amber for pending
  const getStatusConfig = () => {
    switch (beat.status) {
      case 'available':
        return {
          label: t('availableLabel'),
          textColor: 'text-[#2dd4bf]',
          borderColor: 'border-[#2dd4bf]',
          bgColor: 'bg-[#2dd4bf]/10',
          badgeClass: 'text-[#2dd4bf] border-[#2dd4bf] bg-[#2dd4bf]/15',
          title: t('availableTitle'),
          description: t('availableDesc'),
          showInstagram: false,
        };
      case 'unavailable':
        return {
          label: t('unavailableLabel'),
          textColor: 'text-[#f43f5e]',
          borderColor: 'border-[#f43f5e]',
          bgColor: 'bg-[#f43f5e]/10',
          badgeClass: 'text-[#f43f5e] border-[#f43f5e] bg-[#f43f5e]/15',
          title: t('unavailableTitle'),
          description: t('unavailableDesc'),
          showInstagram: true,
        };
      case 'pending':
        return {
          label: t('pendingLabel'),
          textColor: 'text-[#f59e0b]',
          borderColor: 'border-[#f59e0b]',
          bgColor: 'bg-[#f59e0b]/10',
          badgeClass: 'text-[#f59e0b] border-[#f59e0b] bg-[#f59e0b]/15',
          title: t('pendingTitle'),
          description: t('pendingDesc'),
          showInstagram: true,
        };
    }
  };

  const config = getStatusConfig();
  const safeFilename = beat.title.toUpperCase().replace(/[^A-Z0-9]/g, '_');

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 md:py-10 flex flex-col justify-between min-h-screen relative z-10">
      {/* Top Retro Internet Brand Bar */}
      <header className="border-b-2 border-[#581c87] pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#c084fc] uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#d946ef]" />
            <span className="font-pixel">RETRO CYBER INTERNET · BEAT VERIFIER</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-lg sm:text-2xl font-bold tracking-tight text-white drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
              prod by. Ash Solomo
            </h1>
            <SocialLinks iconClassName="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Status display in header */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="retro-inset px-3 py-1 text-xs font-mono flex items-center gap-2">
            <span className="text-[#a855f7] font-semibold text-[10px]">STATUS:</span>
            <span className={`font-bold ${config.textColor}`}>
              [{config.label}]
            </span>
          </div>
        </div>
      </header>

      {/* Main Status Panel */}
      <main className="py-2 md:py-6 space-y-10">
        <div className="w-full max-w-2xl mx-auto">
          {onResetSearch && (
            <div className="mb-3">
              <button
                type="button"
                onClick={onResetSearch}
                className="retro-btn text-xs font-mono text-[#c084fc] hover:text-white px-3 py-1.5 inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('backToSearch')}</span>
              </button>
            </div>
          )}

          {/* Retro Window Container */}
          <RetroWindowFrame
            title={`STATUS_${safeFilename}.EXE`}
            icon="disc"
            addressUrl={`ash://beats.net/license-check/${encodeURIComponent(beat.title)}`}
            onBack={onResetSearch}
            statusBarLeft={`TRACK: ${beat.title} · [${config.label}]`}
            statusBarRight={
              <span className="text-[#c084fc] text-[10px]">
                AUDIO ENGINE: 15s PREVIEW
              </span>
            }
          >
            <div className="space-y-6">
              {/* Beat Title & Search Section */}
              <div className="space-y-4 pb-6 border-b border-[#2e1065]">
                {/* Row Header with Label & Status */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-[#a855f7]" />
                    <span className="font-pixel text-[11px] text-[#c084fc] uppercase tracking-wider">
                      {t('trackResult')}
                    </span>
                  </div>

                  {/* Status Indicator Badge */}
                  <div className="font-mono text-xs sm:text-sm tracking-tight flex items-center">
                    <span className={`px-2.5 py-0.5 border font-bold text-xs ${config.badgeClass} shadow-sm`}>
                      {config.label}
                    </span>
                  </div>
                </div>

                {/* Integrated Search Box inside Track Title area */}
                <div ref={searchContainerRef} className="relative">
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <Search className="w-4 h-4 text-[#a855f7] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsDropdownOpen(true);
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                      placeholder={t('searchPlaceholder')}
                      className="w-full retro-inset text-xs font-mono text-[#f3e8ff] pl-9 pr-20 py-2.5 placeholder:text-[#7e22ce] focus:outline-none focus:ring-1 focus:ring-[#a855f7] transition-all"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            setIsDropdownOpen(false);
                          }}
                          className="text-[#a855f7] hover:text-white p-1 cursor-pointer"
                          title="검색어 지우기"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="submit"
                        className="retro-btn px-2.5 py-1 text-[11px] font-mono text-white hover:text-[#d946ef] cursor-pointer"
                      >
                        {t('searchBtn')}
                      </button>
                    </div>
                  </form>

                  {/* Autocomplete / Suggestions Dropdown */}
                  {isDropdownOpen && matchingBeats.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-[#0c051a] border border-[#7c3aed] shadow-2xl z-30 max-h-56 overflow-y-auto divide-y divide-[#2e1065]">
                      <div className="p-2 border-b border-[#2e1065] text-[10px] font-mono text-[#c084fc] uppercase flex justify-between bg-[#150a2c]">
                        <span>{t('registeredList')} ({matchingBeats.length})</span>
                        <span>{t('clickToVerify')}</span>
                      </div>
                      {matchingBeats.map((item) => {
                        const itemColor =
                          item.status === 'available'
                            ? 'text-[#2dd4bf]'
                            : item.status === 'unavailable'
                            ? 'text-[#f43f5e]'
                            : 'text-[#f59e0b]';

                        const itemLabel =
                          item.status === 'available'
                            ? t('availableLabel')
                            : item.status === 'unavailable'
                            ? t('unavailableLabel')
                            : t('pendingLabel');

                        const isCurrent = item.beat_id === beat.beat_id;

                        return (
                          <button
                            key={item.beat_id}
                            type="button"
                            onClick={() => handleSelectTrack(item.beat_id)}
                            className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs font-mono transition-colors border-b border-[#1f0d3d] last:border-b-0 cursor-pointer ${
                              isCurrent
                                ? 'bg-[#25104d] text-white'
                                : 'hover:bg-[#1a0b36] text-[#e9d5ff]'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <ChevronRight className="w-3 h-3 text-[#a855f7] shrink-0" />
                              <span className="font-semibold text-white truncate">
                                {item.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              <span className={`text-[11px] font-bold ${itemColor}`}>
                                [{itemLabel}]
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Current Beat Title with Play Button on Left & Waveform Analyzer */}
                <div className="pt-2">
                  <AudioPreviewPlayer
                    key={beat.beat_id}
                    audioUrl={beat.audio_url}
                    filename={beat.audio_filename}
                    previewDuration={15}
                    previewStart={beat.preview_start || 0}
                    fadeEnabled={beat.fade_enabled ?? true}
                    fadeDuration={beat.fade_duration ?? 2}
                    waveformPeaks={beat.waveform_peaks}
                    trackTitle={beat.title}
                    bpm={beat.bpm}
                    musicalKey={beat.musical_key}
                    genre={beat.genre}
                    showTitleWithPlayButton={true}
                  />
                </div>
              </div>

              {/* Status Notice Section */}
              <div className="space-y-3 retro-inset p-4">
                <div className="flex items-center gap-2">
                  <span className="font-pixel text-[10px] text-[#c084fc] uppercase tracking-wider">
                    ◆ NOTICE & VERIFICATION DETAILS
                  </span>
                </div>
                <h3 className="font-mono text-base sm:text-lg font-bold text-white leading-relaxed">
                  {config.title}
                </h3>
                <p className="font-mono text-xs sm:text-sm text-[#e9d5ff] leading-relaxed">
                  {config.description}
                </p>
              </div>

              {/* Public Note if exists */}
              {beat.public_note && (
                <div className="p-3.5 bg-[#120726] border border-[#4c1d95] text-xs font-mono text-[#d8b4fe]">
                  <span className="text-[#a855f7] block mb-1 uppercase text-[10px] tracking-wider font-pixel">
                    PRODUCER NOTE
                  </span>
                  {beat.public_note}
                </div>
              )}

              {/* Instagram Contact Area (for unavailable and pending) */}
              {config.showInstagram && (
                <div className="pt-2">
                  <div className="font-pixel text-[10px] text-[#c084fc] mb-2 uppercase tracking-wider">
                    DIRECT INQUIRY (1:1 CONTACT)
                  </div>
                  <InstagramLink labelPrefix="PRODUCER DM:" />
                </div>
              )}

              {/* Timestamp & Integrity Info */}
              <div className="pt-3 border-t border-[#2e1065] flex items-center justify-between text-[11px] font-mono text-[#a855f7] flex-wrap gap-2">
                <div>
                  <span>마지막 업데이트: </span>
                  <span className="text-[#f3e8ff]">{beat.updated_at}</span>
                </div>
                <div className="text-[#2dd4bf] text-[10px] font-pixel">
                  VERIFIED ASH REGISTRY
                </div>
              </div>
            </div>
          </RetroWindowFrame>
        </div>

        {/* All Uploaded Tracks Archive: Windows Explorer Style */}
        {allBeats && allBeats.length > 0 && onSelectBeat && (
          <AllTracksArchiveView
            beats={allBeats}
            currentBeatId={beat.beat_id}
            onSelectBeat={onSelectBeat}
          />
        )}
      </main>

      {/* Retro Internet Footer */}
      <footer className="border-t-2 border-[#3b0764] pt-4 mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#a855f7]">
        <div className="flex items-center gap-2">
          <span>© prod by. Ash Solomo. ALL RIGHTS RESERVED.</span>
          <SocialLinks iconClassName="w-3.5 h-3.5" />
        </div>
        <div className="flex items-center gap-3 text-[11px] font-pixel">
          <span className="text-[#c084fc]">⚡ VINTAGE PURPLE EXE SYSTEM</span>
          <span aria-hidden="true" className="text-[#581c87]">·</span>
          <span className="text-[#2dd4bf]">OFFICIAL VERIFIER</span>
        </div>
      </footer>
    </div>
  );
};
