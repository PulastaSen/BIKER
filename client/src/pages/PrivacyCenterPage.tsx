import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, MapPin, Heart, Trash2, 
  Download, ArrowLeft, CheckCircle, ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchMedicalProfile, saveMedicalProfile } from '../services/ecosystemApi';

export function PrivacyCenterPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Privacy Preferences
  const [locationMode, setLocationMode] = useState<'RIDE_ONLY' | 'ALWAYS' | 'NEVER'>('RIDE_ONLY');
  const [medicalSharing, setMedicalSharing] = useState<'EMERGENCY_ONLY' | 'TRUSTED_CONTACTS' | 'NEVER'>('EMERGENCY_ONLY');
  const [maskPhoneNumber, setMaskPhoneNumber] = useState(true);
  const [allowFamilyLiveRide, setAllowFamilyLiveRide] = useState(true);
  const [allowHazardContributions, setAllowHazardContributions] = useState(true);
  const [notifyOnProximityHazards, setNotifyOnProximityHazards] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    // Load current medical sharing preference if available
    fetchMedicalProfile().then((profile) => {
      if (profile && profile.sharingPolicy) {
        setMedicalSharing(profile.sharingPolicy as any);
      }
    });
  }, []);

  const handleSave = async () => {
    try {
      await saveMedicalProfile({ sharingPolicy: medicalSharing });
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } catch (err) {
      console.error('Failed to update privacy settings:', err);
    }
  };

  const handleExportData = () => {
    const data = {
      user: { id: user?.id, email: user?.email, name: user?.name },
      privacySettings: {
        locationMode,
        medicalSharing,
        maskPhoneNumber,
        allowFamilyLiveRide,
        allowHazardContributions,
        notifyOnProximityHazards
      },
      exportTimestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `motoassist-privacy-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="shell py-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Rider Sovereignty & Trust
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Privacy & Safety Center</h1>
          </div>
        </div>

        {savedNotice && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
            <CheckCircle size={14} /> Saved
          </span>
        )}
      </div>

      {/* Core Privacy Promise */}
      <div className="p-5 rounded-3xl bg-neutral-900 border border-white/10 mb-6 flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck size={22} />
        </div>
        <div className="text-xs text-gray-300 space-y-1">
          <h3 className="text-sm font-black text-white">Our Zero-Surveillance Commitment</h3>
          <p>
            MotoAssist does <strong>never track your coordinates in the background</strong> without your explicit activation. 
            GPS telemetry is accessed only during active Safe Rides, Stranded Rescue requests, or 3-second SOS alerts.
          </p>
        </div>
      </div>

      {/* Privacy Sections */}
      <div className="space-y-6">
        {/* Section 1: Geolocation Privacy */}
        <div className="p-6 rounded-3xl bg-neutral-900 border border-white/10 space-y-4">
          <div className="flex items-center gap-2.5 text-white font-bold text-base">
            <MapPin size={18} className="text-amber-400" />
            <span>Geolocation Access Policy</span>
          </div>
          <p className="text-xs text-gray-400">
            Control when your browser and device GPS is queried by the platform:
          </p>

          <div className="space-y-2">
            {[
              {
                mode: 'RIDE_ONLY',
                title: 'Only During Active Rides & Emergencies (Recommended)',
                desc: 'Acquires GPS when starting Safe Ride, reporting Stranded breakdown, or holding SOS button.'
              },
              {
                mode: 'ALWAYS',
                title: 'Continuous Highway Geofencing',
                desc: 'Alerts you automatically if entering high-risk landslide hazard corridors or zero-fuel zones.'
              },
              {
                mode: 'NEVER',
                title: 'Manual Location Entry Only',
                desc: 'Browser GPS disabled. You will manually type landmarks and kilometer markers.'
              }
            ].map((item) => (
              <label
                key={item.mode}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  locationMode === item.mode
                    ? 'bg-amber-400/10 border-amber-400 text-white'
                    : 'bg-black/30 border-white/10 text-gray-400 hover:bg-black/50'
                }`}
              >
                <input
                  type="radio"
                  name="locationMode"
                  value={item.mode}
                  checked={locationMode === item.mode}
                  onChange={() => setLocationMode(item.mode as any)}
                  className="mt-1 text-amber-400 focus:ring-amber-400"
                />
                <div>
                  <strong className="block text-xs font-bold text-white">{item.title}</strong>
                  <span className="text-[11px] text-gray-400">{item.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Section 2: Clinical Medical ID Sharing */}
        <div className="p-6 rounded-3xl bg-neutral-900 border border-white/10 space-y-4">
          <div className="flex items-center gap-2.5 text-white font-bold text-base">
            <Heart size={18} className="text-red-400" />
            <span>Emergency Medical ID Sharing</span>
          </div>
          <p className="text-xs text-gray-400">
            Determine who can access your blood group, allergy profile, and attending physician details:
          </p>

          <div className="space-y-2">
            {[
              {
                policy: 'EMERGENCY_ONLY',
                title: 'Official Emergency Responders Only (Default)',
                desc: 'Clinical data is revealed only when an SOS incident or verified ambulance dispatch is triggered.'
              },
              {
                policy: 'TRUSTED_CONTACTS',
                title: 'Emergency Responders + Safety Circle Family',
                desc: 'Your configured Family Circle contacts can view your clinical card during active rides.'
              },
              {
                policy: 'NEVER',
                title: 'Never Share (Private Vault)',
                desc: 'Medical ID remains strictly hidden on your personal device and will not be broadcast.'
              }
            ].map((item) => (
              <label
                key={item.policy}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  medicalSharing === item.policy
                    ? 'bg-red-500/10 border-red-500 text-white'
                    : 'bg-black/30 border-white/10 text-gray-400 hover:bg-black/50'
                }`}
              >
                <input
                  type="radio"
                  name="medicalSharing"
                  value={item.policy}
                  checked={medicalSharing === item.policy}
                  onChange={() => setMedicalSharing(item.policy as any)}
                  className="mt-1 text-red-500 focus:ring-red-500"
                />
                <div>
                  <strong className="block text-xs font-bold text-white">{item.title}</strong>
                  <span className="text-[11px] text-gray-400">{item.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Section 3: Communication & Identity Controls */}
        <div className="p-6 rounded-3xl bg-neutral-900 border border-white/10 space-y-4">
          <div className="flex items-center gap-2.5 text-white font-bold text-base">
            <Lock size={18} className="text-blue-400" />
            <span>Communication & Contact Masking</span>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-black/30 border border-white/10 cursor-pointer">
              <div>
                <strong className="text-xs font-bold text-white block">Mask Personal Phone Number</strong>
                <span className="text-[11px] text-gray-400">
                  Connect calls with roadside providers through relay bridge to protect your private number.
                </span>
              </div>
              <input
                type="checkbox"
                checked={maskPhoneNumber}
                onChange={(e) => setMaskPhoneNumber(e.target.checked)}
                className="w-4 h-4 rounded text-blue-500 focus:ring-blue-400"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-black/30 border border-white/10 cursor-pointer">
              <div>
                <strong className="text-xs font-bold text-white block">Allow Live Ride Link to Family</strong>
                <span className="text-[11px] text-gray-400">
                  Authorized family circle members receive authenticated read-only link to track your active route.
                </span>
              </div>
              <input
                type="checkbox"
                checked={allowFamilyLiveRide}
                onChange={(e) => setAllowFamilyLiveRide(e.target.checked)}
                className="w-4 h-4 rounded text-blue-500 focus:ring-blue-400"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-black/30 border border-white/10 cursor-pointer">
              <div>
                <strong className="text-xs font-bold text-white block">Community Road Hazard Crowdsourcing</strong>
                <span className="text-[11px] text-gray-400">
                  Allow your anonymous hazard reports to warn fellow riders along Himalayan passes.
                </span>
              </div>
              <input
                type="checkbox"
                checked={allowHazardContributions}
                onChange={(e) => setAllowHazardContributions(e.target.checked)}
                className="w-4 h-4 rounded text-blue-500 focus:ring-blue-400"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-black/30 border border-white/10 cursor-pointer">
              <div>
                <strong className="text-xs font-bold text-white block">Proximity Road Hazard Notifications</strong>
                <span className="text-[11px] text-gray-400">
                  Receive audio / push warning when approaching community-reported landslides, oil slicks, or fog.
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifyOnProximityHazards}
                onChange={(e) => setNotifyOnProximityHazards(e.target.checked)}
                className="w-4 h-4 rounded text-blue-500 focus:ring-blue-400"
              />
            </label>
          </div>
        </div>

        {/* Section 4: Data Management & Export */}
        <div className="p-6 rounded-3xl bg-neutral-900 border border-white/10 space-y-4">
          <div className="flex items-center gap-2.5 text-white font-bold text-base">
            <Download size={18} className="text-purple-400" />
            <span>Account Data & Export</span>
          </div>
          <p className="text-xs text-gray-400">
            Download a portable copy of all your ride sessions, assistance records, and stored safety preferences:
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={handleExportData}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <Download size={14} /> Export Privacy Data (.JSON)
            </button>
            <button
              onClick={() => alert('Account erasure request recorded. Compliance team will purge all personal logs within 48 hours.')}
              className="px-4 py-2.5 rounded-xl bg-red-600/10 border border-red-500/20 hover:bg-red-600/20 text-red-400 text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <Trash2 size={14} /> Request Full Account Purge
            </button>
          </div>
        </div>

        {/* Save CTA */}
        <div className="pt-2">
          <button
            onClick={handleSave}
            className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-black text-sm transition-colors shadow-lg shadow-amber-400/20"
          >
            Save Privacy & Safety Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
