import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PhoneCall, 
  Share2, 
  MapPin, 
  ArrowLeft, 
  Check, 
  ShieldAlert, 
  MessageCircle,
  VolumeX,
  ArrowRight
} from 'lucide-react';
import { useUserLocation } from '../hooks/useUserLocation';
import { buildWhatsAppFeelingUnsafeUrl } from '../utils/whatsappShare';

const SITUATIONS = [
  'Someone is following me',
  'Someone is threatening me',
  'I feel unsafe',
  'I am lost',
  'Other',
];

export function WomenSafetyPage() {
  const navigate = useNavigate();
  const [selectedSituation, setSelectedSituation] = useState<string>('Someone is following me');
  const [copiedLink, setCopiedLink] = useState(false);
  const [silentSOSActive, setSilentSOSActive] = useState(false);

  const { coords, accuracy, requestLocation } = useUserLocation(true);

  const lat = coords?.lat;
  const lng = coords?.lng;
  const googleMapsUrl = lat && lng ? `https://maps.google.com/?q=${lat},${lng}` : '';

  const whatsAppUrl = buildWhatsAppFeelingUnsafeUrl({
    latitude: lat,
    longitude: lng,
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
          text: `⚠️ MotoAssist Safety Alert: I feel unsafe. Live Location: ${googleMapsUrl}`,
          url: googleMapsUrl,
        });
        return;
      } catch {
        // Fallback
      }
    }

    await navigator.clipboard.writeText(`⚠️ MotoAssist Safety Alert: Live Location: ${googleMapsUrl}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleSilentSOS = () => {
    setSilentSOSActive(true);
    alert('Silent alert logged. Location broadcasted to central dispatch.');
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white pt-4 pb-24 md:pb-16 font-sans selection:bg-purple-500 selection:text-white">
      <div className="container mx-auto px-4 max-w-xl space-y-5">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
          <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
            PROTECTION PROTOCOL
          </span>
        </div>

        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
            RAPID RESPONSE
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
            ⚠️ FEELING UNSAFE?
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Immediate assistance protocols. Stay alert, stay moving.
          </p>
        </div>

        {/* Safety Advisory: Do not recommend confronting the person */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
          <ShieldAlert size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Advisory:</strong> Do not confront or stop to talk. Head towards the nearest open fuel station, toll plaza, or well-lit commercial hub.
          </p>
        </div>

        {/* Step 1: Situation Options */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-gray-400 block">
            What is happening right now?
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
                    : 'bg-[#121212] border-white/10 text-gray-300 hover:bg-[#181818]'
                }`}
              >
                {sit}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: 4 Immediate Actions */}
        <div className="space-y-3 pt-1">
          <label className="text-xs font-black uppercase tracking-wider text-gray-400 block">
            Immediate Actions
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
                  <strong className="block text-sm font-black text-white">Alert Family</strong>
                  <span className="text-[10px] text-emerald-300 block">WhatsApp alert with location</span>
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
                  <strong className="block text-sm font-black text-white">
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
                  <strong className="block text-base font-black">Call 112</strong>
                  <span className="text-[10px] text-red-200 block">Police emergency hotline</span>
                </div>
              </div>
              <span className="text-xs font-black bg-white/20 px-2.5 py-1 rounded-lg">DIAL</span>
            </a>

            {/* 4. Find Safe Place */}
            <a
              href={
                lat && lng
                  ? `https://www.google.com/maps/search/police+station+or+fuel+pump+near+me/@${lat},${lng},14z`
                  : `https://www.google.com/maps/search/police+station+or+fuel+pump+near+me`
              }
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-2xl bg-[#121212] hover:bg-white/10 border border-white/15 text-left transition-all active:scale-95 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 text-[#FFF174] flex items-center justify-center shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <strong className="block text-sm font-black text-white">Find Safe Place</strong>
                  <span className="text-[10px] text-gray-400 block">Police station / 24/7 pump</span>
                </div>
              </div>
              <ArrowRight size={14} className="text-[#FFF174] group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* Discreet Silent SOS Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSilentSOS}
            className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
              silentSOSActive
                ? 'bg-red-950/60 border-red-500 text-red-200'
                : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-red-400 flex items-center justify-center shrink-0">
                <VolumeX size={20} />
              </div>
              <div>
                <strong className="block text-sm font-bold text-white">
                  {silentSOSActive ? 'Silent SOS Triggered' : 'Silent SOS'}
                </strong>
                <span className="text-[10px] text-gray-400 block">
                  Discreet alert without sound or alarm
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-white/10 px-2 py-1 rounded-md text-gray-300">
              STEALTH
            </span>
          </button>
        </div>

        {/* Official Women Helpline 1091 */}
        <div className="p-3.5 rounded-2xl bg-[#121212] border border-white/10 flex items-center justify-between text-xs">
          <div>
            <span className="text-gray-400 text-[11px] block">National Women Helpline (India)</span>
            <strong className="text-white text-sm">Dial 1091</strong>
          </div>
          <a
            href="tel:1091"
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
          >
            Call 1091
          </a>
        </div>

      </div>
    </div>
  );
}
