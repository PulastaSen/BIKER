import React from 'react';

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
      viewBox="0 0 64 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: size, height: (size * 3) / 4 }}
      aria-hidden="true"
    >
      {/* Rear Wheel */}
      <circle cx="14" cy="34" r="10" stroke={color} strokeWidth="3" fill="#111111" />
      <circle cx="14" cy="34" r="5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
      {/* Front Wheel */}
      <circle cx="50" cy="34" r="10" stroke={color} strokeWidth="3" fill="#111111" />
      <circle cx="50" cy="34" r="5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
      {/* Swingarm & Frame */}
      <path d="M14 34 L26 28 L34 32 L40 24 L50 34" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      {/* Tank & Seat */}
      <path d="M22 23 C26 23 28 20 33 20 C38 20 42 22 43 25" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Handlebars & Fork */}
      <path d="M41 24 L48 14 L50 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      {/* Windscreen / Fairing */}
      <path d="M46 16 L48 9 L44 14" stroke={color} strokeWidth="2" strokeLinecap="round" />
      {/* Engine Block */}
      <rect x="25" y="27" width="10" height="8" rx="2" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="1.5" />
      {/* Headlight Beam Glow */}
      <path d="M51 18 L62 14 L62 24 Z" fill="url(#beam-glow)" opacity="0.6" />
      <defs>
        <linearGradient id="beam-glow" x1="51" y1="19" x2="62" y2="19" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF174" stopOpacity="0.8" />
          <stop offset="1" stopColor="#FFF174" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * 4. <GPSPulse />
 * Concentric radar location pulse with live accuracy fix ring.
 */
export function GPSPulse({
  size = 20,
  color = '#22C55E',
  className = '',
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span
        className="absolute rounded-full animate-ping opacity-75"
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          animationDuration: '2s',
        }}
      />
      <span
        className="relative rounded-full"
        style={{
          width: size * 0.5,
          height: size * 0.5,
          backgroundColor: color,
        }}
      />
    </span>
  );
}

/**
 * 5. <MapRouteIllustration /> / <RouteLine />
 * Visual road corridor with start, active waypoint, and rescue destination pins.
 */
export function MapRouteIllustration({
  className = '',
  animated = true
}: {
  className?: string;
  animated?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 320 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-14 ${className}`}
      aria-hidden="true"
    >
      {/* Base road path */}
      <path
        d="M12 36 C 60 12, 100 52, 160 32 C 220 12, 260 48, 308 28"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Glowing animated line */}
      <path
        d="M12 36 C 60 12, 100 52, 160 32 C 220 12, 260 48, 308 28"
        stroke="#FFF174"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="8 6"
        className={animated ? 'animate-route-dash' : ''}
      />
      {/* Waypoint 1: Origin */}
      <circle cx="12" cy="36" r="6" fill="#22C55E" stroke="#111" strokeWidth="2" />
      {/* Waypoint 2: Midpoint / Helper */}
      <circle cx="160" cy="32" r="5" fill="#FFF174" stroke="#111" strokeWidth="2" />
      {/* Waypoint 3: Rescue Hub */}
      <circle cx="308" cy="28" r="6" fill="#EF4444" stroke="#111" strokeWidth="2" />
    </svg>
  );
}
export const RouteLine = MapRouteIllustration;

/**
 * 6. <SafetyShieldIllustration />
 * Layered protective safety shield with tick mark and security glow.
 */
export function SafetyShieldIllustration({
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
      viewBox="0 0 48 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: size, height: (size * 54) / 48 }}
      aria-hidden="true"
    >
      {/* Ambient aura */}
      <path
        d="M24 3 L42 11 V26 C42 37 34 46 24 51 C14 46 6 37 6 26 V11 L24 3 Z"
        fill={color}
        opacity="0.12"
      />
      {/* Outer shield */}
      <path
        d="M24 5 L40 12 V25 C40 35 33 43 24 48 C15 43 8 35 8 25 V12 L24 5 Z"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
        fill="#141414"
      />
      {/* Inner tick */}
      <path
        d="M16 26 L22 32 L32 20"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 7. <EmergencySignalAnimation />
 * Concentric expanding red beacon broadcast animation for distress & SOS.
 */
export function EmergencySignalAnimation({
  size = 64,
  className = ''
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span className="absolute inset-0 rounded-full bg-red-600/30 animate-ping" style={{ animationDuration: '1.8s' }} />
      <span className="absolute inset-2 rounded-full bg-red-600/40 animate-pulse" />
      <span className="relative w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-black text-sm shadow-[0_0_24px_rgba(239,68,68,0.8)] border border-red-300">
        SOS
      </span>
    </div>
  );
}

/**
 * 8. <ProviderMovementIndicator />
 * Animated vehicle / service motorcycle with motion trail indicating en route status.
 */
export function ProviderMovementIndicator({
  type = 'mechanic',
  className = ''
}: {
  type?: 'mechanic' | 'tow_truck';
  className?: string;
}) {
  return (
    <div className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#161616] border border-white/10 ${className}`}>
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
      </span>
      <span className="text-xs font-bold text-white flex items-center gap-1.5">
        <span>{type === 'tow_truck' ? '🚚 Flatbed' : '🏍️ Mobile Mechanic'}</span>
        <span className="text-emerald-400 text-[11px] font-semibold animate-pulse">En route</span>
      </span>
    </div>
  );
}

/**
 * 9. <IncidentProgressTimeline /> / <IncidentTimeline />
 * Linear responsive progress tracker from Request to Complete.
 */
export function IncidentProgressTimeline({
  currentStep = 0,
  steps = ['Received', 'Assigned', 'En Route', 'Arrived', 'Resolved'],
  className = '',
}: {
  currentStep?: number;
  steps?: string[];
  className?: string;
}) {
  return (
    <div className={`w-full flex items-center justify-between gap-1 py-2 ${className}`}>
      {steps.map((label, index) => {
        const isDone = index < currentStep;
        const isCurrent = index === currentStep;
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center gap-1.5 text-center flex-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                  isDone
                    ? 'bg-emerald-500 text-black'
                    : isCurrent
                    ? 'bg-[#FFF174] text-black ring-4 ring-[#FFF174]/20 scale-110 font-bold'
                    : 'bg-white/10 text-gray-400'
                }`}
              >
                {isDone ? '✓' : index + 1}
              </div>
              <span
                className={`text-[10px] tracking-tight leading-tight line-clamp-1 ${
                  isCurrent ? 'text-white font-bold' : isDone ? 'text-emerald-400' : 'text-gray-500'
                }`}
              >
                {label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-[2px] flex-1 mb-5 transition-all ${
                  index < currentStep ? 'bg-emerald-500' : 'bg-white/10'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
export const IncidentTimeline = IncidentProgressTimeline;

/**
 * 10. <VerificationShield />
 * Holographic verified identity badge with security tick.
 */
export function VerificationShield({
  isVerified = true,
  size = 32,
  className = ''
}: {
  isVerified?: boolean;
  size?: number;
  className?: string;
}) {
  const color = isVerified ? '#22C55E' : '#F59E0B';
  return (
    <svg
      viewBox="0 0 32 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block ${className}`}
      style={{ width: size, height: (size * 36) / 32 }}
      aria-hidden="true"
    >
      <path
        d="M16 2 L28 7 V17 C28 25 22 31 16 34 C10 31 4 25 4 17 V7 L16 2 Z"
        fill={color}
        fillOpacity="0.15"
        stroke={color}
        strokeWidth="2"
      />
      {isVerified ? (
        <path d="M11 17 L15 21 L22 13" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <circle cx="16" cy="18" r="2" fill="#F59E0B" />
      )}
    </svg>
  );
}

/**
 * 11. <IdentityDocumentPreview />
 * Vector card mockup with chip, photo slot, holographic watermark.
 */
export function IdentityDocumentPreview({
  docType = 'Driving Licence',
  docNumber = 'DL-WB74-****-1024',
  issuer = 'Transport Dept',
  status = 'VERIFIED',
  className = ''
}: {
  docType?: string;
  docNumber?: string;
  issuer?: string;
  status?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative w-full max-w-sm rounded-2xl p-4 bg-gradient-to-br from-[#1c1c1c] via-[#141414] to-[#0f0f0f] border border-white/15 shadow-xl text-white overflow-hidden select-none ${className}`}
    >
      {/* Holographic shimmer effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FFF174]/15 via-transparent to-transparent pointer-events-none rounded-full blur-xl" />
      
      <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-5 rounded bg-yellow-600/30 border border-yellow-500/50 flex items-center justify-center text-[9px] text-yellow-300 font-mono">
            CHIP
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-gray-200">{docType}</span>
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
            status === 'VERIFIED'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
          }`}
        >
          {status}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Photo Box */}
        <div className="w-12 h-14 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-gray-500 shrink-0">
          <span className="text-base">👤</span>
          <span className="text-[8px] font-mono mt-0.5 text-gray-400">ID PHOTO</span>
        </div>

        {/* Document Details */}
        <div className="space-y-1 flex-1 min-w-0">
          <div className="text-[11px] font-mono font-bold text-[#FFF174] truncate tracking-wider">
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
 * 12. <BikeHealthIllustration />
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
 * 13. <AnimatedConnectionStatus /> / <StatusIndicator /> / <AnimatedSignal />
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

// Backwards compatibility helpers
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
