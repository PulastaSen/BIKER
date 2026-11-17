/**
 * MotoAssistLogoMark — Distinctive yellow/gold automotive 'M' icon
 * matching the exact branding in the MotoAssist mobile header reference.
 */
export function MotoAssistLogoMark({
  size = 28,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="MotoAssist Logo Mark"
    >
      {/* Dynamic Himalayan Highway 'M' Crest */}
      <path
        d="M4 22L8.5 7L14 15.5L19.5 7L24 22"
        stroke="#F5B041"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Route Horizon Cross-Bar */}
      <path
        d="M8 17H20"
        stroke="#F5B041"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeOpacity="0.75"
      />
    </svg>
  );
}
