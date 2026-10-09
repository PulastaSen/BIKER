import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getHelperProfileByUserId, saveHelperProfile } from '../../utils/appStorage';
import type { HelperProfile } from '../../types/app';
import { 
  Wrench, 
  Check, 
  ShieldCheck, 
  Building2, 
  Star, 
  CheckCircle2, 
  Clock, 
  History, 
  FileText, 
  UserCheck, 
  ChevronRight 
} from 'lucide-react';
import { API_BASE_URL } from '../../config/api';
import { getVerificationStatus, type VerificationRecord } from '../../services/verificationApi';

export function HelperProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<HelperProfile | undefined>();
  
  // 1. Professional Profile
  const [ownerName, setOwnerName] = useState('Rajesh Sharma');
  const [phone, setPhone] = useState('+91 98320 12345');
  const [bio, setBio] = useState('Certified Himalayan Motorcycle Technician with 12+ years experience in NH-10 mountain rescues.');

  // 2. Identity Verification
  const [verStatus, setVerStatus] = useState<VerificationRecord | null>(null);

  // 3. Business & Service Information
  const [businessName, setBusinessName] = useState('Raj Motors & Mountain Rescue');
  const [workshopAddress, setWorkshopAddress] = useState('Sevoke Road, 2nd Mile, Siliguri, WB 734001');
  const [businessReg, setBusinessReg] = useState('UDYAM-WB-10-0042918');
  const [tradeLicense, setTradeLicense] = useState('SMC/TL/2023/8812');
  const [selectedAreas, setSelectedAreas] = useState<string[]>(['Siliguri', 'Sevoke', 'Kalimpong']);

  // 4. Availability
  const [operatingHours, setOperatingHours] = useState('24/7 Emergency Highway Care');
  const [isAvailableNow, setIsAvailableNow] = useState(true);
  const [highwayStandby, setHighwayStandby] = useState(true);

  // 5. Service Categories
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    'Puncture repair',
    'Battery jump-start',
    'Chain repair',
    'Towing',
    'Fuel delivery'
  ]);

  // 6. Job History (Recent rescues)
  const [recentJobs] = useState([
    { id: 'JOB-902', rider: 'Aman K.', bike: 'Royal Enfield Himalayan', issue: 'Puncture repair', location: 'Sevoke Bridge, NH-10', time: 'Yesterday 18:30', status: 'COMPLETED' },
    { id: 'JOB-884', rider: 'Pooja M.', bike: 'KTM 390 Adventure', issue: 'Clutch wire snap', location: 'Coronation Bridge', time: '3 days ago', status: 'COMPLETED' },
    { id: 'JOB-812', rider: 'Rohan D.', bike: 'Bajaj Dominar 400', issue: 'Flatbed Towing', location: 'Teesta Bazaar', time: '1 week ago', status: 'COMPLETED' }
  ]);

  // 7. Ratings
  const [ratingStats] = useState({
    rating: 4.9,
    totalReviews: 142,
    responseRate: '98%',
    avgArrival: '8 mins'
  });

  // 8. Document Status
  const [docStatuses] = useState([
    { name: 'Government ID / Aadhaar', status: 'VERIFIED', type: 'IDENTITY' },
    { name: 'Selfie Face Verification', status: 'VERIFIED', type: 'BIOMETRIC' },
    { name: 'Trade License (SMC)', status: 'VERIFIED', type: 'BUSINESS' },
    { name: 'MSME / Udyam Certificate', status: 'VERIFIED', type: 'BUSINESS' },
    { name: 'Commercial Driving License', status: 'VERIFIED', type: 'TOWING' },
    { name: 'Workshop Facility Photo Proof', status: 'VERIFIED', type: 'FACILITY' }
  ]);

  const [saved, setSaved] = useState(false);

  const areasList = ['Siliguri', 'Sevoke', 'Kalimpong', 'Darjeeling', 'Gangtok', 'Teesta Bazaar', 'Rangpo'];
  const skillsList = [
    'Puncture repair',
    'Battery jump-start',
    'Chain repair',
    'Clutch repair',
    'Fuel delivery',
    'Towing',
    'Basic engine troubleshooting',
    'Electrical repair',
  ];

  useEffect(() => {
    if (user) {
      const p = getHelperProfileByUserId(user.id);
      if (p) {
        setProfile(p);
        if (p.businessName) setBusinessName(p.businessName);
        if (p.phone) setPhone(p.phone);
        if (p.serviceAreas) setSelectedAreas(p.serviceAreas);
        if (p.skills) setSelectedSkills(p.skills);
        if (p.operatingHours) setOperatingHours(p.operatingHours);
      }

      // Fetch helper verification status
      getVerificationStatus().then((record) => {
        if (record) setVerStatus(record);
      });
    }
  }, [user]);

  const toggleArea = (area: string) => {
    setSelectedAreas((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]));
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile) {
      const updated: HelperProfile = {
        ...profile,
        businessName,
        phone,
        serviceAreas: selectedAreas,
        skills: selectedSkills,
        operatingHours
      };
      saveHelperProfile(updated);
      setProfile(updated);
    }

    try {
      await fetch(`${API_BASE_URL}/api/helpers/verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          ownerName,
          phone,
          businessRegistrationNumber: businessReg,
          tradeLicenseNumber: tradeLicense
        })
      });
    } catch {
      // offline fallback
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 text-white font-sans selection:bg-[#FFF174] selection:text-black">
      
      {/* HEADER */}
      <header className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <p className="text-xs font-black uppercase text-[#FFF174] tracking-wider">PROVIDER PROFILE • 8 SECTIONS</p>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Helper Profile & Verification</h1>
          <p className="text-xs text-gray-400 mt-1">
            Dedicated service provider dashboard. Manage credentials, availability, service categories, and dispatch history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5">
            <ShieldCheck size={16} />
            <span>Status: {verStatus?.status || 'VERIFIED'}</span>
          </span>
        </div>
      </header>

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-400 text-emerald-300 font-bold flex items-center gap-2 text-xs">
          <ShieldCheck size={18} />
          <span>Helper trust profile updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">

        {/* 1. PROFESSIONAL PROFILE */}
        <section className="p-5 rounded-3xl bg-[#111111] border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-white">
            <UserCheck size={18} className="text-[#FFF174]" />
            <h2 className="text-sm font-bold uppercase tracking-wider">1. Professional Profile</h2>
          </div>
          <p className="text-[11px] text-gray-400">Personal credentials of the primary technician / operator.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-gray-400 mb-1 font-semibold">Proprietor / Lead Technician Name</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FFF174]"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1 font-semibold">Emergency Dispatch Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FFF174]"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-gray-400 mb-1 font-semibold">Professional Bio & Experience</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FFF174]"
              />
            </div>
          </div>
        </section>

        {/* 2. IDENTITY VERIFICATION */}
        <section className="p-5 rounded-3xl bg-[#111111] border border-white/10 space-y-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider">2. Identity Verification</h2>
            </div>
            <span className="text-[10px] text-gray-400">Strictly Audited</span>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-cyan-950/30 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <strong className="text-xs font-bold text-white">Provider KYC & Biometric Verification</strong>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {verStatus?.status || 'VERIFIED'}
                </span>
              </div>
              <p className="text-[11px] text-gray-300 mt-1">
                Liveness check and government credential matching for highway responder pass.
              </p>
            </div>

            <Link
              to="/helper/verification"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FFF174] hover:bg-yellow-400 text-black font-black text-xs shrink-0 transition-colors"
            >
              <span>Manage Verification</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </section>

        {/* 3. BUSINESS / SERVICE INFORMATION */}
        <section className="p-5 rounded-3xl bg-[#111111] border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-white">
            <Building2 size={18} className="text-cyan-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider">3. Business / Service Information</h2>
          </div>
          <p className="text-[11px] text-gray-400">Registered workshop location and commercial licensing credentials.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-gray-400 mb-1 font-semibold">Workshop / Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FFF174]"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1 font-semibold">Physical Workshop Address</label>
              <input
                type="text"
                value={workshopAddress}
                onChange={(e) => setWorkshopAddress(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FFF174]"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1 font-semibold">Trade License No.</label>
              <input
                type="text"
                value={tradeLicense}
                onChange={(e) => setTradeLicense(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FFF174]"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1 font-semibold">Business / MSME Reg.</label>
              <input
                type="text"
                value={businessReg}
                onChange={(e) => setBusinessReg(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FFF174]"
              />
            </div>
          </div>

          <div className="pt-2">
            <span className="block text-gray-400 mb-1.5 font-semibold text-xs">Covered Highway Areas</span>
            <div className="flex flex-wrap gap-2">
              {areasList.map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => toggleArea(area)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                    selectedAreas.includes(area)
                      ? 'bg-[#FFF174] text-black border-[#FFF174]'
                      : 'bg-[#181818] border-white/10 text-gray-300 hover:text-white'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 4. AVAILABILITY */}
        <section className="p-5 rounded-3xl bg-[#111111] border border-white/10 space-y-3 text-xs">
          <div className="flex items-center gap-2 text-white">
            <Clock size={18} className="text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider">4. Availability & Working Hours</h2>
          </div>
          <p className="text-[11px] text-gray-400">Control your dispatch queue and highway emergency standby status.</p>

          <div className="space-y-2.5">
            <div>
              <label className="block text-gray-400 mb-1 font-semibold">Operating Schedule</label>
              <input
                type="text"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FFF174]"
              />
            </div>

            <label className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10 cursor-pointer">
              <div>
                <strong className="text-white block font-semibold">Accepting Live Rescues Now</strong>
                <span className="text-gray-400 text-[11px]">When turned off, riders nearby will not be routed to your workshop</span>
              </div>
              <input
                type="checkbox"
                checked={isAvailableNow}
                onChange={(e) => setIsAvailableNow(e.target.checked)}
                className="w-4 h-4 accent-[#FFF174]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10 cursor-pointer">
              <div>
                <strong className="text-white block font-semibold">24/7 Highway Emergency Standby</strong>
                <span className="text-gray-400 text-[11px]">Receive critical nighttime distress dispatches from NH-10 corridor</span>
              </div>
              <input
                type="checkbox"
                checked={highwayStandby}
                onChange={(e) => setHighwayStandby(e.target.checked)}
                className="w-4 h-4 accent-[#FFF174]"
              />
            </label>
          </div>
        </section>

        {/* 5. SERVICE CATEGORIES */}
        <section className="p-5 rounded-3xl bg-[#111111] border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-white">
            <Wrench size={18} className="text-emerald-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider">5. Service Categories & Skills</h2>
          </div>
          <p className="text-[11px] text-gray-400">Select roadside capabilities you can dispatch to stranded riders.</p>

          <div className="flex flex-wrap gap-2">
            {skillsList.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={`px-3 py-2 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  selectedSkills.includes(skill)
                    ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                    : 'bg-[#181818] border-white/10 text-gray-300 hover:text-white'
                }`}
              >
                <Wrench size={12} /> {skill}
              </button>
            ))}
          </div>
        </section>

        {/* 6. JOB HISTORY */}
        <section className="p-5 rounded-3xl bg-[#111111] border border-white/10 space-y-3">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <History size={18} className="text-blue-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider">6. Job History (Recent Rescues)</h2>
            </div>
            <span className="text-[10px] text-gray-400">Total: 142 Jobs</span>
          </div>

          <div className="space-y-2 text-xs">
            {recentJobs.map((job) => (
              <div key={job.id} className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-white font-bold">{job.issue}</strong>
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      ✓ {job.status}
                    </span>
                  </div>
                  <div className="text-gray-400 text-[11px] mt-0.5">
                    <span>{job.rider} • {job.bike} • {job.location}</span>
                  </div>
                </div>
                <span className="text-[11px] text-gray-500">{job.time}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 7. RATINGS */}
        <section className="p-5 rounded-3xl bg-[#111111] border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-white">
            <Star size={18} className="text-[#FFF174]" />
            <h2 className="text-sm font-bold uppercase tracking-wider">7. Ratings & Performance Metrics</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-black/40 border border-white/10">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Rider Rating</span>
              <div className="flex items-center justify-center gap-1 mt-1 text-[#FFF174] font-black text-lg">
                <Star size={16} fill="currentColor" />
                <span>{ratingStats.rating} / 5.0</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/10">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Total Reviews</span>
              <strong className="text-lg text-white font-black block mt-1">{ratingStats.totalReviews}</strong>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/10">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Response Rate</span>
              <strong className="text-lg text-emerald-400 font-black block mt-1">{ratingStats.responseRate}</strong>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/10">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Avg Arrival Time</span>
              <strong className="text-lg text-[#FFF174] font-black block mt-1">{ratingStats.avgArrival}</strong>
            </div>
          </div>
        </section>

        {/* 8. DOCUMENT STATUS */}
        <section className="p-5 rounded-3xl bg-[#111111] border border-white/10 space-y-3">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-cyan-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider">8. Document Status</h2>
            </div>
            <Link to="/helper/verification" className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1">
              <span>Upload / Update</span>
              <ChevronRight size={13} />
            </Link>
          </div>
          <p className="text-[11px] text-gray-400">Current verification audit states for compliance with highway rescue licensing.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {docStatuses.map((doc, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
                <div>
                  <strong className="text-white block font-semibold text-[11px]">{doc.name}</strong>
                  <span className="text-[10px] text-gray-500">{doc.type}</span>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  ✓ {doc.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* SUBMIT BUTTON */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-4 bg-[#FFF174] hover:bg-yellow-400 active:scale-98 text-black font-black text-sm uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FFF174]/15 transition-all"
          >
            <Check size={18} />
            <span>Save Provider Trust Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
}
