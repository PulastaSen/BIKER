import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Bike as BikeIcon, 
  Heart, 
  Users, 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2,
  Check,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getBikes, saveBike, addUser } from '../utils/appStorage';
import { fetchMedicalProfile, saveMedicalProfile, fetchFamilyCircle, addFamilyMember, removeFamilyMember } from '../services/ecosystemApi';
import type { Bike, MedicalProfile, FamilyMember } from '../types/app';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN'] as const;

export function SafetyProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Personal
  const [name, setName] = useState(user?.name || 'Pulasta Sen');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');

  // Bike
  const [bikeBrand, setBikeBrand] = useState('KTM');
  const [bikeModel, setBikeModel] = useState('Adventure 250');
  const [bikeReg, setBikeReg] = useState('WB-74-AX-1024');

  // Medical
  const [bloodGroup, setBloodGroup] = useState<typeof BLOOD_GROUPS[number]>('B+');
  const [allergies, setAllergies] = useState('None declared');
  const [criticalInfo, setCriticalInfo] = useState('No pre-existing critical conditions');

  // Family Contacts
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRel, setNewContactRel] = useState<'PARENT' | 'PARTNER' | 'FRIEND' | 'SIBLING'>('PARENT');

  // Safety Preferences
  const [shareLocationAuto, setShareLocationAuto] = useState(true);
  const [autoEscalate112, setAutoEscalate112] = useState(false);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    // Load bikes
    const bikes = getBikes();
    if (bikes.length > 0) {
      setBikeBrand(bikes[0].brand);
      setBikeModel(bikes[0].model);
      setBikeReg(bikes[0].registrationNumber);
    }

    // Load medical
    fetchMedicalProfile().then((med) => {
      if (med) {
        if (med.bloodGroup) setBloodGroup(med.bloodGroup as typeof BLOOD_GROUPS[number]);
        if (med.allergies && med.allergies.length > 0) setAllergies(med.allergies.join(', '));
        if (med.emergencyNotes) setCriticalInfo(med.emergencyNotes);
      }
    });

    // Load family
    fetchFamilyCircle().then((members) => {
      if (members && members.length > 0) {
        setFamilyMembers(members);
      } else {
        // Default initial circle if empty
        setFamilyMembers([
          {
            id: 'fam-1',
            userId: 'rider-1',
            name: 'Mom',
            relationship: 'PARENT',
            phone: '+91 98765 11111',
            canViewLiveRide: true,
            notifyOnSOS: true,
            notifyOnSafetyTimer: true,
            createdAt: new Date().toISOString()
          },
          {
            id: 'fam-2',
            userId: 'rider-1',
            name: 'Dad',
            relationship: 'PARENT',
            phone: '+91 98765 22222',
            canViewLiveRide: true,
            notifyOnSOS: true,
            notifyOnSafetyTimer: true,
            createdAt: new Date().toISOString()
          },
          {
            id: 'fam-3',
            userId: 'rider-1',
            name: 'Partner',
            relationship: 'PARTNER',
            phone: '+91 98765 33333',
            canViewLiveRide: true,
            notifyOnSOS: true,
            notifyOnSafetyTimer: true,
            createdAt: new Date().toISOString()
          }
        ]);
      }
    });

    // Load safety preferences
    const prefs = localStorage.getItem('safety_profile_prefs');
    if (prefs) {
      try {
        const parsed = JSON.parse(prefs);
        if (parsed.shareLocationAuto !== undefined) setShareLocationAuto(parsed.shareLocationAuto);
        if (parsed.autoEscalate112 !== undefined) setAutoEscalate112(parsed.autoEscalate112);
      } catch {
        // ignore
      }
    }
  }, []);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    const newMem = await addFamilyMember({
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      relationship: newContactRel,
      notifyOnSOS: true,
      canViewLiveRide: true
    });

    if (newMem) {
      setFamilyMembers((prev) => [...prev, newMem]);
    } else {
      const fallbackMember: FamilyMember = {
        id: `fam-${Date.now()}`,
        userId: 'rider-1',
        name: newContactName.trim(),
        phone: newContactPhone.trim(),
        relationship: newContactRel,
        canViewLiveRide: true,
        notifyOnSOS: true,
        notifyOnSafetyTimer: true,
        createdAt: new Date().toISOString()
      };
      setFamilyMembers((prev) => [...prev, fallbackMember]);
    }

    setNewContactName('');
    setNewContactPhone('');
  };

  const handleRemoveContact = async (id: string) => {
    await removeFamilyMember(id);
    setFamilyMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // 1. Personal
    if (user) {
      addUser({ ...user, name, phone });
    }

    // 2. Bike
    const bikes = getBikes();
    const primaryBike: Bike = bikes.length > 0
      ? { ...bikes[0], brand: bikeBrand, model: bikeModel, registrationNumber: bikeReg }
      : {
          id: 'bike-primary',
          userId: user?.id || 'guest-rider',
          brand: bikeBrand,
          model: bikeModel,
          registrationNumber: bikeReg,
          year: 2023,
          fuelType: 'PETROL',
          isPrimary: true
        };
    saveBike(primaryBike);

    // 3. Medical
    const medPayload: Partial<MedicalProfile> = {
      fullName: name,
      bloodGroup,
      allergies: allergies.split(',').map((s) => s.trim()).filter(Boolean),
      emergencyNotes: criticalInfo
    };
    await saveMedicalProfile(medPayload);

    // 4. Preferences
    localStorage.setItem(
      'safety_profile_prefs',
      JSON.stringify({ shareLocationAuto, autoEscalate112 })
    );

    setSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white pt-4 pb-24 md:pb-16 font-sans selection:bg-[#FFF174] selection:text-black">
      <div className="container mx-auto px-4 max-w-xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
          <span className="text-xs font-bold text-[#FFF174] bg-[#FFF174]/10 px-2.5 py-0.5 rounded-full border border-[#FFF174]/20">
            ONE-TIME CONFIGURATION
          </span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            My Safety Profile
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Configured once. When you press SOS, MotoAssist already knows who you are, your bike, your contacts, and medical data.
          </p>
        </div>

        {savedSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
            <Check size={16} />
            <span>Safety profile saved! Ready for 1-tap emergency rescue.</span>
          </div>
        )}

        <form onSubmit={handleSaveAll} className="space-y-6">
          
          {/* 1. PERSONAL INFORMATION */}
          <section className="p-4 sm:p-5 rounded-3xl bg-[#121212] border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-white">
              <User size={18} className="text-[#FFF174]" />
              <h2 className="text-sm font-bold uppercase tracking-wider">1. Personal Information</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Rider Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FFF174]"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FFF174]"
                  required
                />
              </div>
            </div>
          </section>

          {/* 2. MY BIKE */}
          <section className="p-4 sm:p-5 rounded-3xl bg-[#121212] border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-white">
              <BikeIcon size={18} className="text-emerald-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider">2. My Motorcycle</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Brand</label>
                <input
                  type="text"
                  value={bikeBrand}
                  onChange={(e) => setBikeBrand(e.target.value)}
                  placeholder="e.g. KTM, Royal Enfield"
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FFF174]"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Model</label>
                <input
                  type="text"
                  value={bikeModel}
                  onChange={(e) => setBikeModel(e.target.value)}
                  placeholder="e.g. Adventure 250"
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FFF174]"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-gray-400 mb-1 font-semibold">Registration Number</label>
                <input
                  type="text"
                  value={bikeReg}
                  onChange={(e) => setBikeReg(e.target.value)}
                  placeholder="e.g. WB-74-AX-1024"
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FFF174]"
                  required
                />
              </div>
            </div>
          </section>

          {/* 3. EMERGENCY CONTACTS (SAFETY CIRCLE) */}
          <section className="p-4 sm:p-5 rounded-3xl bg-[#121212] border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-blue-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider">3. Emergency Contacts</h2>
              </div>
              <span className="text-[10px] text-gray-400">External SMS / WhatsApp</span>
            </div>

            <p className="text-[11px] text-gray-400">
              Family members do NOT need the MotoAssist app to receive emergency alerts.
            </p>

            <div className="space-y-2">
              {familyMembers.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10 text-xs"
                >
                  <div>
                    <strong className="text-white block font-bold">{m.name} ({m.relationship})</strong>
                    <span className="text-gray-400 text-[11px]">{m.phone}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveContact(m.id)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                    title="Remove contact"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Add Contact Form */}
            <div className="pt-2 border-t border-white/10">
              <span className="text-[11px] text-gray-400 font-semibold block mb-2">Add New Contact:</span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Name"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="bg-[#181818] border border-white/10 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-[#FFF174]"
                />
                <select
                  value={newContactRel}
                  onChange={(e) => setNewContactRel(e.target.value as 'PARENT' | 'PARTNER' | 'FRIEND' | 'SIBLING')}
                  className="bg-[#181818] border border-white/10 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-[#FFF174]"
                >
                  <option value="PARENT">Parent</option>
                  <option value="PARTNER">Partner</option>
                  <option value="SIBLING">Sibling</option>
                  <option value="FRIEND">Friend</option>
                </select>
                <input
                  type="tel"
                  placeholder="Phone"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  className="bg-[#181818] border border-white/10 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-[#FFF174]"
                />
                <button
                  type="button"
                  onClick={handleAddContact}
                  className="bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl px-2 py-2 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>
          </section>

          {/* 4. MEDICAL (EMERGENCY ID) */}
          <section className="p-4 sm:p-5 rounded-3xl bg-[#121212] border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-white">
              <Heart size={18} className="text-red-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider">4. Medical Emergency ID</h2>
            </div>
            <p className="text-[11px] text-gray-400">
              Only disclosed during active emergencies for first responders. Not exposed publicly.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Blood Group</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {BLOOD_GROUPS.map((bg) => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setBloodGroup(bg)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        bloodGroup === bg
                          ? 'bg-red-600/30 border-red-500 text-red-200'
                          : 'bg-[#181818] border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Known Allergies</label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Peanuts, None"
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FFF174]"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Critical Medical Information</label>
                <textarea
                  value={criticalInfo}
                  onChange={(e) => setCriticalInfo(e.target.value)}
                  rows={2}
                  placeholder="e.g. Asthma, Diabetic, Pacemaker, None"
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FFF174]"
                />
              </div>
            </div>
          </section>

          {/* 5. SAFETY & ESCALATION PREFERENCES */}
          <section className="p-4 sm:p-5 rounded-3xl bg-[#121212] border border-white/10 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-white">
              <ShieldAlert size={18} className="text-amber-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider">5. Safety & Escalation</h2>
            </div>

            <div className="space-y-2.5">
              <label className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10 cursor-pointer">
                <div>
                  <strong className="text-white block font-semibold">Auto-Share Location with Family on SOS</strong>
                  <span className="text-gray-400 text-[11px]">Generate direct WhatsApp/SMS link when SOS is triggered</span>
                </div>
                <input
                  type="checkbox"
                  checked={shareLocationAuto}
                  onChange={(e) => setShareLocationAuto(e.target.checked)}
                  className="w-4 h-4 accent-[#FFF174]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10 cursor-pointer">
                <div>
                  <strong className="text-white block font-semibold">Offer 112 Auto-Dial Prompt</strong>
                  <span className="text-gray-400 text-[11px]">Prompt immediate National Police SOS if unconfirmed after 60s</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoEscalate112}
                  onChange={(e) => setAutoEscalate112(e.target.checked)}
                  className="w-4 h-4 accent-[#FFF174]"
                />
              </label>
            </div>
          </section>

          {/* SUBMIT BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 rounded-2xl bg-[#FFF174] hover:bg-yellow-400 active:scale-98 text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#FFF174]/15"
            >
              <Save size={18} />
              <span>{saving ? 'Saving Safety Profile...' : 'Save Safety Profile'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
