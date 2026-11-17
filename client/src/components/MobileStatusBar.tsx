/**
 * MobileStatusBar — Exact recreation of the top mobile status bar
 * with Time (9:41), Dynamic Island, 5G / Signal / Battery indicators.
 */
export function MobileStatusBar({ className = '' }: { className?: string }) {
  return (
    <div
      className={`w-full flex items-center justify-between px-5 pt-3 pb-1.5 text-white select-none z-30 ${className}`}
      aria-hidden="true"
    >
      {/* 1. Exact Time: 9:41 */}
      <span className="text-[14px] font-semibold tracking-tight text-white font-sans">
        9:41
      </span>

      {/* 2. Dynamic Island / Sensor Notch Pill */}
      <div className="w-[104px] h-[26px] bg-black rounded-full flex items-center justify-between px-2.5 border border-white/[0.08] shadow-[inset_0_1px_2px_rgba(255,255,255,0.06)]">
        <span className="w-2.5 h-2.5 rounded-full bg-[#111] border border-white/10" />
        <span className="w-2 h-2 rounded-full bg-[#0d1b2a] border border-sky-500/30" />
      </div>

      {/* 3. Cellular Signal Bars + 5G + Battery Indicator */}
      <div className="flex items-center gap-1.5 text-white">
        {/* Signal Bars */}
        <div className="flex items-end gap-[2px] h-3">
          <span className="w-[3px] h-[3px] bg-white rounded-[0.5px]" />
          <span className="w-[3px] h-[5px] bg-white rounded-[0.5px]" />
          <span className="w-[3px] h-[8px] bg-white rounded-[0.5px]" />
          <span className="w-[3px] h-[11px] bg-white rounded-[0.5px]" />
        </div>

        {/* 5G Badge */}
        <span className="text-[11px] font-bold tracking-tight text-white font-sans ml-0.5">
          5G
        </span>

        {/* Battery Icon with Fill */}
        <div className="w-[22px] h-[11px] border border-white/90 rounded-[3.5px] p-[1.5px] flex items-center relative ml-0.5">
          <div className="h-full w-full bg-white rounded-[1.5px]" />
          <div className="w-[1.5px] h-[4px] bg-white/90 absolute -right-[2.5px] top-[2.5px] rounded-r-[1px]" />
        </div>
      </div>
    </div>
  );
}
