import { useState } from 'react';
import { 
  AlertTriangle, 
  PhoneCall, 
  Share2, 
  MapPin, 
  X, 
  Check, 
  MessageCircle,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useUserLocation } from '../hooks/useUserLocation';
import { buildWhatsAppFeelingUnsafeUrl } from '../utils/whatsappShare';

export interface FeelingUnsafeModalProps {
  isOpen: boolean;
  onClose: () => void;
  primaryContactPhone?: string;
  primaryContactName?: string;
}

// Section 12 situations
const SITUATIONS = [
  'Someone is following me',
  'Someone is threatening me',
  'I am being harassed',
  'I feel unsafe',
  'I am lost',
  'Other',
];

export function FeelingUnsafeModal({
  isOpen,
  onClose,
  primaryContactPhone = '+91 98765 43210',
  primaryContactName = 'Family Contact',
}: FeelingUnsafeModalProps) {
  const [selectedSituation, setSelectedSituation] = useState<string>('Someone is following me');
  const [copiedLink, setCopiedLink] = useState(false);
  const { coords, accuracy, status, requestLocation } = useUserLocation(true);

  if (!isOpen) return null;

  const lat = coords?.lat;
  const lng = coords?.lng;
  const googleMapsUrl = lat && lng ? `https://maps.google.com/?q=${lat},${lng}` : '';

  const whatsAppUrl = buildWhatsAppFeelingUnsafeUrl({
    latitude: lat,
    longitude: lng,
    phone: primaryContactPhone,
    riderName: 'Pulasta',
    situation: selectedSituation,
  });

  const handleShareLocation = async () => {
    if (!googleMapsUrl) {
      requestLocation();
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Emergency Live Location - MotoAssist',
          text: `⚠️ MotoAssist Safety: I need immediate check-in. My live location: ${googleMapsUrl}`,
          url: googleMapsUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    await navigator.clipboard.writeText(`⚠️ MotoAssist Safety Live Location: ${googleMapsUrl}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const safePlaceUrl = lat && lng
    ? `https://www.google.com/maps/search/police+station+or+24+7+fuel+station+near+me/@${lat},${lng},14z`
    : `https://www.google.com/maps/search/police+station+or+24+7+fuel+station+near+me`;

  const isBeingFollowed = selectedSituation === 'Someone is following me';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feeling-unsafe-modal-title"
    >
      <div className="w-full sm:max-w-lg bg-[#140D0D] border-t sm:border border-amber-500/40 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40">
              <AlertTriangle size={20} />
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                RAPID SAFETY RESPONSE
              </span>
              <h2
                id="feeling-unsafe-modal-title"
                className="text-lg sm:text-xl font-black text-white tracking-tight"
              >
                ⚠️ Feeling Unsafe?
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* SECTION 13: BEING FOLLOWED BANNER */}
        {isBeingFollowed ? (
          <div className="p-4 rounded-2xl bg-amber-950/60 border-2 border-amber-500/60 text-amber-200 text-xs space-y-1">
            <h3 className="font-black text-sm text-amber-300 uppercase tracking-wide">
              YOU'RE NOT ALONE
            </h3>
            <p className="leading-relaxed">
              Your trusted contacts can be alerted immediately. Do NOT stop or confront the person. Head toward a well-lit 24/7 petrol station, toll plaza, or police station.
            </p>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
            <ShieldAlert size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Safety Advisory:</strong> Do not confront the person. Stay in well-lit areas, keep moving toward public/populated zones.
            </p>
          </div>
        )}

        {/* Situation Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 block">
            What is happening?
          </label>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {SITUATIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedSituation(s)}
                className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                  selectedSituation === s
                    ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                    : 'bg-[#181818] border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================
            FOUR IMMEDIATE ACTIONS (Section 12 & 13 Specification)
            [ALERT FAMILY] [SHARE LOCATION] [CALL 112] [FIND SAFE LOCATION]
            ======================================================== */}
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-gray-300 block">
            IMMEDIATE ACTIONS
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            
            {/* 1. Alert Family via WhatsApp */}
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-left transition-all active:scale-95 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <strong className="block text-xs sm:text-sm font-black text-white">
                    [ ALERT FAMILY ]
                  </strong>
                  <span className="text-[10px] text-emerald-300 block">
                    WhatsApp to {primaryContactName}
                  </span>
                </div>
              </div>
              <ArrowRight size={14} className="text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </a>

            {/* 2. Share Location */}
            <button
              type="button"
              onClick={handleShareLocation}
              className="p-3.5 rounded-2xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-left transition-all active:scale-95 flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  {copiedLink ? <Check size={20} className="text-emerald-400" /> : <Share2 size={20} />}
                </div>
                <div>
                  <strong className="block text-xs sm:text-sm font-black text-white">
                    {copiedLink ? 'Link Copied!' : '[ SHARE LOCATION ]'}
                  </strong>
                  <span className="text-[10px] text-blue-300 block">
                    {lat && lng ? `GPS ±${accuracy || 12}m` : 'Send phone location'}
                  </span>
                </div>
              </div>
              <ArrowRight size={14} className="text-blue-400 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* 3. Call 112 */}
            <a
              href="tel:112"
              className="p-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-left transition-all active:scale-95 flex items-center justify-between shadow-[0_0_20px_rgba(220,38,38,0.4)]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <PhoneCall size={20} className="text-white" />
                </div>
                <div>
                  <strong className="block text-xs sm:text-sm font-black">
                    [ CALL 112 ]
                  </strong>
                  <span className="text-[10px] text-red-200 block">
                    National Emergency Police
                  </span>
                </div>
              </div>
              <span className="text-xs font-black bg-white/20 px-2 py-1 rounded-lg">DIAL</span>
            </a>

            {/* 4. Find Safe Location */}
            <a
              href={safePlaceUrl}
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-left transition-all active:scale-95 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 text-[#FFF174] flex items-center justify-center shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <strong className="block text-xs sm:text-sm font-black text-white">
                    [ FIND SAFE LOCATION ]
                  </strong>
                  <span className="text-[10px] text-gray-400 block">
                    Police / 24/7 Fuel Hub
                  </span>
                </div>
              </div>
              <ArrowRight size={14} className="text-[#FFF174] group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* Location Status Ticker */}
        <div className="pt-2 flex items-center justify-between text-[11px] text-gray-400 border-t border-white/10">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span>
              {status === 'active'
                ? `📍 Location Active (±${accuracy || 12}m)`
                : status === 'denied'
                ? 'Location access turned off'
                : 'Acquiring GPS...'}
            </span>
          </div>
          <span>External WhatsApp enabled</span>
        </div>

      </div>
    </div>
  );
}
