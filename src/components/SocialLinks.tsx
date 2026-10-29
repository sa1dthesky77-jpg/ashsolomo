import React from 'react';

export const INSTAGRAM_URL = 'https://www.instagram.com/ashsolomo/';
export const SOUNDCLOUD_URL =
  'https://soundcloud.com/ashsolomo_offical?utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing';

export const InstagramIcon: React.FC<{ className?: string }> = ({
  className = 'w-3.5 h-3.5',
}) => (
  <svg
    className={className}
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
);

export const SoundCloudIcon: React.FC<{ className?: string }> = ({
  className = 'w-3.5 h-3.5',
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M1.17 12.22c-.05 0-.09.04-.1.1v2.96c.01.06.05.1.1.1.06 0 .1-.04.1-.1v-2.96c0-.06-.04-.1-.1-.1m1.33-1.63c-.07 0-.13.06-.13.14v4.58c0 .08.06.14.13.14.08 0 .14-.06.14-.14v-4.58c0-.08-.06-.14-.14-.14m1.33-.27c-.09 0-.16.07-.16.17v5.12c0 .09.07.16.16.16s.16-.07.16-.16v-5.12c0-.1-.07-.17-.16-.17m1.34-1.25c-.1 0-.19.09-.19.2v6.37c0 .11.09.2.19.2.11 0 .2-.09.2-.2v-6.37c0-.11-.09-.2-.2-.2m1.33.68c-.12 0-.22.1-.22.23v5.69c0 .12.1.22.22.22s.22-.1.22-.22v-5.69c0-.13-.1-.23-.22-.23m1.34-.84c-.14 0-.25.11-.25.26v6.52c0 .14.11.26.25.26.13 0 .25-.12.25-.26v-6.52c0-.15-.12-.26-.25-.26m1.33.22c-.15 0-.28.13-.28.29v6.23c0 .16.13.29.28.29s.29-.13.29-.29v-6.23c0-.16-.14-.29-.29-.29m1.33-.84c-.17 0-.31.14-.31.32v7.05c0 .18.14.32.31.32.18 0 .32-.14.32-.32v-7.05c0-.18-.14-.32-.32-.32m1.34 1.15c-.19 0-.34.15-.34.35v5.9c0 .2.15.35.34.35.2 0 .35-.15.35-.35v-5.9c0-.2-.15-.35-.35-.35m1.33-.76c-.2 0-.37.17-.37.38v6.66c0 .21.17.38.37.38s.38-.17.38-.38v-6.66c0-.21-.18-.38-.38-.38m1.34-.73c-.22 0-.4.18-.4.41v7.4c0 .22.18.41.4.41.23 0 .41-.19.41-.41v-7.4c0-.23-.18-.41-.41-.41m1.33-.42c-.24 0-.43.2-.43.45v8.23c0 .24.19.44.43.44.25 0 .44-.2.44-.44v-8.23c0-.25-.19-.45-.44-.45m1.34-.33c-.25 0-.46.21-.46.48v8.89c0 .26.21.48.46.48s.47-.22.47-.48v-8.89c0-.27-.22-.48-.47-.48m2.59-1.3c-.45 0-.88.1-1.26.29v9.91c.36.17.76.26 1.18.26 2.45 0 4.43-1.98 4.43-4.43 0-2.31-1.76-4.21-4.02-4.42-.11-.92-.89-1.61-1.83-1.61z" />
  </svg>
);

interface SocialLinksProps {
  className?: string;
  iconClassName?: string;
}

export const SocialLinks: React.FC<SocialLinksProps> = ({
  className = 'flex items-center gap-1.5',
  iconClassName = 'w-3.5 h-3.5',
}) => {
  return (
    <div className={className}>
      {/* Instagram Link */}
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="retro-btn text-[#c084fc] hover:text-[#f43f5e] hover:border-[#f43f5e] p-1.5 inline-flex items-center justify-center cursor-pointer shadow-sm"
        title="Ash Solomo Instagram (@ashsolomo)"
        aria-label="Instagram @ashsolomo (새 창)"
      >
        <InstagramIcon className={iconClassName} />
      </a>

      {/* SoundCloud Link */}
      <a
        href={SOUNDCLOUD_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="retro-btn text-[#c084fc] hover:text-[#ff7700] hover:border-[#ff7700] p-1.5 inline-flex items-center justify-center cursor-pointer shadow-sm"
        title="Ash Solomo SoundCloud (@ashsolomo_offical)"
        aria-label="SoundCloud @ashsolomo_offical (새 창)"
      >
        <SoundCloudIcon className={iconClassName} />
      </a>
    </div>
  );
};
