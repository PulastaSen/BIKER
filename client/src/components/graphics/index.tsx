import React from 'react';

/**
 * <RoadPattern />
 * Subtle SVG repeating asphalt/road dashed center line pattern.
 */
export function RoadPattern({ className = '', opacity = 0.15 }: { className?: string; opacity?: number }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="road-lines" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="20" x2="20" y2="20" stroke="#FFF174" strokeWidth="1.5" strokeDasharray="6,6" />
            <line x1="0" y1="0" x2="40" y2="0" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#road-lines)" />
      </svg>
    </div>
  );
}

/**
 * <MountainBackground />
 * Stylized vector silhouette of Himalayan ridgelines (Siliguri/Sikkim corridor).
 */
export function MountainBackground({ className = '', height = 120, opacity = 0.25 }: { className?: string; height?: number; opacity?: number }) {
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
          fill="url(#mountain-grad-1)"
        />
        <path
          d="M0 260L120 200L220 220L360 150L460 190L600 110L740 170L880 90L1020 150L1160 110L1300 200L1440 160V260H0Z"
          fill="url(#mountain-grad-2)"
          opacity="0.6"
        />
        <defs>
          <linearGradient id="mountain-grad-1" x1="720" y1="40" x2="720" y2="260" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF174" stopOpacity="0.25" />
            <stop offset="1" stopColor="#090909" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="mountain-grad-2" x1="720" y1="90" x2="720" y2="260" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1E293B" stopOpacity="0.5" />
            <stop offset="1" stopColor="#090909" stopOpacity="0.95" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/**
 * <RouteLine />
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
        className={animated ? 'animate-route-dash' : ''}
      />
      {/* Waypoint nodes */}
      <circle cx="10" cy="30" r="5" fill="#22C55E" />
      <circle cx="170" cy="30" r="4" fill="#FFF174" />
      <circle cx="290" cy="30" r="5" fill="#EF4444" />
    </svg>
  );
}

/**
 * <GPSPulse />
 * Concentric animated GPS radar fix indicator with central coordinate point.
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
 * <SafetyPulse />
 * Emergency or Safe status shield pulse.
 */
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
        className="absolute inset-1 rounded-full opacity-30"
        style={{ backgroundColor: c, filter: 'blur(4px)' }}
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

/**
 * <ProviderMarker />
 * Custom high-visibility map / assistance marker.
 */
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

/**
 * <IncidentTimeline />
 * Linear status tracker for active road assistance request.
 */
export function IncidentTimeline({
  currentStep = 0,
  steps = ['Received', 'Assigned', 'En Route', 'Arrived', 'Complete'],
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

/**
 * <StatusIndicator />
 * Universal badge indicating live rider, GPS, or helper state.
 */
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

/**
 * <AnimatedSignal />
 * Dynamic 4-bar cellular / GPS satellite telemetry strength indicator.
 */
export function AnimatedSignal({
  strength = 4, // 1 to 4
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
