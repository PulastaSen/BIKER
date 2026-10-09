import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  ShieldAlert, 
  FileText, 
  Lock, 
  Calendar, 
  ShieldCheck, 
  ChevronRight, 
  Settings as SettingsIcon, 
  MapPin 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getBikes, saveBike, addUser } from '../utils/appStorage';
import { 
  fetchMedicalProfile, 
  saveMedicalProfile, 
  fetchFamilyCircle, 
  addFamilyMember, 
  removeFamilyMember, 
  fetchBikeDocuments,
  addBikeDocument,
  deleteBikeDocument
} from '../services/ecosystemApi';
import { getVerificationStatus, type VerificationRecord } from '../services/verificationApi';
import type { FamilyMember, RiderDocument, RiderDocumentType, FuelType } from '../types/app';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN'] as const;

const DOCUMENT_TYPE_LABELS: Record<RiderDocumentType, { label: string; primary?: boolean }> = {
  DRIVING_LICENSE: { label: 'Driving Licence (ID)', primary: true },
  RC: { label: 'Vehicle Registration (RC)' },
  INSURANCE: { label: 'Motorcycle Insurance' },
  PUC: { label: 'Pollution Under Control (PUC)' },
  GOVT_ID: { label: 'Government ID Proof' }
};

export function SafetyProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // 1. Personal Information
  const [name, setName] = useState(user?.name || 'Pulasta Sen');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [email, setEmail] = useState(user?.email || 'pulasta@example.com');
  const [emergencyNotes, setEmergencyNotes] = useState('Solo touring rider. Blood donor registered.');

  // 2. My Bike
  const [bikeBrand, setBikeBrand] = useState('KTM');
  const [bikeModel, setBikeModel] = useState('Adventure 250');
  const [bikeYear, setBikeYear] = useState('2023');
  const [bikeReg, setBikeReg] = useState('WB-74-AX-1024');
  const [fuelType, setFuelType] = useState<FuelType>('PETROL');

  // 3. Emergency Contacts
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRel, setNewContactRel] = useState<'PARENT' | 'PARTNER' | 'FRIEND' | 'SIBLING'>('PARENT');

  // 4. Medical ID
  const [bloodGroup, setBloodGroup] = useState<typeof BLOOD_GROUPS[number]>('B+');
  const [allergies, setAllergies] = useState('None declared');
  const [criticalInfo, setCriticalInfo] = useState('No pre-existing critical conditions');
  const [medications, setMedications] = useState('None');

  // 5. Verification & Documents
  const [verStatus, setVerStatus] = useState<VerificationRecord | null>(null);
  const [documents, setDocuments] = useState<RiderDocument[]>([]);
  const [newDocType, setNewDocType] = useState<RiderDocumentType>('RC');
  const [newDocNumber, setNewDocNumber] = useState('');
  const [newDocIssuer, setNewDocIssuer] = useState('');
  const [newDocExpiry, setNewDocExpiry] = useState('');

  // 6. Family Safety
  const [liveRideSharing, setLiveRideSharing] = useState(true);
  const [safetyTimerAlert, setSafetyTimerAlert] = useState(true);
  const [autoEscalate112, setAutoEscalate112] = useState(false);

  // 7. Privacy & Location
  const [shareLocationAuto, setShareLocationAuto] = useState(true);
  const [telemetryConsent, setTelemetryConsent] = useState(true);
  const [highAccuracyGps, setHighAccuracyGps] = useState(true);

  // 8. Settings
  const [commChannel, setCommChannel] = useState<'WHATSAPP' | 'SMS' | 'PHONE'>('WHATSAPP');
  const [soundAlerts, setSoundAlerts] = useState(true);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    // Load bikes
    const bikes = getBikes();
    if (bikes.length > 0) {
      setBikeBrand(bikes[0].brand);
      setBikeModel(bikes[0].model);
      setBikeReg(bikes[0].registrationNumber);
      if (bikes[0].year) setBikeYear(String(bikes[0].year));
      if (bikes[0].fuelType) setFuelType(bikes[0].fuelType);
    }

    // Load medical
    fetchMedicalProfile().then((med) => {
      if (med) {
        if (med.bloodGroup) setBloodGroup(med.bloodGroup as typeof BLOOD_GROUPS[number]);
        if (med.allergies && med.allergies.length > 0) setAllergies(med.allergies.join(', '));
        if (med.emergencyNotes) setCriticalInfo(med.emergencyNotes);
        if (med.medications && med.medications.length > 0) setMedications(med.medications.join(', '));
      }
    });

    // Load family
    fetchFamilyCircle().then((members) => {
      if (members && members.length > 0) {
        setFamilyMembers(members);
      } else {
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

    // Load verification status from backend
    getVerificationStatus().then((record) => {
      if (record) setVerStatus(record);
    });

    // Load vehicle documents
    fetchBikeDocuments('rider-personal').then((docs) => {
      if (docs && docs.length > 0) {
        setDocuments(docs as any);
      } else {
        setDocuments([
          {
            id: 'doc-rc-2',
            documentId: 'DOC-RC-002',
            docType: 'RC',
            documentNumber: 'WB-74-AX-1024',
            issuer: 'Transport Dept West Bengal',
            expiryDate: '2037-11-20',
            isVerified: true,
            verificationStatus: 'VERIFIED'
          },
          {
            id: 'doc-ins-3',
            documentId: 'DOC-INS-003',
            docType: 'INSURANCE',
            documentNumber: 'BA-2024-MOT-9912',
            issuer: 'Bajaj Allianz General Insurance',
            expiryDate: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            isVerified: true,
            verificationStatus: 'VERIFIED',
            isExpiringSoon: true
          }
        ]);
      }
    });

    // Load saved preferences
    const prefs = localStorage.getItem('safety_profile_prefs');
    if (prefs) {
      try {
        const parsed = JSON.parse(prefs);
        if (parsed.shareLocationAuto !== undefined) setShareLocationAuto(parsed.shareLocationAuto);
        if (parsed.autoEscalate112 !== undefined) setAutoEscalate112(parsed.autoEscalate112);
        if (parsed.commChannel) setCommChannel(parsed.commChannel);
        if (parsed.liveRideSharing !== undefined) setLiveRideSharing(parsed.liveRideSharing);
        if (parsed.safetyTimerAlert !== undefined) setSafetyTimerAlert(parsed.safetyTimerAlert);
        if (parsed.telemetryConsent !== undefined) setTelemetryConsent(parsed.telemetryConsent);
        if (parsed.highAccuracyGps !== undefined) setHighAccuracyGps(parsed.highAccuracyGps);
        if (parsed.soundAlerts !== undefined) setSoundAlerts(parsed.soundAlerts);
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

  // Vehicle Document Management
  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocNumber.trim()) return;

    const res = await addBikeDocument({
      bikeId: 'rider-personal',
      docType: newDocType,
      documentNumber: newDocNumber.trim(),
      issuer: newDocIssuer.trim() || undefined,
      expiryDate: newDocExpiry || undefined
    });

    const newDocObj: RiderDocument = {
      id: res?.documentId || `doc-${Date.now()}`,
      documentId: res?.documentId || `DOC-${Date.now()}`,
      docType: newDocType,
      documentNumber: newDocNumber.trim(),
      issuer: newDocIssuer.trim() || 'RTO/Insurer',
      expiryDate: newDocExpiry || undefined,
      verificationStatus: 'PENDING_REVIEW',
      isVerified: false
    };

    setDocuments((prev) => [...prev, newDocObj]);
    setNewDocNumber('');
    setNewDocIssuer('');
    setNewDocExpiry('');
  };

  const handleDeleteDocument = async (id: string) => {
    await deleteBikeDocument(id);
    setDocuments((prev) => prev.filter((d) => d.id !== id && d.documentId !== id));
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // 1. Personal & Bike
      addUser({
        id: user?.id || 'user-rider-1',
        name,
        email,
        phone,
        role: 'RIDER',
        createdAt: user?.createdAt || new Date().toISOString()
      });

      saveBike({
        id: 'primary-bike',
        userId: user?.id || 'user-rider-1',
        brand: bikeBrand,
        model: bikeModel,
        registrationNumber: bikeReg,
        year: parseInt(bikeYear, 10) || 2023,
        fuelType,
        isPrimary: true
      });

      // 4. Medical
      await saveMedicalProfile({
        bloodGroup,
        allergies: allergies.split(',').map((s) => s.trim()).filter(Boolean),
        medicalConditions: criticalInfo.split(',').map((s) => s.trim()).filter(Boolean),
        medications: medications.split(',').map((s) => s.trim()).filter(Boolean),
        emergencyNotes: `${emergencyNotes} | Notes: ${criticalInfo}`
      });

      // 6, 7, 8. Preferences
      localStorage.setItem('safety_profile_prefs', JSON.stringify({
        shareLocationAuto,
        autoEscalate112,
        commChannel,
        liveRideSharing,
        safetyTimerAlert,
        telemetryConsent,
        highAccuracyGps,
        soundAlerts
      }));

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white pt-6 pb-28 font-sans selection:bg-[#FFF174] selection:text-black">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* TOP BAR */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Home</span>
          </button>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full">
            ● Rider Safety Profile • 8 Groups
          </span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Rider Profile & Settings
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Configure your personal details, bike, emergency contacts, medical ID, verification, family safety, privacy and settings.
          </p>
        </div>

        {savedSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
            <Check size={16} />
            <span>Safety profile updated successfully! All emergency flows synchronized.</span>
          </div>
        )}

        <form onSubmit={handleSaveAll} className="space-y-6">
          
          {/* GROUP 1: PERSONAL INFORMATION */}
          <section className="p-4 sm:p-5 rounded-3xl bg-[#111111] border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-white">
              <User size={18} className="text-[#FFF174]" />
              <h2 className="text-sm font-bold uppercase tracking-wider">1. Personal Information</h2>
            </div>
            <p className="text-[11px] text-gray-400">Basic rider details used to identify you during emergency dispatches.</p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FFF174]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FFF174]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Rider Bio / Notes</label>
                <input
                  type="text"
                  value={emergencyNotes}
                  onChange={(e) => setEmergencyNotes(e.target.value)}
                  placeholder="e.g. Solo rider, Long-distance tourer"
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FFF174]"
                />
              </div>
            </div>
          </section>

          {/* GROUP 2: MY BIKE */}
          <section className="p-4 sm:p-5 rounded-3xl bg-[#111111] border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <BikeIcon size={18} className="text-emerald-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider">2. My Bike</h2>
              </div>
              <Link to="/save-my-bike" className="text-[11px] text-[#FFF174] hover:underline flex items-center gap-1">
                <span>Garage details</span>
                <ChevronRight size={13} />
              </Link>
            </div>
            <p className="text-[11px] text-gray-400">Your primary motorcycle specifications for accurate roadside dispatch and spare parts.</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Brand</label>
                <input
                  type="text"
                  value={bikeBrand}
                  onChange={(e) => setBikeBrand(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FFF174]"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Model</label>
                <input
                  type="text"
                  value={bikeModel}
                  onChange={(e) => setBikeModel(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FFF174]"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Year</label>
                <input
                  type="text"
                  value={bikeYear}
                  onChange={(e) => setBikeYear(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FFF174]"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Fuel Type</label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value as FuelType)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-[#FFF174]"
                >
                  <option value="PETROL">Petrol</option>
                  <option value="ELECTRIC">Electric (EV)</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>
            </div>

            <div className="text-xs">
              <label className="block text-gray-400 mb-1 font-semibold">Vehicle Plate / Registration Number</label>
              <input
                type="text"
                value={bikeReg}
                onChange={(e) => setBikeReg(e.target.value)}
                placeholder="e.g. WB-74-AX-1024"
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FFF174]"
                required
              />
            </div>
          </section>

          {/* GROUP 3: EMERGENCY CONTACTS */}
          <section className="p-4 sm:p-5 rounded-3xl bg-[#111111] border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-blue-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider">3. Emergency Contacts</h2>
              </div>
              <span className="text-[10px] text-gray-400">Direct WhatsApp / SMS</span>
            </div>
            <p className="text-[11px] text-gray-400">
              Trusted guardians alerted automatically when you trigger SOS. They do NOT need the MotoAssist app.
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

            {/* Quick Add Form */}
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

          {/* GROUP 4: MEDICAL ID */}
          <section className="p-4 sm:p-5 rounded-3xl bg-[#111111] border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Heart size={18} className="text-red-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider">4. Medical ID</h2>
              </div>
              <Link to="/medical-id" className="text-[11px] text-red-400 hover:underline flex items-center gap-1">
                <span>Full Card</span>
                <ChevronRight size={13} />
              </Link>
            </div>
            <p className="text-[11px] text-gray-400">
              Only shared with verified medical responders during an active emergency. Never disclosed publicly or to mechanics.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Blood Group</label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
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
                <label className="block text-gray-400 mb-1 font-semibold">Critical Medical Conditions</label>
                <textarea
                  value={criticalInfo}
                  onChange={(e) => setCriticalInfo(e.target.value)}
                  rows={2}
                  placeholder="e.g. Asthma, Diabetic, Pacemaker, None"
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FFF174]"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Current Medications</label>
                <input
                  type="text"
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  placeholder="e.g. Inhaler, Insulin, None"
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FFF174]"
                />
              </div>
            </div>
          </section>

          {/* GROUP 5: VERIFICATION & DOCUMENTS */}
          <section className="p-4 sm:p-5 rounded-3xl bg-[#111111] border border-white/10 space-y-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-cyan-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider">5. Verification & Documents</h2>
              </div>
              <span className="text-[10px] text-gray-400 flex items-center gap-1">
                <Lock size={12} className="text-emerald-400" /> Private & Protected
              </span>
            </div>

            {/* Direct Entry to Verification Center */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-blue-950/30 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-cyan-400" />
                  <strong className="text-xs font-bold text-white">Personal Identity & Face Verification</strong>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    verStatus?.status === 'VERIFIED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : verStatus?.status === 'UNDER_REVIEW'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-white/10 text-gray-300 border border-white/20'
                  }`}>
                    {verStatus?.status || 'NOT_STARTED'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 mt-1">
                  Upload your Driving Licence or Govt ID and complete camera face verification.
                </p>
              </div>

              <Link
                to="/rider/verification"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs shrink-0 transition-colors"
              >
                <span>Open Verification Center</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* Vehicle Documents (Separated from personal identity) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Vehicle Documents Wallet (RC, Insurance, PUC)</span>
                <span className="text-[10px] text-gray-500">Separated from Personal ID</span>
              </div>

              <div className="space-y-2">
                {documents.map((doc) => {
                  const isExpiring = doc.isExpiringSoon || (doc.expiryDate && new Date(doc.expiryDate).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000);
                  return (
                    <div
                      key={doc.id || doc.documentId}
                      className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <strong className="text-white block font-bold truncate">
                            {DOCUMENT_TYPE_LABELS[doc.docType]?.label || doc.docType}
                          </strong>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            doc.verificationStatus === 'VERIFIED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}>
                            {doc.verificationStatus === 'VERIFIED' ? '✓ Valid' : '● In review'}
                          </span>
                        </div>
                        <div className="text-gray-400 text-[11px] flex items-center gap-2">
                          <span>No: {doc.documentNumber}</span>
                          {doc.issuer && <span>• {doc.issuer}</span>}
                        </div>
                        {doc.expiryDate && (
                          <div className="flex items-center gap-1 text-[10px]">
                            <Calendar size={11} className={isExpiring ? 'text-amber-400' : 'text-gray-500'} />
                            <span className={isExpiring ? 'text-amber-300 font-bold' : 'text-gray-400'}>
                              Expires: {doc.expiryDate} {isExpiring && '(Expiring soon)'}
                            </span>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(doc.id || doc.documentId)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                        title="Remove document"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Add Vehicle Doc Form */}
              <div className="pt-2 border-t border-white/10 space-y-2 text-xs">
                <span className="text-[11px] text-gray-400 font-semibold block">Add Vehicle Document:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={newDocType}
                    onChange={(e) => setNewDocType(e.target.value as RiderDocumentType)}
                    className="bg-[#181818] border border-white/10 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-[#FFF174]"
                  >
                    <option value="RC">Vehicle RC</option>
                    <option value="INSURANCE">Insurance Policy</option>
                    <option value="PUC">PUC Certificate</option>
                    <option value="DRIVING_LICENSE">Driving Licence (Secondary)</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Document Number (e.g. WB-74-AX-1024)"
                    value={newDocNumber}
                    onChange={(e) => setNewDocNumber(e.target.value)}
                    className="bg-[#181818] border border-white/10 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-[#FFF174]"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Issuer (e.g. Siliguri RTO)"
                    value={newDocIssuer}
                    onChange={(e) => setNewDocIssuer(e.target.value)}
                    className="bg-[#181818] border border-white/10 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-[#FFF174]"
                  />
                  <input
                    type="date"
                    placeholder="Expiry Date"
                    value={newDocExpiry}
                    onChange={(e) => setNewDocExpiry(e.target.value)}
                    className="bg-[#181818] border border-white/10 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-[#FFF174]"
                  />
                  <button
                    type="button"
                    onClick={handleAddDocument}
                    className="col-span-2 sm:col-span-1 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl px-3 py-2 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* GROUP 6: FAMILY SAFETY */}
          <section className="p-4 sm:p-5 rounded-3xl bg-[#111111] border border-white/10 space-y-3 text-xs">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <ShieldAlert size={18} className="text-amber-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider">6. Family Safety</h2>
              </div>
              <Link to="/safety-circle" className="text-[11px] text-amber-400 hover:underline flex items-center gap-1">
                <span>Safety Circle</span>
                <ChevronRight size={13} />
              </Link>
            </div>
            <p className="text-[11px] text-gray-400">
              Automated safeguards that keep your family informed during daily commutes or mountain touring.
            </p>

            <div className="space-y-2.5">
              <label className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10 cursor-pointer">
                <div>
                  <strong className="text-white block font-semibold">Live Ride Sharing</strong>
                  <span className="text-gray-400 text-[11px]">Generate live GPS tracking link for family contacts during rides</span>
                </div>
                <input
                  type="checkbox"
                  checked={liveRideSharing}
                  onChange={(e) => setLiveRideSharing(e.target.checked)}
                  className="w-4 h-4 accent-[#FFF174]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10 cursor-pointer">
                <div>
                  <strong className="text-white block font-semibold">Safety Timer Alert Escalation</strong>
                  <span className="text-gray-400 text-[11px]">Notify family if you do not check in after planned arrival time</span>
                </div>
                <input
                  type="checkbox"
                  checked={safetyTimerAlert}
                  onChange={(e) => setSafetyTimerAlert(e.target.checked)}
                  className="w-4 h-4 accent-[#FFF174]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10 cursor-pointer">
                <div>
                  <strong className="text-white block font-semibold">Auto-Share Location on SOS</strong>
                  <span className="text-gray-400 text-[11px]">Immediately send your exact location coordinates via WhatsApp/SMS</span>
                </div>
                <input
                  type="checkbox"
                  checked={shareLocationAuto}
                  onChange={(e) => setShareLocationAuto(e.target.checked)}
                  className="w-4 h-4 accent-[#FFF174]"
                />
              </label>
            </div>
          </section>

          {/* GROUP 7: PRIVACY & LOCATION */}
          <section className="p-4 sm:p-5 rounded-3xl bg-[#111111] border border-white/10 space-y-3 text-xs">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-emerald-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider">7. Privacy & Location</h2>
              </div>
              <Link to="/privacy-center" className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1">
                <span>Privacy Center</span>
                <ChevronRight size={13} />
              </Link>
            </div>
            <p className="text-[11px] text-gray-400">
              Manage telemetry permissions, location accuracy, and data retention.
            </p>

            <div className="space-y-2.5">
              <label className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10 cursor-pointer">
                <div>
                  <strong className="text-white block font-semibold">Location Telemetry Consent</strong>
                  <span className="text-gray-400 text-[11px]">Only stream GPS while an active ride or rescue request is ongoing</span>
                </div>
                <input
                  type="checkbox"
                  checked={telemetryConsent}
                  onChange={(e) => setTelemetryConsent(e.target.checked)}
                  className="w-4 h-4 accent-[#FFF174]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10 cursor-pointer">
                <div>
                  <strong className="text-white block font-semibold">High-Accuracy GPS Mode</strong>
                  <span className="text-gray-400 text-[11px]">Request hardware satellite lock for mountain road safety (uses slightly more battery)</span>
                </div>
                <input
                  type="checkbox"
                  checked={highAccuracyGps}
                  onChange={(e) => setHighAccuracyGps(e.target.checked)}
                  className="w-4 h-4 accent-[#FFF174]"
                />
              </label>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-gray-300">
                <strong className="text-white block mb-0.5">Sensitive Data Protection</strong>
                <span>Identity documents and medical data are never stored in localStorage, never shown publicly, and never accessible by roadside helpers.</span>
              </div>
            </div>
          </section>

          {/* GROUP 8: SETTINGS */}
          <section className="p-4 sm:p-5 rounded-3xl bg-[#111111] border border-white/10 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-white">
              <SettingsIcon size={18} className="text-[#FFF174]" />
              <h2 className="text-sm font-bold uppercase tracking-wider">8. Settings</h2>
            </div>
            <p className="text-[11px] text-gray-400">Emergency communication and audio alert preferences.</p>

            <div className="space-y-3">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Preferred Emergency Communication Channel</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'WHATSAPP', label: 'WhatsApp' },
                    { key: 'SMS', label: 'Direct SMS' },
                    { key: 'PHONE', label: 'Voice Call' }
                  ].map((ch) => (
                    <button
                      key={ch.key}
                      type="button"
                      onClick={() => setCommChannel(ch.key as any)}
                      className={`p-2.5 rounded-xl border font-bold text-center transition-colors cursor-pointer ${
                        commChannel === ch.key
                          ? 'bg-[#FFF174]/20 border-[#FFF174] text-[#FFF174]'
                          : 'bg-[#181818] border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      {ch.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10 cursor-pointer">
                <div>
                  <strong className="text-white block font-semibold">National 112 Auto-Dial Prompt</strong>
                  <span className="text-gray-400 text-[11px]">Prompt immediate National Police 112 call if helper unconfirmed after 60s</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoEscalate112}
                  onChange={(e) => setAutoEscalate112(e.target.checked)}
                  className="w-4 h-4 accent-[#FFF174]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10 cursor-pointer">
                <div>
                  <strong className="text-white block font-semibold">Emergency Audio Tones</strong>
                  <span className="text-gray-400 text-[11px]">Play audible beacon chime during active SOS rescue</span>
                </div>
                <input
                  type="checkbox"
                  checked={soundAlerts}
                  onChange={(e) => setSoundAlerts(e.target.checked)}
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
              <span>{saving ? 'Saving Profile...' : 'Save All Profile Settings'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
