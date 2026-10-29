import React, { useState } from 'react';
import { Disc3, Globe, Sparkles, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

interface RetroWindowFrameProps {
  title?: string;
  icon?: 'disc' | 'globe' | 'sparkle';
  addressUrl?: string;
  onRefresh?: () => void;
  onBack?: () => void;
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
  statusBarRight?: React.ReactNode;
  statusBarLeft?: string;
}

export const RetroWindowFrame: React.FC<RetroWindowFrameProps> = ({
  title = 'ASH_LICENSE_VERIFIER.EXE',
  icon = 'disc',
  addressUrl = 'ash://producer-registry/beats',
  onRefresh,
  onBack,
  onClose,
  children,
  className = '',
  statusBarRight,
  statusBarLeft = 'SYSTEM: READY',
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  return (
    <div
      className={`retro-window transition-all duration-150 ${
        isMaximized ? 'w-full max-w-7xl' : 'w-full max-w-4xl'
      } mx-auto ${className}`}
    >
      {/* 1. Classic Windows Title Bar with Blue-Violet/Electric Purple Gradient */}
      <div className="retro-titlebar px-3 py-1.5 flex items-center justify-between text-white select-none">
        <div className="flex items-center gap-2 min-w-0">
          {icon === 'disc' && <Disc3 className="w-3.5 h-3.5 text-[#2dd4bf] animate-spin-slow shrink-0" />}
          {icon === 'globe' && <Globe className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />}
          {icon === 'sparkle' && <Sparkles className="w-3.5 h-3.5 text-[#f43f5e] shrink-0" />}

          <span className="font-mono text-xs font-bold tracking-wider truncate text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {title}
          </span>
        </div>

        {/* Window Control Buttons: [_] [□] [✕] */}
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {/* Minimize button */}
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="w-5 h-5 retro-btn text-[11px] font-bold text-white flex items-center justify-center cursor-pointer hover:bg-[#3b0764]"
            title={isMinimized ? '창 복원' : '창 최소화'}
            aria-label="최소화"
          >
            _
          </button>

          {/* Maximize / Restore button */}
          <button
            type="button"
            onClick={() => setIsMaximized(!isMaximized)}
            className="w-5 h-5 retro-btn text-[10px] font-bold text-white flex items-center justify-center cursor-pointer hover:bg-[#3b0764]"
            title={isMaximized ? '기본 크기' : '창 최대화'}
            aria-label="최대화"
          >
            {isMaximized ? '❐' : '□'}
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={() => {
              if (onClose) onClose();
            }}
            className="w-5 h-5 retro-btn text-[11px] font-bold text-[#f43f5e] hover:bg-[#e11d48] hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            title="창 닫기 / 홈으로"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* 2. Retro Menu Bar (File, Edit, Audio, License, Help) */}
          <div className="px-3 py-1 bg-[#100722] border-b border-[#2e1065] flex items-center gap-4 text-[11px] font-mono text-[#c084fc] select-none">
            <span className="hover:text-white cursor-default">File(<u>F</u>)</span>
            <span className="hover:text-white cursor-default">Edit(<u>E</u>)</span>
            <span className="hover:text-white cursor-default">Audio(<u>A</u>)</span>
            <span className="hover:text-white cursor-default">License(<u>L</u>)</span>
            <span className="hover:text-white cursor-default text-[#a855f7]">Help(<u>H</u>)</span>
          </div>

          {/* 3. Old Browser Address Toolbar */}
          <div className="px-3 py-1.5 bg-[#0a0416] border-b border-[#2e1065] flex items-center gap-2 text-xs font-mono">
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={onBack}
                disabled={!onBack}
                className="w-6 h-6 retro-btn flex items-center justify-center text-[#c084fc] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="뒤로 가기"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled
                className="w-6 h-6 retro-btn flex items-center justify-center text-[#c084fc] opacity-40 cursor-not-allowed"
                title="앞으로 가기"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onRefresh}
                className="w-6 h-6 retro-btn flex items-center justify-center text-[#c084fc] hover:text-white cursor-pointer"
                title="새로고침"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 flex-1 min-w-0 retro-inset px-2.5 py-1 text-[11px]">
              <span className="text-[#a855f7] select-none shrink-0 font-semibold">Address:</span>
              <span className="text-[#f3e8ff] truncate font-mono">{addressUrl}</span>
            </div>
          </div>

          {/* 4. Window Content */}
          <div className="p-4 sm:p-6 bg-[#070311]">{children}</div>

          {/* 5. Window Status Bar at Bottom */}
          <div className="px-3 py-1 bg-[#0d051c] border-t border-[#2e1065] flex items-center justify-between text-[11px] font-mono text-[#a855f7] select-none">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-[#2dd4bf] inline-block animate-pulse shrink-0" />
              <span className="truncate">{statusBarLeft}</span>
            </div>
            {statusBarRight && <div className="shrink-0 ml-2">{statusBarRight}</div>}
          </div>
        </>
      )}
    </div>
  );
};
