interface MotoAssistBrandMarkProps {
  size?: number;
  className?: string;
  withText?: boolean;
  textClassName?: string;
  subtext?: string;
}

/**
 * MotoAssistBrandMark — Distinctive Automotive & Route-Arc Visual Identity
 * 
 * Inspired by the Nexus Roadside Assistance & Recovery aesthetic:
 * - Connected-road / highway pass geometry forming an "MA" monogram
 * - High-visibility chartreuse waypoint beacon (#DFF127)
 * - Established MotoAssist brand yellow (#FFF174) primary curves
 * - Deep mineral charcoal (#151613) and precision border (#383A32)
 */
export function MotoAssistBrandMark({
  size = 36,
  className = '',
  withText = false,
  textClassName = '',
  subtext
}: MotoAssistBrandMarkProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Symbol Container */}
      <div
        className="relative shrink-0 rounded-xl overflow-hidden flex items-center justify-center transition-transform hover:scale-105"
        style={{
          width: size,
          height: size,
          background: 'linear-gradient(135deg, #151613 0%, #090A08 100%)',
          border: '1px solid #383A32',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
        }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5"
        >
          {/* Subtle tactical road grid background lines */}
          <line x1="6" y1="18" x2="30" y2="18" stroke="#383A32" strokeWidth="0.75" strokeDasharray="1 3" />
          <line x1="18" y1="6" x2="18" y2="30" stroke="#383A32" strokeWidth="0.75" strokeDasharray="1 3" />

          {/* Connected Highway Arc ("MA" Road Flow) */}
          {/* Outer Road Curve Base */}
          <path
            d="M7 27L11 11L18 20L25 11L29 27"
            stroke="#2A2C26"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Main MotoAssist Yellow Road Ribbon */}
          <path
            d="M7 27L11 11L18 20L25 11L29 27"
            stroke="#FFF174"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* The "A" Crossbar / Route Horizon Line in Chartreuse */}
          <path
            d="M13 21H23"
            stroke="#DFF127"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Forward Waypoint Navigation Node */}
          <circle cx="18" cy="20" r="2.2" fill="#DFF127" />
          <circle cx="18" cy="20" r="3.6" stroke="#DFF127" strokeWidth="0.8" opacity="0.6" />
        </svg>
      </div>

      {/* Brand Typography */}
      {withText && (
        <div className={`flex flex-col leading-none ${textClassName}`}>
          <div className="flex items-center text-base sm:text-lg font-black tracking-tight uppercase">
            <span className="text-[#EFF2F7]">MOTO</span>
            <span className="text-[#FFF174]">ASSIST</span>
          </div>
          {subtext ? (
            <span className="text-[9px] font-mono font-bold tracking-wider text-[#A8A6A3] uppercase mt-0.5">
              {subtext}
            </span>
          ) : (
            <span className="text-[9px] font-mono font-bold tracking-wider text-[#545347] uppercase mt-0.5">
              ROADSIDE & RESCUE
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * RouteArcMotif — Reusable decorative route curve for status indicators and cards
 */
export function RouteArcMotif({
  className = '',
  color = '#FFF174',
  accentColor = '#DFF127'
}: {
  className?: string;
  color?: string;
  accentColor?: string;
}) {
  return (
    <svg
      viewBox="0 0 240 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-6 pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <path
        d="M2 12C40 12 60 4 100 4C140 4 160 20 200 20C220 20 230 14 238 12"
        stroke="#383A32"
        strokeWidth="2"
        strokeDasharray="4 4"
      />
      <path
        d="M2 12C40 12 60 4 100 4C140 4 160 20 200 20C220 20 230 14 238 12"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="100" cy="4" r="3.5" fill={accentColor} />
      <circle cx="200" cy="20" r="3" fill={color} />
      <circle cx="2" cy="12" r="2.5" fill="#10B981" />
    </svg>
  );
}

/**
 * HighwayTelemetryBadge — Compact technical tag for coordinates, sector & ETA
 */
export function HighwayTelemetryBadge({
  label,
  value,
  variant = 'default'
}: {
  label: string;
  value: string;
  variant?: 'default' | 'chartreuse' | 'emergency';
}) {
  const getBadgeStyle = () => {
    switch (variant) {
      case 'chartreuse':
        return 'bg-[#20211D] border-[#383A32] text-[#DFF127]';
      case 'emergency':
        return 'bg-[#1C0F0F] border-red-500/40 text-red-300';
      default:
        return 'bg-[#151613] border-[#383A32] text-[#A8A6A3]';
    }
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-[10px] tracking-wider uppercase ${getBadgeStyle()}`}>
      <span className="text-[#545347] font-bold">{label}:</span>
      <span className="font-semibold text-[#EFF2F7]">{value}</span>
    </div>
  );
}
