import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

export const LanguageToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`inline-flex items-center retro-inset p-0.5 border border-[#3b0764] ${className}`}
      role="group"
      aria-label="언어 선택 / Language selection"
    >
      <div className="flex items-center gap-1 px-1 text-[10px] text-[#c084fc] select-none hidden sm:flex">
        <Globe className="w-3 h-3 text-[#a855f7]" />
      </div>

      <button
        type="button"
        onClick={() => setLanguage('ko')}
        className={`px-2 py-0.5 text-[11px] font-mono font-bold transition-all cursor-pointer ${
          language === 'ko'
            ? 'bg-[#7c3aed] text-white shadow-[0_0_8px_rgba(168,85,247,0.5)] border border-[#a855f7]'
            : 'text-[#c084fc] hover:text-white hover:bg-[#1a0b36]'
        }`}
        title="한국어로 보기"
      >
        한국어
      </button>

      <span className="text-[#3b0764] text-[10px]">|</span>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2 py-0.5 text-[11px] font-mono font-bold transition-all cursor-pointer ${
          language === 'en'
            ? 'bg-[#7c3aed] text-white shadow-[0_0_8px_rgba(168,85,247,0.5)] border border-[#a855f7]'
            : 'text-[#c084fc] hover:text-white hover:bg-[#1a0b36]'
        }`}
        title="View in English"
      >
        ENG
      </button>
    </div>
  );
};
