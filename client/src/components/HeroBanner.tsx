import { getAssetUrl } from '../utils/assets';

interface HeroBannerProps {
  className?: string;
  onClick?: () => void;
}

/**
 * HeroBanner — Exact reproduction of the mountain motorcycle touring banner
 * with "Ride Safe. Get Help Anytime." and "Roadside · Medical · Safety · Towing".
 */
export function HeroBanner({ className = '', onClick }: HeroBannerProps) {
  const heroImageUrl = getAssetUrl('/images/motoassist-hero.jpg');

  return (
    <div
      onClick={onClick}
      className={`relative w-full overflow-hidden rounded-2xl border border-white/10 shadow-lg min-h-[145px] sm:min-h-[160px] flex items-center select-none ${
        onClick ? 'cursor-pointer hover:border-white/20 transition-all' : ''
      } ${className}`}
      role="banner"
      aria-label="MotoAssist Ride Safe Get Help Anytime"
    >
      {/* Background Touring Motorcycle Photograph */}
      <img
        src={heroImageUrl}
        alt="Motorcycle rider touring through mountain pass"
        className="absolute inset-0 w-full h-full object-cover object-[70%_center]"
        loading="eager"
      />

      {/* Dark Vignette Overlay for Text Legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-transparent pointer-events-none" />

      {/* Top Subtle Edge Rim Light */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-white/20 pointer-events-none" />

      {/* Hero Typography on Left */}
      <div className="relative z-10 px-5 sm:px-6 py-4 max-w-[70%] sm:max-w-[65%]">
        <h2 className="text-[19px] sm:text-[23px] font-display font-black tracking-tight leading-[1.18]">
          <span className="text-white italic block">Ride Safe.</span>
          <span className="text-[#F5B041] italic block">Get Help Anytime.</span>
        </h2>
        <p className="text-[11px] sm:text-[12px] text-gray-300/90 font-medium tracking-wide mt-1.5 whitespace-nowrap">
          Roadside · Medical · Safety · Towing
        </p>
      </div>
    </div>
  );
}
