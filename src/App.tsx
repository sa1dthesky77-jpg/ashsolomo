import React, { useState, useEffect, useCallback } from 'react';
import { BeatItem } from './types';
import { getStoredBeats, saveStoredBeats } from './data/mockBeats';
import { LicenseCheckView } from './components/LicenseCheckView';
import { SearchHomeView } from './components/SearchHomeView';
import { InvalidLinkView } from './components/InvalidLinkView';
import { AdminConsole } from './components/AdminConsole';
import { PrototypeToolbar } from './components/PrototypeToolbar';
import { BackgroundWaveform } from './components/BackgroundWaveform';
import { SocialLinks } from './components/SocialLinks';
import { LanguageToggle } from './components/LanguageToggle';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Shield, Sparkles } from 'lucide-react';

function AppContent() {
  const [beats, setBeats] = useState<BeatItem[]>(() => getStoredBeats());
  const [selectedBeatId, setSelectedBeatId] = useState<string | null>(null);
  const [isInvalidLink, setIsInvalidLink] = useState<boolean>(false);
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [showDevToolbar, setShowDevToolbar] = useState<boolean>(false);
  const { t } = useLanguage();

  // Sync beats to local storage whenever beats update
  const handleUpdateBeats = (updated: BeatItem[]) => {
    setBeats(updated);
    saveStoredBeats(updated);
  };

  // Parse URL query parameter: ?id=beat_id or ?beat=beat_id or ?admin=true
  const parseUrl = useCallback(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const beatParam = searchParams.get('id') || searchParams.get('beat');
      const adminParam = searchParams.get('admin');

      if (adminParam === 'true' || window.location.pathname === '/admin') {
        setIsAdminView(true);
        setIsInvalidLink(false);
        return;
      }

      setIsAdminView(false);

      if (beatParam) {
        if (beatParam === '404' || beatParam === 'invalid') {
          setIsInvalidLink(true);
          setSelectedBeatId(null);
          return;
        }

        const found = beats.find(
          (b) =>
            (b.beat_id.toLowerCase() === beatParam.toLowerCase() ||
              b.title.toLowerCase() === beatParam.toLowerCase() ||
              b.slug.toLowerCase() === beatParam.toLowerCase()) &&
            b.active
        );

        if (found) {
          setSelectedBeatId(found.beat_id);
          setIsInvalidLink(false);
        } else {
          setIsInvalidLink(true);
          setSelectedBeatId(null);
        }
      } else {
        setIsInvalidLink(false);
        setSelectedBeatId(null);
      }
    } catch {
      setIsInvalidLink(false);
      setSelectedBeatId(null);
    }
  }, [beats]);

  // Read URL on mount and handle popstate (browser back/forward)
  useEffect(() => {
    parseUrl();
    const handlePopState = () => parseUrl();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [parseUrl]);

  // Navigate to a beat
  const handleSelectBeat = (identifier: string) => {
    const found = beats.find(
      (b) =>
        b.beat_id.toLowerCase() === identifier.toLowerCase() ||
        b.title.toLowerCase() === identifier.toLowerCase() ||
        b.slug.toLowerCase() === identifier.toLowerCase()
    );
    const targetId = found ? found.beat_id : identifier;

    setSelectedBeatId(targetId);
    setIsInvalidLink(false);
    setIsAdminView(false);

    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('admin');
    newUrl.searchParams.delete('beat');
    newUrl.searchParams.set('id', targetId);
    window.history.pushState({}, '', newUrl.toString());
  };

  // Reset to initial clean search portal
  const handleResetSearch = () => {
    setSelectedBeatId(null);
    setIsInvalidLink(false);
    setIsAdminView(false);

    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('admin');
    newUrl.searchParams.delete('id');
    newUrl.searchParams.delete('beat');
    window.history.pushState({}, '', newUrl.pathname);
  };

  // Trigger invalid link view
  const handleTriggerInvalid = () => {
    setSelectedBeatId(null);
    setIsAdminView(false);

    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('admin');
    newUrl.searchParams.delete('id');
    newUrl.searchParams.set('beat', 'invalid-404');
    window.history.pushState({}, '', newUrl.toString());
  };

  // Toggle admin view
  const handleToggleAdmin = (admin: boolean) => {
    setIsAdminView(admin);
    setIsInvalidLink(false);

    const newUrl = new URL(window.location.href);
    if (admin) {
      newUrl.searchParams.set('admin', 'true');
    } else {
      newUrl.searchParams.delete('admin');
      if (selectedBeatId) {
        newUrl.searchParams.set('id', selectedBeatId);
      }
    }
    window.history.pushState({}, '', newUrl.toString());
  };

  const activeBeat = selectedBeatId
    ? beats.find((b) => b.beat_id === selectedBeatId && b.active) || null
    : null;

  return (
    <div
      className={`min-h-screen bg-[#05020a] text-[#f3e8ff] font-mono selection:bg-[#7c3aed] selection:text-white flex flex-col justify-between relative ${
        showDevToolbar ? 'pb-24' : 'pb-8'
      }`}
    >
      {/* Retro Cosmic Space & Starfield Audio Waveform Canvas */}
      <BackgroundWaveform />

      {/* Subtle CRT Scanline overlay */}
      <div className="crt-overlay fixed inset-0 pointer-events-none z-10 opacity-30" />

      {/* Top Retro Access Bar */}
      <header className="border-b border-[#2e1065] bg-[#0c051a]/95 backdrop-blur-md px-3 sm:px-6 py-2 flex items-center justify-between text-xs text-[#c084fc] relative z-20 shadow-md flex-wrap gap-2">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleResetSearch}
            className="text-white font-bold tracking-wider hover:text-[#d946ef] transition-colors text-left cursor-pointer drop-shadow-[0_0_8px_rgba(168,85,247,0.4)] font-mono text-sm"
          >
            prod by. Ash Solomo
          </button>
          <SocialLinks iconClassName="w-3.5 h-3.5" />

          <span className="text-[#3b0764] hidden sm:inline">|</span>

          {/* Left top [검수 도구] and [한국어 | ENG] positioned together */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowDevToolbar(!showDevToolbar)}
              className="retro-btn px-2 py-1 text-[10px] text-[#c084fc] hover:text-white transition-colors cursor-pointer"
              title="검수 도구 표시/숨김"
            >
              {showDevToolbar ? `[${t('devToolsHide')}]` : `[${t('devTools')}]`}
            </button>

            {/* Language Selector [한국어 | ENG] right next to [검수 도구] */}
            <LanguageToggle />
          </div>
        </div>

        {/* Top Right: Network status & Admin toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden md:inline text-[10px] text-[#2dd4bf] font-mono font-semibold">
            ● NET: ONLINE
          </span>

          <button
            type="button"
            onClick={() => handleToggleAdmin(!isAdminView)}
            className="retro-btn px-2.5 py-1 flex items-center gap-1.5 text-[10px] text-[#c084fc] hover:text-white transition-colors cursor-pointer"
            title="관리자 화면 전환"
          >
            <Shield className="w-3 h-3 text-[#2dd4bf]" />
            <span>{isAdminView ? t('publicScreen') : t('admin')}</span>
          </button>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 flex flex-col items-center justify-start w-full relative z-10">
        {isAdminView ? (
          <AdminConsole
            beats={beats}
            onUpdateBeats={handleUpdateBeats}
            onPreviewBeat={(beatId) => handleSelectBeat(beatId)}
            onExitAdmin={() => handleToggleAdmin(false)}
          />
        ) : isInvalidLink ? (
          <InvalidLinkView onGoHome={handleResetSearch} />
        ) : activeBeat ? (
          <LicenseCheckView
            beat={activeBeat}
            allBeats={beats}
            onSelectBeat={handleSelectBeat}
            onTriggerInvalid={handleTriggerInvalid}
            onResetSearch={handleResetSearch}
            onOpenAdmin={() => handleToggleAdmin(true)}
          />
        ) : (
          <SearchHomeView
            beats={beats}
            onSelectBeat={handleSelectBeat}
            onTriggerInvalid={handleTriggerInvalid}
          />
        )}
      </main>

      {/* Prototype Review Toolbar */}
      {showDevToolbar && (
        <PrototypeToolbar
          beats={beats}
          currentBeat={activeBeat}
          isInvalidLink={isInvalidLink}
          isAdmin={isAdminView}
          onSelectBeat={handleSelectBeat}
          onTriggerInvalid={handleTriggerInvalid}
          onResetSearch={handleResetSearch}
          onToggleAdmin={handleToggleAdmin}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
