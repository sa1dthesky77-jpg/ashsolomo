import React, { useState } from 'react';
import { BeatItem } from '../types';
import { Shield, ChevronUp, ChevronDown } from 'lucide-react';

interface PrototypeToolbarProps {
  beats: BeatItem[];
  currentBeat: BeatItem | null;
  isInvalidLink: boolean;
  isAdmin: boolean;
  onSelectBeat: (beatId: string) => void;
  onTriggerInvalid: () => void;
  onResetSearch?: () => void;
  onToggleAdmin: (admin: boolean) => void;
}

export const PrototypeToolbar: React.FC<PrototypeToolbarProps> = ({
  beats,
  currentBeat,
  isInvalidLink,
  isAdmin,
  onSelectBeat,
  onTriggerInvalid,
  onResetSearch,
  onToggleAdmin,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  // Find samples for each status
  const unavailableSample = beats.find((b) => b.status === 'unavailable' && b.active);
  const pendingSample = beats.find((b) => b.status === 'pending' && b.active);
  const availableSample = beats.find((b) => b.status === 'available' && b.active);

  return (
    <aside
      aria-label="디자인 프로토타입 상태 전환 도구"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#000000] border-t border-[#252525] text-white font-mono text-xs shadow-2xl backdrop-blur-md"
    >
      {/* Bar Header / Toggle */}
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-white/60 inline-block" />
          <span className="font-semibold text-white tracking-wider text-[11px] uppercase">
            PROTOTYPE PREVIEW CONTROLLER
          </span>
          <span className="hidden sm:inline text-[#888888] text-[11px]">
            (사양서 화면 및 관리자 기능 즉시 테스트)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 px-2 py-1 text-[11px] text-[#888888] hover:text-white transition-colors cursor-pointer"
          >
            {isOpen ? (
              <>
                <span>접기</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>열기</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expanded quick switch buttons */}
      {isOpen && (
        <div className="border-t border-[#1a1a1a] bg-[#050505] px-4 py-3">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-[#888888] text-[11px] mr-1 hidden md:inline">
                화면 선택:
              </span>

              {/* 0. Initial Search Screen */}
              {onResetSearch && (
                <button
                  type="button"
                  onClick={onResetSearch}
                  className={`px-2.5 py-1.5 border text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer ${
                    !isAdmin && !isInvalidLink && !currentBeat
                      ? 'border-white bg-white/10 text-white'
                      : 'border-[#252525] text-[#888888] hover:text-white hover:border-[#444444]'
                  }`}
                >
                  <span>🔍</span>
                  <span>첫 화면 (검색 대기)</span>
                </button>
              )}

              {/* 1. Unavailable */}
              <button
                type="button"
                onClick={() => {
                  if (unavailableSample) {
                    onSelectBeat(unavailableSample.beat_id);
                  }
                }}
                className={`px-2.5 py-1.5 border text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer ${
                  !isAdmin && !isInvalidLink && currentBeat?.status === 'unavailable'
                    ? 'border-[#ef4444] bg-[#ef4444]/10 text-white'
                    : 'border-[#252525] text-[#888888] hover:text-white hover:border-[#444444]'
                }`}
              >
                <span className="text-[#ef4444]">■</span>
                <span>이용 불가 화면</span>
              </button>

              {/* 2. Pending */}
              <button
                type="button"
                onClick={() => {
                  if (pendingSample) {
                    onSelectBeat(pendingSample.beat_id);
                  }
                }}
                className={`px-2.5 py-1.5 border text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer ${
                  !isAdmin && !isInvalidLink && currentBeat?.status === 'pending'
                    ? 'border-[#f59e0b] bg-[#f59e0b]/10 text-white'
                    : 'border-[#252525] text-[#888888] hover:text-white hover:border-[#444444]'
                }`}
              >
                <span className="text-[#f59e0b]">■</span>
                <span>확인 필요 화면</span>
              </button>

              {/* 3. Available */}
              <button
                type="button"
                onClick={() => {
                  if (availableSample) {
                    onSelectBeat(availableSample.beat_id);
                  }
                }}
                className={`px-2.5 py-1.5 border text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer ${
                  !isAdmin && !isInvalidLink && currentBeat?.status === 'available'
                    ? 'border-[#22c55e] bg-[#22c55e]/10 text-white'
                    : 'border-[#252525] text-[#888888] hover:text-white hover:border-[#444444]'
                }`}
              >
                <span className="text-[#22c55e]">■</span>
                <span>이용 가능 화면</span>
              </button>

              {/* 4. Invalid Link */}
              <button
                type="button"
                onClick={onTriggerInvalid}
                className={`px-2.5 py-1.5 border text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer ${
                  !isAdmin && isInvalidLink
                    ? 'border-white bg-white/10 text-white'
                    : 'border-[#252525] text-[#888888] hover:text-white hover:border-[#444444]'
                }`}
              >
                <span className="text-[#888888]">✕</span>
                <span>잘못된 링크 (404)</span>
              </button>

              {/* 5. Admin Mode */}
              <button
                type="button"
                onClick={() => onToggleAdmin(!isAdmin)}
                className={`px-2.5 py-1.5 border text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isAdmin
                    ? 'border-white bg-white text-black font-semibold'
                    : 'border-[#252525] text-[#888888] hover:text-white hover:border-[#444444]'
                }`}
              >
                <Shield className="w-3 h-3" />
                <span>관리자 모드 (비트 등록/수정)</span>
              </button>
            </div>

            {/* Current route indicator */}
            <div className="text-[11px] text-[#888888] flex items-center gap-2">
              <span className="text-[#555555]">상태:</span>
              <span className="text-[#cccccc]">
                {isAdmin
                  ? '관리자 화면 (/admin)'
                  : isInvalidLink
                  ? '404 오류 화면'
                  : currentBeat
                  ? `${currentBeat.title} (${currentBeat.status})`
                  : '대기 중'}
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
