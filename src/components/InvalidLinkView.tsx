import React from 'react';
import { RetroWindowFrame } from './RetroWindowFrame';
import { SocialLinks } from './SocialLinks';
import { useLanguage } from '../context/LanguageContext';
import { AlertTriangle, Home, Instagram, HelpCircle } from 'lucide-react';

interface InvalidLinkViewProps {
  onGoHome?: () => void;
}

export const InvalidLinkView: React.FC<InvalidLinkViewProps> = ({ onGoHome }) => {
  const { t, language } = useLanguage();

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-8 md:py-16">
      <RetroWindowFrame
        title="SYSTEM_ERROR_404.EXE"
        icon="sparkle"
        addressUrl="ash://cyber-archive/error/404"
        statusBarLeft="ERR_BEAT_NOT_FOUND"
        statusBarRight={<span className="text-[#f43f5e] font-bold">STATUS: 404</span>}
      >
        <div className="p-6 sm:p-8 space-y-6">
          {/* Top Error Alert Header */}
          <div className="flex items-start gap-4 p-4 retro-inset bg-[#150410] border-[#831843]">
            <div className="w-10 h-10 retro-btn flex items-center justify-center shrink-0 text-[#f43f5e]">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="text-[11px] font-mono text-[#f43f5e] font-bold tracking-widest uppercase">
                ERROR 0x00000404 · FILE_NOT_FOUND
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-mono text-white">
                {language === 'ko' ? '페이지 또는 비트를 찾을 수 없습니다.' : 'Page or Beat Track Not Found.'}
              </h2>
            </div>
          </div>

          {/* Explanation Text */}
          <p className="font-mono text-xs sm:text-sm text-[#e9d5ff] leading-relaxed">
            {language === 'ko'
              ? '유효하지 않은 링크이거나, 등록되지 않은 비트 제목입니다. 전달받으신 제목이나 링크를 다시 확인해 주세요.'
              : 'Invalid link or unregistered beat title. Please verify the track title or address you received.'}
          </p>

          {/* Diagnostic Box */}
          <div className="p-4 retro-inset text-xs font-mono text-[#c084fc] space-y-1.5 bg-[#0a0314]">
            <div className="text-white font-bold mb-1 flex items-center gap-1.5 font-pixel">
              <HelpCircle className="w-3.5 h-3.5 text-[#a855f7]" />
              <span>{language === 'ko' ? '문제 해결 가이드' : 'Troubleshooting Checklist'}</span>
            </div>
            <div>
              • {language === 'ko'
                ? '입력하신 비트 제목의 철자나 대소문자를 확인해 주세요.'
                : 'Check spelling and case sensitivity of the beat title.'}
            </div>
            <div>
              • {language === 'ko'
                ? '프로듀서가 비트를 아직 업로드하지 않았거나 비활성화했을 수 있습니다.'
                : 'The producer may have not yet uploaded or temporarily deactivated this track.'}
            </div>
          </div>

          {/* Direct Producer Contact via Instagram & SoundCloud */}
          <div className="pt-3 border-t border-[#2e1065] space-y-2.5">
            <div className="font-mono text-[11px] text-[#c084fc] uppercase tracking-wider flex items-center gap-2">
              <Instagram className="w-3.5 h-3.5 text-[#d946ef]" />
              <span>{language === 'ko' ? '프로듀서에게 직접 문의하기' : 'Direct Producer Inquiry'}</span>
            </div>
            <div className="flex items-center gap-3">
              <SocialLinks iconClassName="w-4 h-4" />
              <span className="font-mono text-xs text-[#a855f7]">
                @ashsolomo
              </span>
            </div>
          </div>

          {/* Return Home Button */}
          {onGoHome && (
            <div className="pt-2 flex justify-start">
              <button
                type="button"
                onClick={onGoHome}
                className="retro-btn px-4 py-2 text-xs font-mono text-[#2dd4bf] hover:text-white flex items-center gap-2 cursor-pointer font-bold"
              >
                <Home className="w-3.5 h-3.5" />
                <span>
                  {language === 'ko' ? '← 메인 검색 화면으로 돌아가기' : '← Return to Main Portal'}
                </span>
              </button>
            </div>
          )}
        </div>
      </RetroWindowFrame>
    </div>
  );
};
