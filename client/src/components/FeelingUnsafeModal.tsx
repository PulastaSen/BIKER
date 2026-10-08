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

const SITUATIONS = [
  'Someone is following me',
  'Someone is threatening me',
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
    riderName: 'I',
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feeling-unsafe-title"
    >
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#141010] border border-red-500/40 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 text-white shadow-[0_0_50px_rgba(220,38,38,0.4)] z-10 max-h-[90vh] overflow-y-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <AlertTriangle size={20} />
            </span>
            <div>
              <h2 id="feeling-unsafe-title" className="text-lg font-black text-white">
                FEELING UNSAFE?
              </h2>
              <span className="text-[11px] text-gray-400">
                Immediate protection protocols • Zero hesitation
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Advisory per spec: Do not recommend confronting the person */}
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
          <ShieldAlert size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Safety rule:</strong> Keep moving towards a populated, well-lit place or fuel station. Do not stop or confront anyone.
          </p>
        </div>

        {/* Step 1: Options */}
        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 block">
            What is your situation?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SITUATIONS.map((sit) => (
              <button
                key={sit}
                type="button"
                onClick={() => setSelectedSituation(sit)}
                className={`p-3 rounded-xl text-left text-xs font-bold transition-all border cursor-pointer ${
                  selectedSituation === sit
                    ? 'bg-amber-400/20 border-amber-400 text-[#FFF174]'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                }`}
              >
                {sit}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Response (4 Immediate Actions) */}
        <div className="space-y-2.5 pt-1">
          <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 block">
            Immediate Response Actions
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* 1. Alert Family */}
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-left transition-all active:scale-95 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <strong className="block text-xs sm:text-sm font-black text-white">
                    Alert Family
                  </strong>
                  <span className="text-[10px] text-emerald-300 block">
                    Share status via WhatsApp
                  </span>
                </div>
              </div>
              <ArrowRight size={14} className="text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </a>

            {/* 2. Share Location */}
            <button
              type="button"
              onClick={handleShareLocation}
              className="p-3.5 rounded-2xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-left transition-all active:scale-95 flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0">
                  {copiedLink ? <Check size={20} /> : <Share2 size={20} />}
                </div>
                <div>
                  <strong className="block text-xs sm:text-sm font-black text-white">
                    {copiedLink ? 'Location Copied!' : 'Share Location'}
                  </strong>
                  <span className="text-[10px] text-blue-300 block">
                    {lat && lng ? `GPS ±${accuracy || 12}m` : 'Acquiring location...'}
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
                  <strong className="block text-sm sm:text-base font-black">
                    Call 112
                  </strong>
                  <span className="text-[10px] text-red-200 block">
                    National Emergency SOS
                  </span>
                </div>
              </div>
              <span className="text-xs font-black bg-white/20 px-2 py-1 rounded-lg">DIAL</span>
            </a>

            {/* 4. Find Safe Place */}
            <a
              href={`https://www.google.com/maps/search/police+station+or+fuel+pump+near+me/@${lat || 26.7271},${lng || 88.3953},14z`}
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
                    Find Safe Place
                  </strong>
                  <span className="text-[10px] text-gray-400 block">
                    Police / 24/7 Fuel Pump
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
          {primaryContactName && (
            <span>Circle: {primaryContactName}</span>
          )}
        </div>
      </div>
    </div>
  );
}
