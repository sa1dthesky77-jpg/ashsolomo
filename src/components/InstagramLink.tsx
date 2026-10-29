import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface InstagramLinkProps {
  className?: string;
  labelPrefix?: string;
}

export const InstagramLink: React.FC<InstagramLinkProps> = ({ className = '', labelPrefix }) => {
  return (
    <a
      href="https://www.instagram.com/ashsolomo/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Ash Solomo 인스타그램 프로필 @ashsolomo (새 탭에서 열림)"
      className={`group inline-flex items-center gap-3 px-3.5 py-2.5 rounded-none border border-[#252525] bg-[#000000] hover:bg-[#0a0a0a] hover:border-[#404040] transition-colors duration-150 text-[#FFFFFF] text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white cursor-pointer ${className}`}
    >
      {/* Official Instagram SVG Icon */}
      <svg
        className="w-4 h-4 shrink-0 text-[#888888] group-hover:text-white transition-colors duration-150"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>

      <span className="flex items-center gap-1.5 font-mono text-xs tracking-tight">
        {labelPrefix && <span className="text-[#888888]">{labelPrefix}</span>}
        <span className="font-semibold text-white group-hover:underline underline-offset-4 decoration-[#888888]">
          @ashsolomo
        </span>
      </span>

      <ArrowUpRight
        className="w-3.5 h-3.5 text-[#888888] group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-150 ml-0.5 shrink-0"
        aria-hidden="true"
      />
    </a>
  );
};
