import { X, Bell, CheckCircle2, ShieldCheck } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center sm:pt-16 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-[#181D24] border border-white/10 rounded-3xl p-5 text-white shadow-2xl space-y-4 z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#282215] border border-[#F5B041]/30 flex items-center justify-center text-[#F5B041]">
              <Bell size={16} />
            </div>
            <h3 className="font-display font-bold text-base text-white">Notifications</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {/* Notification 1 */}
          <div className="p-3 rounded-2xl bg-[#0A0D12] border border-emerald-500/30 flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0 animate-pulse" />
            <div className="leading-snug">
              <span className="text-xs font-bold text-white block">Rescue En Route</span>
              <p className="text-[11px] text-gray-400 mt-0.5">
                White Recovery Flatbed (WB-74-9812) has accepted your dispatch. ETA 12 minutes.
              </p>
              <span className="text-[9px] text-emerald-400 font-mono mt-1 block">Just now</span>
            </div>
          </div>

          {/* Notification 2 */}
          <div className="p-3 rounded-2xl bg-[#0A0D12] border border-white/5 flex items-start gap-3">
            <CheckCircle2 size={16} className="text-[#F5B041] mt-0.5 shrink-0" />
            <div className="leading-snug">
              <span className="text-xs font-bold text-white block">GPS Telemetry Synchronized</span>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Current sector Siliguri, West Bengal (±24m accuracy) verified with regional emergency hub.
              </p>
              <span className="text-[9px] text-gray-500 font-mono mt-1 block">5m ago</span>
            </div>
          </div>

          {/* Notification 3 */}
          <div className="p-3 rounded-2xl bg-[#0A0D12] border border-white/5 flex items-start gap-3">
            <ShieldCheck size={16} className="text-sky-400 mt-0.5 shrink-0" />
            <div className="leading-snug">
              <span className="text-xs font-bold text-white block">Himalayan Highway Safety Shield</span>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Active coverage confirmed on NH-10 Corridor. Zero tariffs for verified breakdown recovery.
              </p>
              <span className="text-[9px] text-gray-500 font-mono mt-1 block">1h ago</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-colors"
        >
          Close Notifications
        </button>
      </div>
    </div>
  );
}
