import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Bike as BikeIcon, 
  AlertTriangle, 
  Send, 
  MapPin, 
  CheckCircle2, 
  PhoneCall, 
  EyeOff, 
  Lock
} from 'lucide-react';
import { fetchVehicleQrTagApi, submitQrContactRequestApi } from '../services/ecosystemApi';
import type { VehicleQrTag, QrContactRequest } from '../types/app';

export function VehicleQrPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [tagData, setTagData] = useState<VehicleQrTag | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [requestType, setRequestType] = useState<QrContactRequest['requestType']>('PARKED_OBSTRUCTION');
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [message, setMessage] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedAlert, setSubmittedAlert] = useState<QrContactRequest | null>(null);

  useEffect(() => {
    async function loadTag() {
      if (!token) {
        setError('No vehicle QR tag token provided.');
        setLoading(false);
        return;
      }

      try {
        const data = await fetchVehicleQrTagApi(token);
        if (data && data.isActive) {
          setTagData(data);
        } else {
          setError('This vehicle QR tag is inactive or has been revoked by the owner.');
        }
      } catch {
        setError('Unable to load vehicle tag. Please verify your connection.');
      } finally {
        setLoading(false);
      }
    }

    loadTag();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !message.trim()) return;

    setSubmitting(true);
    try {
      const res = await submitQrContactRequestApi(token, {
        requestType,
        senderName: senderName || undefined,
        senderPhone: senderPhone || undefined,
        message: message.trim(),
        locationPin: locationAddress ? {
          lat: 26.7412,
          lng: 88.4285,
          address: locationAddress
        } : undefined
      });

      if (res) {
        setSubmittedAlert(res);
      }
    } catch {
      alert('Failed to transmit message to owner. Please try again or dial 112 if this is a severe emergency.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#151515] text-white flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#FFF174] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-400">Verifying secure vehicle token...</p>
        </div>
      </div>
    );
  }

  if (error || !tagData) {
    return (
      <div className="min-h-screen bg-[#151515] text-white flex items-center justify-center p-4">
        <div className="bg-[#1D1D1D] border border-white/10 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
            <AlertTriangle size={28} />
          </div>
          <h2 className="text-xl font-black text-white">QR Tag Inactive</h2>
          <p className="text-xs text-[#C5C5C5] leading-relaxed">
            {error || 'This vehicle emergency tag has been revoked by the owner or does not exist.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/15"
          >
            Back to MotoAssist Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#151515] text-white pt-16 pb-24 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-6">

        {/* Tag Header Bar */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF174]/15 border border-[#FFF174]/30 text-[#FFF174] text-[11px] font-black uppercase tracking-wider">
            <Lock size={12} />
            <span>MOTOASSIST VERIFIED VEHICLE TAG</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{tagData.vehicleNickname}</h1>
          <p className="text-xs text-gray-400">
            Official emergency contact beacon registered on MotoAssist network.
          </p>
        </div>

        {/* Motorcycle Identification Card */}
        <div className="bg-[#1D1D1D] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FFF174]">
                <BikeIcon size={24} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider block">MOTORCYCLE</span>
                <h3 className="text-lg font-black text-white">{tagData.brand} {tagData.model}</h3>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider block">REGISTRATION PLATE</span>
              <span className="px-3 py-1 rounded-lg bg-black border border-white/20 font-mono font-black text-xs text-[#FFF174] tracking-wider inline-block">
                {tagData.registrationNumber}
              </span>
            </div>
          </div>

          {/* Owner Emergency Instructions */}
          {tagData.emergencyInstructions && (
            <div className="p-3.5 bg-white/5 border border-white/5 rounded-2xl space-y-1 text-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#FFF174] block">OWNER EMERGENCY GUIDANCE</span>
              <p className="text-gray-200 text-xs leading-relaxed italic">
                "{tagData.emergencyInstructions}"
              </p>
            </div>
          )}

          {/* Privacy Guarantee Banner */}
          <div className="flex items-start gap-2.5 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300">
            <EyeOff size={16} className="shrink-0 mt-0.5" />
            <span className="text-[11px] leading-relaxed">
              <strong>Owner Privacy Protected:</strong> The rider's personal phone number and home address are kept private. Your message will be instantly transmitted to their device without exposing their contact information.
            </span>
          </div>
        </div>

        {/* Contact Owner Form */}
        {!submittedAlert ? (
          <div className="bg-[#1D1D1D] border border-white/10 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FFF174]">SEND SECURE ALERT</span>
              <h2 className="text-xl font-black text-white">Notify the Motorcycle Owner</h2>
              <p className="text-xs text-gray-400">
                Found an issue with this parked motorcycle or witnessing an emergency? Send an instant notification.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Category of Alert */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300 block">Select Issue Category</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'PARKED_OBSTRUCTION', label: 'Blocking Gate / Driveway' },
                    { id: 'LIGHTS_ON', label: 'Headlights Left ON' },
                    { id: 'VEHICLE_TIPPED', label: 'Bike Tipped / Damaged' },
                    { id: 'ACCIDENT_EMERGENCY', label: 'Accident / Emergency' }
                  ].map(cat => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setRequestType(cat.id as any)}
                      className={`p-2.5 rounded-xl text-left font-bold transition-all border ${
                        requestType === cat.id
                          ? 'bg-[#FFF174] text-black border-[#FFF174]'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Details */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300 block">Message Details</label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe where the bike is located and what is happening (e.g. parked near shop gate, keys in lock, hazard lights flashing)..."
                  className="w-full bg-[#252525] border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#FFF174] focus:outline-none"
                  required
                />
              </div>

              {/* Location Landmark */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300 block">Your Current Location / Landmark (Optional)</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    placeholder="e.g. Near City Center Gate 3, Sevoke Road"
                    className="w-full bg-[#252525] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:border-[#FFF174] focus:outline-none"
                  />
                </div>
              </div>

              {/* Optional Contact of Sender */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-400 block">Your Name (Optional)</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. Security Guard / Rider"
                    className="w-full bg-[#252525] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-400 block">Your Phone (Optional)</label>
                  <input
                    type="tel"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="e.g. +91 98320..."
                    className="w-full bg-[#252525] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-[#FFF174] text-black font-black text-xs hover:bg-yellow-400 active:scale-95 transition-all shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send size={15} />
                <span>{submitting ? 'Transmitting Alert...' : 'Send Secure Notification to Owner'}</span>
              </button>
            </form>
          </div>
        ) : (
          /* Success Screen */
          <div className="bg-[#1D1D1D] border border-emerald-500/30 rounded-3xl p-7 text-center space-y-4 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 size={30} />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">ALERT TRANSMITTED</span>
              <h3 className="text-xl font-black text-white">Owner Successfully Notified</h3>
              <p className="text-xs text-gray-300">
                A notification beacon has been transmitted to the motorcycle owner's dashboard with your message. Thank you for looking out for a fellow rider!
              </p>
            </div>

            <button
              onClick={() => setSubmittedAlert(null)}
              className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
            >
              Send Another Update
            </button>
          </div>
        )}

        {/* Emergency National Helpline Disclaimer */}
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-center space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-300 block">Severe Injury or Highway Accident?</span>
          <div className="flex items-center justify-center gap-3">
            <a
              href="tel:112"
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md"
            >
              <PhoneCall size={14} />
              <span>Call Emergency 112</span>
            </a>
            <a
              href="tel:18002100007"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-1.5 border border-white/10"
            >
              <PhoneCall size={14} />
              <span>MotoAssist 1800 2100 007</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
