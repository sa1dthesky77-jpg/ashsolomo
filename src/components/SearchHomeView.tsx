import React, { useState, useRef, useEffect } from 'react';
import { BeatItem } from '../types';
import { Search, ChevronRight, X, Sparkles, Terminal } from 'lucide-react';
import { AllTracksArchiveView } from './AllTracksArchiveView';
import { SocialLinks } from './SocialLinks';
import { RetroWindowFrame } from './RetroWindowFrame';
import { useLanguage } from '../context/LanguageContext';

interface SearchHomeViewProps {
  beats: BeatItem[];
  onSelectBeat: (beatId: string) => void;
  onTriggerInvalid: () => void;
}

export const SearchHomeView: React.FC<SearchHomeViewProps> = ({
  beats,
  onSelectBeat,
  onTriggerInvalid,
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeBeats = beats.filter((b) => b.active);

  // Filtered suggestions
  const matchingBeats = activeBeats.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      b.title.toLowerCase().includes(q) ||
      (b.genre && b.genre.toLowerCase().includes(q))
    );
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const trimmed = searchQuery.trim().toLowerCase();
    const found = activeBeats.find(
      (b) =>
        b.title.toLowerCase() === trimmed ||
        b.title.toLowerCase().includes(trimmed)
    );

    if (found) {
      onSelectBeat(found.beat_id);
    } else {
      onTriggerInvalid();
    }
  };

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

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="retro-inset px-2.5 py-1 text-xs font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2dd4bf] animate-ping" />
            <span className="text-[#a855f7] font-semibold text-[10px]">NET: ONLINE</span>
            <span className="text-[#2e1065]">|</span>
            <span className="text-[#2dd4bf] text-[11px] font-bold">READY</span>
          </div>
        </div>
      </header>

      {/* Main EXE Window: Beat License Lookup Box */}
      <main className="py-2 md:py-6 space-y-10">
        <RetroWindowFrame
          title="BEAT_LICENSE_LOOKUP.EXE"
          icon="disc"
          addressUrl="ash://retro-cyber.net/beats/lookup"
          statusBarLeft="STATUS: AWAITING QUERY · 44.1kHz ENGINE"
          statusBarRight={
            <span className="text-[#c084fc] text-[10px]">
              TOTAL TRACKS: {activeBeats.length}
            </span>
          }
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-[#c084fc]">
                <Terminal className="w-3.5 h-3.5 text-[#a855f7]" />
                <span className="font-pixel text-[11px] uppercase tracking-wider">
                  [1] BEAT LICENSE VERIFICATION PORTAL
                </span>
              </div>
              <h2 className="font-mono text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>{t('lookupTitle')}</span>
              </h2>
              <p className="font-mono text-xs sm:text-sm text-[#d8b4fe] leading-relaxed">
                {t('lookupDesc')}
              </p>
            </div>

            {/* Search Input Box */}
            <div ref={containerRef} className="relative pt-1">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="w-4 h-4 text-[#a855f7] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  placeholder={t('searchPlaceholder')}
                  autoFocus
                  className="w-full retro-inset text-xs font-mono text-[#f3e8ff] pl-10 pr-24 py-3 placeholder:text-[#7e22ce] focus:outline-none focus:ring-1 focus:ring-[#a855f7] transition-all"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-[#a855f7] hover:text-white p-1 cursor-pointer"
                      title="입력 지우기"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="retro-btn px-3 py-1.5 text-xs font-mono font-bold text-white hover:text-[#d946ef] cursor-pointer shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                  >
                    {t('searchBtn')}(<u>S</u>)
                  </button>
                </div>
              </form>

              {/* Suggestions / Quick selection list */}
              {isFocused && (
                <div className="mt-2 retro-window border border-[#7c3aed] bg-[#0c051a] divide-y divide-[#2e1065] max-h-60 overflow-y-auto z-30 relative shadow-2xl">
                  <div className="p-2 text-[10px] font-mono text-[#c084fc] uppercase flex justify-between bg-[#150a2c]">
                    <span>{t('registeredList')} ({matchingBeats.length})</span>
                    <span>{t('clickToVerify')}</span>
                  </div>
                  {matchingBeats.length === 0 ? (
                    <div className="p-4 text-center text-xs font-mono text-[#a855f7]">
                      {t('noMatch')}
                    </div>
                  ) : (
                    matchingBeats.map((item) => {
                      // Status colors: Mint (available), Pink/Red (unavailable), Amber (pending)
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

                      return (
                        <button
                          key={item.beat_id}
                          type="button"
                          onClick={() => onSelectBeat(item.beat_id)}
                          className="w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs font-mono hover:bg-[#200f40] transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <ChevronRight className="w-3.5 h-3.5 text-[#a855f7] group-hover:text-white transition-colors shrink-0" />
                            <span className="font-semibold text-white group-hover:text-[#c084fc] group-hover:underline underline-offset-4 truncate">
                              {item.title}
                            </span>
                            {item.genre && (
                              <span className="text-[11px] text-[#7e22ce] shrink-0 hidden sm:inline">
                                · {item.genre}
                              </span>
                            )}
                          </div>
                          <span className={`text-[11px] font-bold ${itemColor} shrink-0 ml-2`}>
                            [{itemLabel}]
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Retro cyber terminal guidance */}
            <div className="p-3 bg-[#05010a] border border-[#3b0764] text-xs font-mono text-[#c084fc] space-y-1">
              <div>{t('guide1')}</div>
              <div>{t('guide2')}</div>
            </div>
          </div>
        </RetroWindowFrame>

        {/* All Uploaded Tracks Archive: Windows Explorer / Retro Track Manager Style */}
        <AllTracksArchiveView
          beats={beats}
          onSelectBeat={onSelectBeat}
        />
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
