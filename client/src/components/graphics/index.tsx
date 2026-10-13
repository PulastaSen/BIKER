// Vector Graphic System for MotoAssist

/**
 * 1. <AnimatedRoadLines /> / <RoadPattern />
 * Continuous dynamic asphalt dashed highway lane lines.
 */
export function AnimatedRoadLines({ className = '', opacity = 0.25 }: { className?: string; opacity?: number }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="animated-road-lines" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="20" x2="20" y2="20" stroke="#FFF174" strokeWidth="1.5" strokeDasharray="6,6">
              <animate attributeName="stroke-dashoffset" values="0;12" dur="1.2s" repeatCount="indefinite" />
            </line>
            <line x1="0" y1="0" x2="40" y2="0" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#animated-road-lines)" />
      </svg>
    </div>
  );
}
export const RoadPattern = AnimatedRoadLines;

/**
 * 2. <MountainContourPattern /> / <MountainBackground />
 * Stylized vector contour lines and elevation silhouette of Himalayan ridgelines.
 */
export function MountainContourPattern({ className = '', height = 140, opacity = 0.3 }: { className?: string; height?: number; opacity?: number }) {
  return (
    <div
      className={`pointer-events-none absolute bottom-0 left-0 right-0 overflow-hidden ${className}`}
      style={{ opacity, height }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover"
        preserveAspectRatio="none"
      >
        <path
          d="M0 260L80 180L160 210L260 130L340 170L480 80L580 140L720 40L840 120L960 70L1080 160L1200 100L1320 180L1440 120V260H0Z"
          fill="url(#mountain-contour-grad-1)"
        />
        <path
          d="M0 260L120 200L220 220L360 150L460 190L600 110L740 170L880 90L1020 150L1160 110L1300 200L1440 160V260H0Z"
          fill="url(#mountain-contour-grad-2)"
          opacity="0.6"
        />
        {/* Topographic elevation lines */}
        <path
          d="M0 230 Q 360 120 720 190 T 1440 150"
          stroke="#FFF174"
          strokeWidth="0.75"
          strokeDasharray="4 4"
          opacity="0.4"
        />
        <path
          d="M0 200 Q 420 80 840 160 T 1440 120"
          stroke="#FFF174"
          strokeWidth="0.5"
          strokeDasharray="2 4"
          opacity="0.25"
        />
        <defs>
          <linearGradient id="mountain-contour-grad-1" x1="720" y1="40" x2="720" y2="260" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF174" stopOpacity="0.25" />
            <stop offset="1" stopColor="#090909" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="mountain-contour-grad-2" x1="720" y1="90" x2="720" y2="260" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1E293B" stopOpacity="0.5" />
            <stop offset="1" stopColor="#090909" stopOpacity="0.98" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
export const MountainBackground = MountainContourPattern;

/**
 * 3. <MotorcycleSilhouette />
 * Sharp, precision adventure tourer motorcycle silhouette.
 */
export function MotorcycleSilhouette({
  className = '',
  size = 48,
  color = '#FFF174'
}: {
  className?: string;
  size?: number;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size * 0.6}
      viewBox="0 0 100 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Motorcycle Silhouette"
    >
      {/* Front wheel with disc brake */}
      <circle cx="82" cy="42" r="14" stroke={color} strokeWidth="2.5" />
      <circle cx="82" cy="42" r="8" stroke={color} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
      <circle cx="82" cy="42" r="2.5" fill={color} />

      {/* Rear wheel with sprocket */}
      <circle cx="18" cy="42" r="14" stroke={color} strokeWidth="2.5" />
      <circle cx="18" cy="42" r="8" stroke={color} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
      <circle cx="18" cy="42" r="2.5" fill={color} />

      {/* Frame, swingarm, and engine block */}
      <path
        d="M18 42L36 34L44 44L60 44L68 34L82 42"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Trellis frame & fuel tank contour */}
      <path
        d="M36 34L48 20L64 20L72 28L68 34L48 34Z"
        fill={color}
        fillOpacity="0.2"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* ADV Windshield & Handlebar */}
      <path
        d="M66 22L76 8L74 6"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="71" cy="12" r="2" fill={color} />

      {/* Exhaust pipe */}
      <path
        d="M48 42L30 38L14 30"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Rear rack / pillion tail */}
      <path
        d="M36 34L26 28L18 28"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * 4. <RouteLine /> / <AnimatedRouteLine />
 * Dynamic animated glowing route path connecting origin to destination.
 */
export function RouteLine({ className = '', animated = true }: { className?: string; animated?: boolean }) {
  return (
    <svg
      viewBox="0 0 300 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-12 ${className}`}
      aria-hidden="true"
    >
      <path
        d="M10 30 C 70 10, 110 50, 170 30 C 220 15, 250 45, 290 30"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M10 30 C 70 10, 110 50, 170 30 C 220 15, 250 45, 290 30"
        stroke="#FFF174"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="8 6"
      >
        {animated && (
          <animate
            attributeName="stroke-dashoffset"
            values="28;0"
            dur="1.5s"
            repeatCount="indefinite"
          />
        )}
      </path>
      {/* Waypoint nodes */}
      <circle cx="10" cy="30" r="5" fill="#22C55E" />
      <circle cx="170" cy="30" r="4" fill="#FFF174" />
      <circle cx="290" cy="30" r="5" fill="#EF4444" />
    </svg>
  );
}
export const AnimatedRouteLine = RouteLine;

/**
 * 5. <SafetyShieldGraphic />
 * Tactical multi-ring security shield with embedded lock geometry.
 */
export function SafetyShieldGraphic({
  size = 56,
  color = '#FFF174',
  className = ''
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M32 4L10 14V30C10 44 20 54 32 60C44 54 54 44 54 30V14L32 4Z"
        fill={color}
        fillOpacity="0.12"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M32 12L16 20V30C16 41 23 48 32 53C41 48 48 41 48 30V20L32 12Z"
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray="4 3"
        opacity="0.6"
      />
      {/* Checkmark inside */}
      <path
        d="M24 32L30 38L42 24"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 6. <GpsLocationPulse />
 * Concentric animated beacon pulse indicating active high-accuracy GPS tracking.
 */
export function GpsLocationPulse({
  size = 48,
  active = true,
  className = ''
}: {
  size?: number;
  active?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-label="GPS Location Beacon"
    >
      {active && (
        <>
          <span className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping opacity-75" />
          <span className="absolute inset-2 rounded-full border border-emerald-400/50 animate-pulse" />
        </>
      )}
      <div className="relative w-4 h-4 rounded-full bg-emerald-400 border-2 border-white shadow-[0_0_12px_#34D399]" />
    </div>
  );
}

/**
 * 7. <EmergencySignalPulse />
 * High-urgency red radar wave pulse for SOS & active emergency broadcasts.
 */
export function EmergencySignalPulse({
  size = 54,
  className = ''
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-label="Emergency SOS Pulse"
    >
      <span className="absolute inset-0 rounded-full bg-red-600/40 animate-ping opacity-90" />
      <span className="absolute inset-2 rounded-full border-2 border-red-500/60 animate-pulse" />
      <div className="relative w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-[0_0_18px_#EF4444]" />
    </div>
  );
}

/**
 * 8. <VerificationShield />
 * Verified Government & Identity badge indicator.
 */
export function VerificationShield({
  status = 'VERIFIED',
  className = ''
}: {
  status?: 'VERIFIED' | 'UNDER_REVIEW' | 'NOT_STARTED' | 'REJECTED';
  className?: string;
}) {
  const configs = {
    VERIFIED: {
      color: '#34D399',
      bg: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300',
      text: 'Identity Verified'
    },
    UNDER_REVIEW: {
      color: '#FBBF24',
      bg: 'bg-yellow-950/40 border-yellow-500/40 text-yellow-300',
      text: 'Under Review'
    },
    NOT_STARTED: {
      color: '#9CA3AF',
      bg: 'bg-white/5 border-white/10 text-gray-400',
      text: 'Not Verified'
    },
    REJECTED: {
      color: '#EF4444',
      bg: 'bg-red-950/40 border-red-500/40 text-red-300',
      text: 'Action Required'
    }
  }[status];

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-bold ${configs.bg} ${className}`}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 2L3 6V12C3 17.5 7 21.5 12 22C17 21.5 21 17.5 21 12V6L12 2Z"
          fill={configs.color}
          fillOpacity="0.2"
          stroke={configs.color}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {status === 'VERIFIED' && (
          <path d="M8 12L11 15L16 9" stroke={configs.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
      <span>{configs.text}</span>
    </div>
  );
}

/**
 * 9. <IncidentTimelineGraphic />
 * Visual step progression node for active emergency / roadside assists.
 */
export function IncidentTimelineGraphic({
  steps,
  currentStep,
  className = ''
}: {
  steps?: Array<{ label: string; completed: boolean; current?: boolean }>;
  currentStep?: number;
  className?: string;
}) {
  const defaultLabels = ['Requested', 'Accepted', 'En Route', 'Arrived', 'Completed'];
  const resolvedSteps = steps || defaultLabels.map((label, idx) => {
    const activeIdx = currentStep ?? 2;
    return {
      label,
      completed: idx <= activeIdx,
      current: idx === activeIdx
    };
  });

  return (
    <div className={`w-full py-2 ${className}`}>
      <div className="flex items-center justify-between relative">
        {/* Background track line */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-white/10 z-0" />

        {resolvedSteps.map((step, idx) => (
          <div key={step.label} className="relative z-10 flex flex-col items-center">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                step.completed
                  ? 'bg-[#FFF174] text-black shadow-[0_0_10px_rgba(255,241,116,0.4)]'
                  : 'bg-[#181818] border border-white/20 text-gray-500'
              } ${step.current ? 'ring-4 ring-[#FFF174]/30 scale-110' : ''}`}
            >
              {idx + 1}
            </div>
            <span
              className={`text-[10px] font-bold mt-1.5 whitespace-nowrap ${
                step.current ? 'text-[#FFF174]' : step.completed ? 'text-white' : 'text-gray-500'
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
export const IncidentTimeline = IncidentTimelineGraphic;

/**
 * 10. <DocumentPreviewGraphic />
 * Secure card thumbnail mockup for driving licences, RC, or government ID cards.
 */
export function DocumentPreviewGraphic({
  docType = 'DRIVING_LICENCE',
  docNumber = 'DL-WB74-****-1024',
  issuer = 'Transport Dept, West Bengal',
  className = ''
}: {
  docType?: string;
  docNumber?: string;
  issuer?: string;
  className?: string;
}) {
  return (
    <div className={`p-3.5 rounded-2xl bg-gradient-to-br from-[#1A1A1A] to-[#121212] border border-white/15 relative overflow-hidden ${className}`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFF174]/10 rounded-full blur-xl pointer-events-none" />

      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FFF174] font-bold text-xs">
            ID
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
              OFFICIAL RECORD
            </span>
            <strong className="text-xs font-bold text-white block">
              {docType.replace('_', ' ')}
            </strong>
          </div>
        </div>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          PROTECTED
        </span>
      </div>

      <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-xs">
        <div>
          <div className="text-gray-300 font-mono text-[11px] font-semibold tracking-wider">
            {docNumber}
          </div>
          <div className="text-[10px] text-gray-400 truncate">Issuer: {issuer}</div>
          <div className="text-[9px] text-gray-500 font-mono">ENCRYPTED VAULT STORAGE</div>
        </div>
      </div>
    </div>
  );
}

/**
 * 11. <BikeHealthIllustration />
 * Motorcycle schematic with diagnostics points for engine, battery, tyres.
 */
export function BikeHealthIllustration({
  className = '',
  status = {
    engine: 'HEALTHY',
    battery: 'HEALTHY',
    tyres: 'CHECK',
    brakes: 'HEALTHY'
  }
}: {
  className?: string;
  status?: {
    engine?: 'HEALTHY' | 'CHECK' | 'CRITICAL';
    battery?: 'HEALTHY' | 'CHECK' | 'CRITICAL';
    tyres?: 'HEALTHY' | 'CHECK' | 'CRITICAL';
    brakes?: 'HEALTHY' | 'CHECK' | 'CRITICAL';
  };
}) {
  const getDotColor = (st?: string) => {
    if (st === 'CRITICAL') return '#EF4444';
    if (st === 'CHECK') return '#F59E0B';
    return '#22C55E';
  };

  return (
    <div className={`p-4 rounded-2xl bg-[#121212] border border-white/10 ${className}`}>
      <div className="flex items-center justify-between mb-3 text-xs font-bold text-gray-300">
        <span>BIKE HEALTH MONITOR</span>
        <span className="text-emerald-400 text-[10px] font-mono">LIVE TELEMETRY</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
          <span className="text-gray-300 text-[11px]">Engine</span>
          <span className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: getDotColor(status.engine) }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getDotColor(status.engine) }} />
            {status.engine}
          </span>
        </div>
        <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
          <span className="text-gray-300 text-[11px]">Battery</span>
          <span className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: getDotColor(status.battery) }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getDotColor(status.battery) }} />
            {status.battery}
          </span>
        </div>
        <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
          <span className="text-gray-300 text-[11px]">Tyre Pressure</span>
          <span className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: getDotColor(status.tyres) }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getDotColor(status.tyres) }} />
            {status.tyres}
          </span>
        </div>
        <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
          <span className="text-gray-300 text-[11px]">Braking ABS</span>
          <span className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: getDotColor(status.brakes) }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getDotColor(status.brakes) }} />
            {status.brakes}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * 12. <AnimatedConnectionStatus /> / <StatusIndicator /> / <AnimatedSignal />
 * Live network and telemetry connection status with ping and socket state.
 */
export function AnimatedConnectionStatus({
  isConnected = true,
  pingMs = 28,
  className = ''
}: {
  isConnected?: boolean;
  pingMs?: number;
  className?: string;
}) {
  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#141414] border border-white/10 text-xs ${className}`}>
      <span className="relative flex h-2 w-2">
        {isConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-emerald-400' : 'bg-red-500'}`} />
      </span>
      <span className="font-semibold text-gray-300 text-[11px]">
        {isConnected ? `Online (${pingMs}ms)` : 'Offline'}
      </span>
    </div>
  );
}

export function StatusIndicator({
  state = 'online',
  text,
  size = 'md',
  className = '',
}: {
  state?: 'online' | 'offline' | 'warning' | 'danger' | 'standby';
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const configs = {
    online: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-400', pulse: true },
    standby: { bg: 'bg-blue-500/15', border: 'border-blue-500/30', text: 'text-blue-400', dot: 'bg-blue-400', pulse: false },
    warning: { bg: 'bg-amber-500/15', border: 'border-amber-500/30', text: 'text-amber-400', dot: 'bg-amber-400', pulse: true },
    danger: { bg: 'bg-red-500/15', border: 'border-red-500/30', text: 'text-red-400', dot: 'bg-red-400', pulse: true },
    offline: { bg: 'bg-white/5', border: 'border-white/10', text: 'text-gray-400', dot: 'bg-gray-500', pulse: false },
  }[state];

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full border ${configs.bg} ${configs.border} ${configs.text} ${sizeClasses} ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${configs.dot} ${configs.pulse ? 'animate-pulse' : ''}`} />
      <span>{text || state.toUpperCase()}</span>
    </span>
  );
}

export function AnimatedSignal({
  strength = 4,
  className = '',
}: {
  strength?: number;
  className?: string;
}) {
  return (
    <div className={`inline-flex items-end gap-[2px] h-3.5 ${className}`} aria-label={`Signal strength: ${strength} of 4`}>
      {[1, 2, 3, 4].map((bar) => (
        <span
          key={bar}
          className={`w-[3px] rounded-sm transition-all ${
            bar <= strength ? 'bg-emerald-400' : 'bg-white/20'
          }`}
          style={{ height: `${bar * 25}%` }}
        />
      ))}
    </div>
  );
}

export function SafetyPulse({
  variant = 'safe',
  size = 40,
  className = '',
}: {
  variant?: 'safe' | 'warning' | 'emergency';
  size?: number;
  className?: string;
}) {
  const colorMap = {
    safe: '#22C55E',
    warning: '#F59E0B',
    emergency: '#EF4444',
  };
  const c = colorMap[variant];

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 rounded-full animate-ping opacity-40"
        style={{ backgroundColor: c, animationDuration: '2.4s' }}
      />
      <div
        className="relative rounded-full flex items-center justify-center"
        style={{
          width: size * 0.65,
          height: size * 0.65,
          backgroundColor: c,
          boxShadow: `0 0 12px ${c}`,
        }}
      />
    </div>
  );
}

export function ProviderMarker({
  category = 'mechanic',
  isVerified = true,
  rating = 4.8,
  className = '',
}: {
  category?: 'mechanic' | 'towing' | 'fuel' | 'medical';
  isVerified?: boolean;
  rating?: number;
  className?: string;
}) {
  const iconEmoji = {
    mechanic: '🔧',
    towing: '🚚',
    fuel: '⛽',
    medical: '🚑',
  }[category];

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      <div className="px-2.5 py-1 rounded-xl bg-[#111111] border border-[#FFF174]/40 shadow-xl flex items-center gap-1.5 text-xs text-white">
        <span>{iconEmoji}</span>
        {rating && <span className="text-[#FFF174] font-black text-[11px]">★ {rating}</span>}
        {isVerified && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Verified" />}
      </div>
      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#111111]" />
    </div>
  );
}
