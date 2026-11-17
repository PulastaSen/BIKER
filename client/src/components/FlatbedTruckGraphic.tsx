interface FlatbedTruckGraphicProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

/**
 * FlatbedTruckGraphic — Precision vector illustration of a White Recovery Flatbed
 * matching the authoritative MotoAssist Active Rescue reference design.
 */
export function FlatbedTruckGraphic({
  className = '',
  width = 86,
  height = 54,
}: FlatbedTruckGraphicProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 140 85"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none drop-shadow-md ${className}`}
      aria-label="White Recovery Flatbed Tow Truck"
    >
      <defs>
        {/* Gradients for metallic flatbed and white cab */}
        <linearGradient id="cabBodyGrad" x1="85" y1="20" x2="135" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="45%" stopColor="#F1F5F9" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>

        <linearGradient id="flatbedGrad" x1="10" y1="35" x2="88" y2="55" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="50%" stopColor="#64748B" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        <linearGradient id="chassisGrad" x1="15" y1="52" x2="130" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        <linearGradient id="windshieldGrad" x1="102" y1="24" x2="124" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#0369A1" stopOpacity="0.95" />
        </linearGradient>

        <linearGradient id="sideWindowGrad" x1="88" y1="26" x2="104" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#0C4A6E" stopOpacity="0.9" />
        </linearGradient>

        <linearGradient id="wheelRubber" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        <linearGradient id="wheelRim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>

        <filter id="shadowFilter" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="68" cy="74" rx="60" ry="5.5" fill="#000000" fillOpacity="0.55" />

      {/* Dark Under-Chassis & Fuel Tank */}
      <rect x="22" y="52" width="70" height="12" rx="2" fill="url(#chassisGrad)" />
      <rect x="42" y="55" width="22" height="7" rx="1.5" fill="#334155" stroke="#475569" strokeWidth="0.75" />
      <circle cx="59" cy="58.5" r="1.5" fill="#94A3B8" />

      {/* Heavy Duty Flatbed Deck (Tilted / Wedge Profile) */}
      <polygon
        points="6,44 88,40 88,52 6,52"
        fill="url(#flatbedGrad)"
        stroke="#475569"
        strokeWidth="1"
      />
      {/* Flatbed Diamond Grip Ribs */}
      <line x1="16" y1="44" x2="16" y2="51" stroke="#E2E8F0" strokeWidth="1" strokeOpacity="0.4" />
      <line x1="28" y1="43.5" x2="28" y2="51" stroke="#E2E8F0" strokeWidth="1" strokeOpacity="0.4" />
      <line x1="40" y1="43" x2="40" y2="51" stroke="#E2E8F0" strokeWidth="1" strokeOpacity="0.4" />
      <line x1="52" y1="42.5" x2="52" y2="51" stroke="#E2E8F0" strokeWidth="1" strokeOpacity="0.4" />
      <line x1="64" y1="42" x2="64" y2="51" stroke="#E2E8F0" strokeWidth="1" strokeOpacity="0.4" />
      <line x1="76" y1="41.5" x2="76" y2="51" stroke="#E2E8F0" strokeWidth="1" strokeOpacity="0.4" />

      {/* Bed Edge Rail & Reflective Side Strip */}
      <rect x="7" y="50" width="80" height="2" fill="#EAB308" />
      {/* Headboard / Headache Rack Behind Cab */}
      <path
        d="M84 25L84 42L88 42L88 25C88 23.5 86.5 22.5 85 23.5L84 25Z"
        fill="#475569"
        stroke="#334155"
        strokeWidth="0.8"
      />
      <rect x="85.5" y="27" width="2" height="12" fill="#94A3B8" />

      {/* Hydraulic Winch Drum */}
      <circle cx="82" cy="38" r="3" fill="#64748B" stroke="#334155" strokeWidth="0.75" />
      <line x1="82" y1="38" x2="48" y2="43" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="1.5 1.5" />

      {/* Rear Wheel Pair (Dual Wheels Under Bed) */}
      <g>
        {/* Rear Tire */}
        <circle cx="36" cy="64" r="10.5" fill="url(#wheelRubber)" stroke="#0F172A" strokeWidth="1.5" />
        {/* Deep Silver Alloy Rim */}
        <circle cx="36" cy="64" r="6.5" fill="url(#wheelRim)" />
        <circle cx="36" cy="64" r="2.8" fill="#1E293B" />
        {/* Lug nuts */}
        <circle cx="36" cy="61" r="0.7" fill="#F8FAFC" />
        <circle cx="39" cy="64" r="0.7" fill="#F8FAFC" />
        <circle cx="36" cy="67" r="0.7" fill="#F8FAFC" />
        <circle cx="33" cy="64" r="0.7" fill="#F8FAFC" />
        {/* Splash Guard Mudflap */}
        <path d="M22 55L22 68L25 68L25 55Z" fill="#0F172A" />
      </g>

      {/* Modern White Cab Assembly */}
      <g filter="url(#shadowFilter)">
        {/* Main White Cab Shell */}
        <path
          d="M87 23C87 21 88.5 19.5 90.5 19.5H108C110 19.5 111.5 20.5 112.5 22L124 38C125 39.5 125.5 41 125.5 43V58C125.5 59.5 124.5 60.5 123 60.5H89C87.5 60.5 87 59.5 87 58V23Z"
          fill="url(#cabBodyGrad)"
          stroke="#94A3B8"
          strokeWidth="0.8"
        />

        {/* Slanted Windshield */}
        <path
          d="M109.5 22.5L120.5 37.5H108.5V22.5H109.5Z"
          fill="url(#windshieldGrad)"
          stroke="#0284C7"
          strokeWidth="0.6"
        />
        {/* Windshield Reflection */}
        <line x1="113" y1="24" x2="119" y2="35" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.7" />

        {/* Side Passenger Window */}
        <path
          d="M91.5 23.5H105.5V37.5H91.5V23.5Z"
          fill="url(#sideWindowGrad)"
          stroke="#0284C7"
          strokeWidth="0.6"
        />
        {/* Window Pillar & Frame */}
        <line x1="106.5" y1="22" x2="106.5" y2="38.5" stroke="#64748B" strokeWidth="1" />

        {/* Door Cut Line & Chrome Handle */}
        <path d="M90 39H106.5V57H90" fill="none" stroke="#CBD5E1" strokeWidth="0.6" />
        <rect x="93" y="42" width="4" height="1.2" rx="0.6" fill="#475569" stroke="#94A3B8" strokeWidth="0.3" />

        {/* Front Chrome Bumper & Grille */}
        <path
          d="M123 45H127V58C127 59.5 126 60.5 124.5 60.5H123V45Z"
          fill="#334155"
        />
        <rect x="124" y="46" width="2.5" height="1.8" fill="#F8FAFC" rx="0.5" />
        <rect x="124" y="49" width="2.5" height="1.8" fill="#94A3B8" rx="0.5" />
        <rect x="124" y="52" width="2.5" height="1.8" fill="#64748B" rx="0.5" />

        {/* High-Intensity Headlight with Beam Accent */}
        <path
          d="M123.5 41H126.5L125 44H123.5V41Z"
          fill="#FEF08A"
          stroke="#FACC15"
          strokeWidth="0.5"
        />
        <circle cx="125" cy="42.5" r="1" fill="#FFFFFF" />

        {/* Side Mirror */}
        <path
          d="M109 30L112 30L112.5 35L109.5 34.5Z"
          fill="#0F172A"
          stroke="#475569"
          strokeWidth="0.5"
        />

        {/* Roof Emergency Strobe Lights (Amber Beacon) */}
        <rect x="95" y="16.5" width="6" height="3" rx="1.5" fill="#F59E0B" stroke="#B45309" strokeWidth="0.5" />
        <circle cx="98" cy="18" r="1" fill="#FEF3C7" />
        <rect x="103" y="16.5" width="6" height="3" rx="1.5" fill="#F59E0B" stroke="#B45309" strokeWidth="0.5" />
        <circle cx="106" cy="18" r="1" fill="#FEF3C7" />

        {/* Amber Strobe Glow */}
        <circle cx="98" cy="18" r="3" fill="#F59E0B" fillOpacity="0.3" />
        <circle cx="106" cy="18" r="3" fill="#F59E0B" fillOpacity="0.3" />
      </g>

      {/* Front Wheel */}
      <g>
        <circle cx="108" cy="64" r="10.5" fill="url(#wheelRubber)" stroke="#0F172A" strokeWidth="1.5" />
        <circle cx="108" cy="64" r="6.5" fill="url(#wheelRim)" />
        <circle cx="108" cy="64" r="2.8" fill="#1E293B" />
        {/* Lug nuts */}
        <circle cx="108" cy="61" r="0.7" fill="#F8FAFC" />
        <circle cx="111" cy="64" r="0.7" fill="#F8FAFC" />
        <circle cx="108" cy="67" r="0.7" fill="#F8FAFC" />
        <circle cx="105" cy="64" r="0.7" fill="#F8FAFC" />
      </g>

      {/* Front Wheel Well Flare */}
      <path
        d="M96 61C97.5 54 118.5 54 120 61"
        fill="none"
        stroke="#94A3B8"
        strokeWidth="1.5"
      />
    </svg>
  );
}
