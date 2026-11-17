import { MapPin } from 'lucide-react';

interface LocationCardProps {
  locationText?: string;
  accuracyText?: string;
  isGpsActive?: boolean;
  className?: string;
  onRefreshLocation?: () => void;
}

/**
 * LocationCard — Exact reproduction of the location section
 * with Yellow pin, Siliguri West Bengal, GPS Active badge, and accuracy telemetry.
 */
export function LocationCard({
  locationText = 'Siliguri, West Bengal',
  accuracyText = '±24 m • Updated just now',
  isGpsActive = true,
  className = '',
  onRefreshLocation,
}: LocationCardProps) {
  return (
    <div
      className={`w-full flex items-center justify-between px-1 py-1 ${className}`}
      aria-label="Current Sector & Geolocation Telemetry"
    >
      {/* Left: Location Pin & Sector Name */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="shrink-0 text-[#F5B041]">
          <MapPin size={20} className="fill-[#F5B041] text-[#F5B041]" />
        </div>
        <div className="flex flex-col min-w-0 leading-tight">
          <strong className="text-[14px] sm:text-[15px] font-bold text-white tracking-tight truncate block">
            {locationText}
          </strong>
          <span className="text-[11px] text-[#8A96A3] font-medium tracking-wide mt-0.5 truncate block">
            {accuracyText}
          </span>
        </div>
      </div>

      {/* Right: GPS Active Pill Badge */}
      <button
        type="button"
        onClick={onRefreshLocation}
        className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#072418] border border-emerald-500/40 text-[11px] font-semibold text-emerald-400 select-none shadow-sm hover:border-emerald-500/70 transition-colors"
        title="GPS Satellite Telemetry Active"
        aria-label="GPS Active Status Indicator"
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isGpsActive ? 'bg-emerald-400 animate-pulse' : 'bg-yellow-400'
          }`}
        />
        <span>GPS Active</span>
      </button>
    </div>
  );
}
