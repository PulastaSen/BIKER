import { getAssetUrl } from '../utils/assets';

interface HeroBannerProps {
  className?: string;
  onClick?: () => void;
}

/**
 * HeroBanner — Mountain motorcycle touring banner
 * In desktop view: prominent widescreen rectangle above.
 * In mobile view: exact mobile dimensions and typography preserved.
 */
export function HeroBanner({ className = '', onClick }: HeroBannerProps) {
  const heroImageUrl = getAssetUrl('/images/motoassist-hero.jpg');

  return (
    <div
      onClick={onClick}
      className={`relative w-full overflow-hidden rounded-2xl md:rounded-3xl border border-white/10 shadow-xl min-h-[145px] sm:min-h-[160px] md:min-h-[250px] lg:min-h-[290px] flex items-center select-none ${
        onClick ? 'cursor-pointer hover:border-white/25 transition-all' : ''
      } ${className}`}
      role="banner"
      aria-label="MotoAssist Ride Safe Get Help Anytime"
    >
      {/* Background Touring Motorcycle Photograph */}
      <img
        src={heroImageUrl}
        alt="Motorcycle rider touring through mountain pass"
        className="absolute inset-0 w-full h-full object-cover object-[70%_center] md:object-[65%_center]"
        loading="eager"
      />

      {/* Dark Vignette Overlay for Text Legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent md:from-black/92 md:via-black/55 pointer-events-none" />

      {/* Top Subtle Edge Rim Light */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-white/20 pointer-events-none" />

      {/* Hero Typography on Left */}
      <div className="relative z-10 px-5 sm:px-6 md:px-8 py-4 md:py-8 max-w-[70%] sm:max-w-[65%] md:max-w-[55%]">
        <h2 className="text-[19px] sm:text-[23px] md:text-[32px] lg:text-[38px] font-display font-black tracking-tight leading-[1.18] md:leading-[1.12]">
          <span className="text-white italic block">Ride Safe.</span>
          <span className="text-[#F5B041] italic block">Get Help Anytime.</span>
        </h2>
        <p className="text-[11px] sm:text-[12px] md:text-[14px] lg:text-[15px] text-gray-300/90 font-medium tracking-wide mt-1.5 md:mt-3 whitespace-nowrap">
          Roadside · Medical · Safety · Towing
        </p>
      </div>
    </div>
  );
}
