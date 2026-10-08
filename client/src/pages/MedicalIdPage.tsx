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
  Loader2, 
  Share2, 
  Edit3, 
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchMedicalProfile, saveMedicalProfile } from '../services/ecosystemApi';
import type { MedicalProfile, MedicalSharingPreference } from '../types/app';
import { MountainBackground } from '../components/graphics';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN'] as const;

export function MedicalIdPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const [fullName, setFullName] = useState('');
  const [bloodGroup, setBloodGroup] = useState<typeof BLOOD_GROUPS[number]>('B+');
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
        setFullName(profile.fullName || user?.name || 'Pulasta Sen');
        setBloodGroup((profile.bloodGroup as typeof BLOOD_GROUPS[number]) || 'B+');
        setAllergiesText(profile.allergies?.join(', ') || 'None declared');
        setMedicationsText(profile.medications?.join(', ') || 'None');
        setConditionsText(profile.medicalConditions?.join(', ') || 'None');
        setEmergencyNotes(profile.emergencyNotes || 'Emergency medical data for first responders');
        setOrganDonor(profile.organDonor !== undefined ? profile.organDonor : true);
        setDoctorName(profile.doctorName || 'Dr. D. Sen');
        setDoctorContact(profile.doctorContact || '+91 98765 99999');
        setPreferredHospital(profile.preferredHospital || 'Neotia Getwel Hospital, Siliguri');
        setSharingPreference(profile.sharingPreference || 'EMERGENCY_ONLY');
      } else {
        setFullName(user?.name || 'Pulasta Sen');
      }
      setLoading(false);
    });
  }, [user]);

  const handleShareId = async () => {
    const summary = `🚨 MOTOASSIST EMERGENCY MEDICAL ID\nRider: ${fullName}\nBlood Group: ${bloodGroup}\nOrgan Donor: ${organDonor ? 'Yes' : 'No'}\nAllergies: ${allergiesText}\nConditions: ${conditionsText}\nPreferred Hospital: ${preferredHospital}\nEmergency Doctor: ${doctorName} (${doctorContact})`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Emergency Medical ID - ${fullName}`,
          text: summary,
        });
        return;
      } catch {
        // Fallback to copy
      }
    }

    await navigator.clipboard.writeText(summary);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 3000);
  };

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
      setShowEditForm(false);
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
    <div className="min-h-screen bg-[#07090E] text-white pt-20 pb-28 font-sans selection:bg-red-500 selection:text-white">
      <div className="container mx-auto px-4 max-w-xl">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <Lock size={12} /> Server Encrypted • HIPAA / ABDM
          </div>
        </div>

        {savedSuccess && (
          <div className="mb-4 p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span>Emergency Medical ID safely updated and encrypted.</span>
          </div>
        )}

        {/* ========================================================
            DIGITAL EMERGENCY MEDICAL CARD (Section 17 Requirement)
            ======================================================== */}
        <div className="relative rounded-[32px] bg-gradient-to-br from-[#1A1A1A] via-[#121212] to-[#0D0D0D] border-2 border-red-500/40 p-6 sm:p-7 shadow-[0_10px_40px_rgba(220,38,38,0.25)] overflow-hidden space-y-6">
          <MountainBackground opacity={0.12} height={120} />

          {/* Card Top Strip */}
          <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md">
                <Heart size={18} />
              </span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-red-400 block">
                  DIGITAL CREDENTIAL
                </span>
                <strong className="text-sm font-black text-white tracking-wide">
                  EMERGENCY ID
                </strong>
              </div>
            </div>

            {/* Giant Blood Group Badge */}
            <div className="px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 text-white font-black text-lg tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.5)] border border-red-400/50 flex items-center gap-1.5">
              <span>🩸</span>
              <span>{bloodGroup}</span>
            </div>
          </div>

          {/* Rider Identity */}
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Rider Name</span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {fullName || 'Rider'}
              </h2>
            </div>
            {organDonor && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                <Check size={12} /> Organ Donor
              </span>
            )}
          </div>

          {/* Clinical Vital Rows */}
          <div className="relative z-10 grid grid-cols-2 gap-3 p-4 rounded-2xl bg-black/40 border border-white/10 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Allergies</span>
              <strong className="text-gray-200 mt-0.5 block truncate">
                {allergiesText || 'None reported'}
              </strong>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Conditions</span>
              <strong className="text-gray-200 mt-0.5 block truncate">
                {conditionsText || 'None reported'}
              </strong>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Emergency Doctor</span>
              <strong className="text-gray-200 mt-0.5 block truncate">
                {doctorName || 'Not specified'}
              </strong>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Preferred Trauma Care</span>
              <strong className="text-gray-200 mt-0.5 block truncate">
                {preferredHospital || 'Siliguri Trauma Center'}
              </strong>
            </div>
          </div>

          {/* Card Actions (Share & Toggle Edit) */}
          <div className="relative z-10 flex items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleShareId}
              className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              {copiedShare ? (
                <>
                  <Check size={16} />
                  <span>COPIED TO CLIPBOARD</span>
                </>
              ) : (
                <>
                  <Share2 size={16} />
                  <span>SHARE EMERGENCY ID</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowEditForm(!showEditForm)}
              className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-gray-200 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit3 size={15} />
              <span>{showEditForm ? 'Hide Form' : 'Edit'}</span>
            </button>
          </div>
        </div>

        {/* Detailed Edit Form (Toggled or Editable) */}
        {showEditForm && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-6 animate-in fade-in">
            {/* Identity & Blood Group */}
            <div className="p-6 rounded-3xl bg-[#111622] border border-white/10 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <User size={14} className="text-[#FFF174]" /> Rider Identity & Blood Group
              </h3>

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
                    Registered Organ Donor (signaled to trauma center)
                  </span>
                </label>
              </div>
            </div>

            {/* Medical Details */}
            <div className="p-6 rounded-3xl bg-[#111622] border border-white/10 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <Pill size={14} className="text-[#FFF174]" /> Allergies & Clinical History
              </h3>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Allergies</label>
                <input
                  type="text"
                  value={allergiesText}
                  onChange={e => setAllergiesText(e.target.value)}
                  placeholder="e.g. Penicillin, NSAIDs, Sulfa, None"
                  className="w-full bg-[#182030] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Pre-existing Medical Conditions</label>
                <input
                  type="text"
                  value={conditionsText}
                  onChange={e => setConditionsText(e.target.value)}
                  placeholder="e.g. Asthma, Hypertension, Diabetes, None"
                  className="w-full bg-[#182030] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Critical Emergency Notes</label>
                <textarea
                  value={emergencyNotes}
                  onChange={e => setEmergencyNotes(e.target.value)}
                  placeholder="e.g. Contact spouse immediately. Metallic plate in left wrist."
                  rows={2}
                  className="w-full bg-[#182030] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Hospital & Doctor Contact */}
            <div className="p-6 rounded-3xl bg-[#111622] border border-white/10 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <Hospital size={14} className="text-[#FFF174]" /> Preferred Hospital & Doctor
              </h3>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Preferred Hospital / Clinic</label>
                <input
                  type="text"
                  value={preferredHospital}
                  onChange={e => setPreferredHospital(e.target.value)}
                  placeholder="e.g. Neotia Getwel Hospital, Siliguri"
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

            {/* Sharing Preference */}
            <div className="p-6 rounded-3xl bg-[#111622] border border-white/10 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <Shield size={14} className="text-[#FFF174]" /> Medical ID Sharing Policy
              </h3>
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
        )}
      </div>
    </div>
  );
}
