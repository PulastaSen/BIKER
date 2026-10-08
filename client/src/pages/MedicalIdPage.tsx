import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Shield,
  Lock, 
  CheckCircle2, 
  Hospital, 
  User, 
  Pill, 
  Save,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchMedicalProfile, saveMedicalProfile } from '../services/ecosystemApi';
import type { MedicalProfile, MedicalSharingPreference } from '../types/app';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN'] as const;

export function MedicalIdPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [fullName, setFullName] = useState('');
  const [bloodGroup, setBloodGroup] = useState<typeof BLOOD_GROUPS[number]>('O+');
  const [allergiesText, setAllergiesText] = useState('');
  const [medicationsText, setMedicationsText] = useState('');
  const [conditionsText, setConditionsText] = useState('');
  const [emergencyNotes, setEmergencyNotes] = useState('');
  const [organDonor, setOrganDonor] = useState(true);
  const [doctorName, setDoctorName] = useState('');
  const [doctorContact, setDoctorContact] = useState('');
  const [preferredHospital, setPreferredHospital] = useState('');
  const [sharingPreference, setSharingPreference] = useState<MedicalSharingPreference>('EMERGENCY_ONLY');

  useEffect(() => {
    fetchMedicalProfile().then(profile => {
      if (profile) {
        setFullName(profile.fullName || user?.name || '');
        setBloodGroup(profile.bloodGroup || 'O+');
        setAllergiesText(profile.allergies?.join(', ') || '');
        setMedicationsText(profile.medications?.join(', ') || '');
        setConditionsText(profile.medicalConditions?.join(', ') || '');
        setEmergencyNotes(profile.emergencyNotes || '');
        setOrganDonor(!!profile.organDonor);
        setDoctorName(profile.doctorName || '');
        setDoctorContact(profile.doctorContact || '');
        setPreferredHospital(profile.preferredHospital || '');
        setSharingPreference(profile.sharingPreference || 'EMERGENCY_ONLY');
      } else {
        setFullName(user?.name || '');
      }
      setLoading(false);
    });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    const payload: Partial<MedicalProfile> = {
      fullName,
      bloodGroup,
      allergies: allergiesText.split(',').map(s => s.trim()).filter(Boolean),
      medications: medicationsText.split(',').map(s => s.trim()).filter(Boolean),
      medicalConditions: conditionsText.split(',').map(s => s.trim()).filter(Boolean),
      emergencyNotes,
      organDonor,
      doctorName,
      doctorContact,
      preferredHospital,
      sharingPreference,
      shareWithEmergencyResponders: sharingPreference !== 'NEVER'
    };

    const res = await saveMedicalProfile(payload);
    setSaving(false);
    if (res) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } else {
      alert('Failed to update medical profile on secure server.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090E] flex items-center justify-center text-white">
        <Loader2 size={32} className="animate-spin text-[#FFF174]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-white pt-20 pb-24 font-sans selection:bg-red-500 selection:text-white">
      <div className="container mx-auto px-4 max-w-2xl">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <Lock size={12} /> Server Encrypted (Zero localStorage Leak)
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center shrink-0">
            <Heart size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">MY EMERGENCY ID</h1>
            <p className="text-gray-400 text-xs mt-0.5">
              Crucial medical data accessed only by emergency services during crash or severe roadside incident.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span>Emergency ID safely encrypted and saved on MotoAssist secure servers.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Identity & Blood Group */}
          <div className="p-6 rounded-3xl bg-[#111622] border border-white/10 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <User size={14} className="text-[#FFF174]" /> Rider Identity & Blood Group
            </h2>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Rider's full name"
                className="w-full bg-[#182030] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-2">Blood Group</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {BLOOD_GROUPS.map(bg => (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => setBloodGroup(bg)}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                      bloodGroup === bg
                        ? 'bg-red-600 border-red-500 text-white shadow-lg'
                        : 'bg-[#182030] border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={organDonor}
                  onChange={e => setOrganDonor(e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 focus:ring-0 bg-[#182030] border-white/20"
                />
                <span className="text-xs font-semibold text-gray-300">
                  Registered Organ Donor (will be signaled to trauma center)
                </span>
              </label>
            </div>
          </div>

          {/* Medical Details */}
          <div className="p-6 rounded-3xl bg-[#111622] border border-white/10 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Pill size={14} className="text-[#FFF174]" /> Allergies & Clinical History
            </h2>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Allergies (comma-separated)</label>
              <input
                type="text"
                value={allergiesText}
                onChange={e => setAllergiesText(e.target.value)}
                placeholder="e.g. Penicillin, NSAIDs, Sulfa, Latex"
                className="w-full bg-[#182030] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Current Medications (comma-separated)</label>
              <input
                type="text"
                value={medicationsText}
                onChange={e => setMedicationsText(e.target.value)}
                placeholder="e.g. Blood thinners, Asthma inhaler, Insulin"
                className="w-full bg-[#182030] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Pre-existing Medical Conditions</label>
              <input
                type="text"
                value={conditionsText}
                onChange={e => setConditionsText(e.target.value)}
                placeholder="e.g. Hypertension, Diabetes, Asthma, Epilepsy"
                className="w-full bg-[#182030] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Critical Emergency Notes for First Responders</label>
              <textarea
                value={emergencyNotes}
                onChange={e => setEmergencyNotes(e.target.value)}
                placeholder="e.g. Contact spouse immediately. Metallic plate in left wrist. Prefers Neotia Getwel Siliguri hospital."
                rows={3}
                className="w-full bg-[#182030] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Hospital & Doctor Contact */}
          <div className="p-6 rounded-3xl bg-[#111622] border border-white/10 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Hospital size={14} className="text-[#FFF174]" /> Preferred Hospital & Doctor
            </h2>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Preferred Hospital / Clinic</label>
              <input
                type="text"
                value={preferredHospital}
                onChange={e => setPreferredHospital(e.target.value)}
                placeholder="e.g. Neotia Getwel Healthcare Centre, Siliguri"
                className="w-full bg-[#182030] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Doctor Name</label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={e => setDoctorName(e.target.value)}
                  placeholder="e.g. Dr. D. Sen"
                  className="w-full bg-[#182030] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Doctor Phone</label>
                <input
                  type="text"
                  value={doctorContact}
                  onChange={e => setDoctorContact(e.target.value)}
                  placeholder="+91 98765 99999"
                  className="w-full bg-[#182030] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* Section 10: Explicit Sharing Controls */}
          <div className="p-6 rounded-3xl bg-[#111622] border border-white/10 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Shield size={14} className="text-[#FFF174]" /> Medical ID Sharing Policy
            </h2>
            <p className="text-xs text-gray-400">
              You maintain total authority over who can decrypt and view this medical information.
            </p>

            <div className="space-y-2">
              {[
                { key: 'EMERGENCY_ONLY', label: 'Emergency Only (Recommended)', desc: 'Decrypted solely during an active SOS broadcast or verified collision.' },
                { key: 'TRUSTED_CONTACTS', label: 'Trusted Contacts & Family', desc: 'Accessible by verified Family Circle members and emergency responders.' },
                { key: 'NEVER', label: 'Never Share Automatically', desc: 'Keep entirely private; only you can open this card on this device.' }
              ].map(opt => (
                <label
                  key={opt.key}
                  className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                    sharingPreference === opt.key
                      ? 'bg-red-500/10 border-red-500 text-white'
                      : 'bg-[#182030] border-white/10 text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="sharingPref"
                    value={opt.key}
                    checked={sharingPreference === opt.key}
                    onChange={() => setSharingPreference(opt.key as MedicalSharingPreference)}
                    className="mt-1 text-red-600 focus:ring-0"
                  />
                  <div>
                    <strong className="text-xs font-bold text-white block">{opt.label}</strong>
                    <span className="text-[11px] text-gray-400 block mt-0.5">{opt.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Encrypting & Saving...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Save Emergency Medical ID</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
