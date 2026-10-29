import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ko' | 'en';

interface Translations {
  [key: string]: {
    ko: string;
    en: string;
  };
}

export const translations: Translations = {
  // Top Header & Nav
  systemTitle: {
    ko: 'PRODUCER BEAT LICENSE VERIFIER',
    en: 'PRODUCER BEAT LICENSE VERIFIER',
  },
  devTools: {
    ko: '검수 도구',
    en: 'DEV TOOLS',
  },
  devToolsHide: {
    ko: '검수 도구 숨기기',
    en: 'HIDE DEV TOOLS',
  },
  admin: {
    ko: '관리자',
    en: 'ADMIN',
  },
  publicScreen: {
    ko: '공개 화면',
    en: 'PUBLIC',
  },
  netOnline: {
    ko: 'NET: 접속됨',
    en: 'NET: ONLINE',
  },

  // Search Home
  searchPortalSub: {
    ko: 'RETRO CYBER INTERNET · BEAT VERIFIER',
    en: 'RETRO CYBER INTERNET · BEAT VERIFIER',
  },
  lookupTitle: {
    ko: '비트 라이선스 상태 조회',
    en: 'Beat License Verification',
  },
  lookupDesc: {
    ko: '전달받으신 비트 제목을 입력해 현재 라이선스 상태를 확인하세요.',
    en: 'Enter the beat title you received to verify real-time license availability.',
  },
  searchPlaceholder: {
    ko: '비트 제목 입력 (예: MIDNIGHT DRIVE)',
    en: 'Enter beat title (e.g. MIDNIGHT DRIVE)',
  },
  searchBtn: {
    ko: '조회',
    en: 'SEARCH',
  },
  registeredList: {
    ko: '등록된 비트 목록',
    en: 'Registered Beat Archive',
  },
  clickToVerify: {
    ko: '클릭하여 라이선스 확인',
    en: 'Click to verify status',
  },
  noMatch: {
    ko: '일치하는 비트가 없습니다. 엔터 키를 누르면 404 오류 화면으로 연결됩니다.',
    en: 'No matching beat found. Press Enter to view 404 error page.',
  },
  guide1: {
    ko: '• 전달받으신 비트 제목을 통해 라이선스 상태를 확인하실 수 있습니다.',
    en: '• Look up license availability using your received track title.',
  },
  guide2: {
    ko: '• 검색 후 곡 제목, 라이선스 상태, 안내 사항(Notice)이 표시됩니다.',
    en: '• Status, 15s preview, and producer inquiry details will appear upon search.',
  },

  // Statuses
  availableLabel: {
    ko: '이용 가능',
    en: 'AVAILABLE',
  },
  unavailableLabel: {
    ko: '이용 불가',
    en: 'UNAVAILABLE',
  },
  pendingLabel: {
    ko: '확인 필요',
    en: 'PENDING',
  },
  availableTitle: {
    ko: '현재 라이선스 이용 및 취득이 가능합니다.',
    en: 'License is currently available for collaboration & acquisition.',
  },
  availableDesc: {
    ko: '이 비트는 현재 미배정 상태이며, 작업 및 라이선스 협의가 가능합니다.',
    en: 'This beat is currently open for licensing and direct artist collaborations.',
  },
  unavailableTitle: {
    ko: '라이선스 소유자와 거래가 완료되어 사용 불가능합니다.',
    en: 'Transaction complete with license holder; not available.',
  },
  unavailableDesc: {
    ko: '혹시 이 비트로 작업 중이었다면, Ash에게 디엠을 보내주세요. 이 타입의 비트에 작업을 직접 문의해서 작업해봐요!',
    en: 'If you were working with this beat, send Ash a DM. Inquire directly to collaborate on beats of this type!',
  },
  pendingTitle: {
    ko: '라이선스 거래 중입니다.',
    en: 'License negotiation in progress.',
  },
  pendingDesc: {
    ko: '자세한 내용은 Ash에게 디엠을 보내주세요. 이 타입의 비트에 작업을 직접 문의해서 작업해봐요!',
    en: 'For details, send Ash a DM. Inquire directly to collaborate on beats of this type!',
  },

  // License Check View
  backToSearch: {
    ko: '다른 비트 검색하기 (메인 홈)',
    en: '← Search Another Track (Home)',
  },
  trackResult: {
    ko: 'TRACK INQUIRY RESULT',
    en: 'TRACK INQUIRY RESULT',
  },
  noticeHeader: {
    ko: 'NOTICE & VERIFICATION DETAILS',
    en: 'NOTICE & VERIFICATION DETAILS',
  },
  directInquiry: {
    ko: 'DIRECT INQUIRY (1:1 CONTACT)',
    en: 'DIRECT INQUIRY (1:1 CONTACT)',
  },
  lastUpdate: {
    ko: '마지막 업데이트:',
    en: 'Last Updated:',
  },

  // Archive View
  archiveTitle: {
    ko: 'ALL_UPLOADED_TRACKS_ARCHIVE.EXE',
    en: 'ALL_UPLOADED_TRACKS_ARCHIVE.EXE',
  },
  archiveSubtitle: {
    ko: '/ 전체 등록 비트 목록 (날짜순)',
    en: '/ Chronological Track Archive',
  },
  totalTracks: {
    ko: '총 {count}개 트랙',
    en: '{count} Tracks Total',
  },
  filterAll: {
    ko: '전체',
    en: 'ALL',
  },
  archiveSearchPlaceholder: {
    ko: '목록 내 검색...',
    en: 'Search in list...',
  },
  colDate: {
    ko: '등록 일시 (DATE)',
    en: 'TIMESTAMP (KST)',
  },
  colInfo: {
    ko: '트랙 정보 (TITLE & GENRE)',
    en: 'TRACK & GENRE',
  },
  colStatus: {
    ko: '라이선스 상태 (STATUS)',
    en: 'LICENSE STATUS',
  },
  previewProtected: {
    ko: '15초 미리듣기 보호 적용',
    en: '15s Audio Preview Protected',
  },
  resetList: {
    ko: '전체 목록 다시 보기',
    en: 'View full archive',
  },
  noTracksFound: {
    ko: '일치하는 트랙이 없습니다.',
    en: 'No matching tracks found.',
  },

  // Audio Player
  previewDurationText: {
    ko: '15초 오디오 미리듣기',
    en: '15s Audio Preview',
  },
  previewEnded: {
    ko: '미리듣기 종료 (15초)',
    en: 'PREVIEW ENDED (15s)',
  },
  fadeInOutText: {
    ko: '(페이드 인 1.5s / 페이드 아웃 {fade}s 적용)',
    en: '(Fade In 1.5s / Fade Out {fade}s applied)',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'ko',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('ash_site_lang');
    return saved === 'en' ? 'en' : 'ko';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('ash_site_lang', lang);
  };

  const t = (key: string, replacements?: Record<string, string | number>): string => {
    const entry = translations[key];
    let text = entry ? entry[language] || entry.ko : key;
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
