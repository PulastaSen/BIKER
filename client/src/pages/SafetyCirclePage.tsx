import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  PhoneCall, 
  ArrowLeft, 
  Navigation, 
  Eye, 
  EyeOff, 
  Loader2,
  MessageCircle
} from 'lucide-react';
import { fetchFamilyCircle, addFamilyMember, removeFamilyMember } from '../services/ecosystemApi';
import type { FamilyMember } from '../types/app';
import { BottomSheet } from '../components/BottomSheet';
import { buildWhatsAppEmergencyAlertUrl } from '../utils/whatsappShare';

const RELATIONSHIPS = ['PARENT', 'PARTNER', 'SIBLING', 'FRIEND', 'CHILD', 'OTHER'] as const;

export function SafetyCirclePage() {
  const navigate = useNavigate();

  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSharingLiveRide, setIsSharingLiveRide] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<string>('PARTNER');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [canViewLiveRide, setCanViewLiveRide] = useState(true);
  const [notifyOnSOS, setNotifyOnSOS] = useState(true);
  const [notifyOnSafetyTimer, setNotifyOnSafetyTimer] = useState(true);

  const loadMembers = () => {
    fetchFamilyCircle().then(data => {
      setMembers(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    await addFamilyMember({
      name,
      relationship,
      phone,
      email,
      canViewLiveRide,
      notifyOnSOS,
    });

    setShowAddModal(false);
    setName('');
    setPhone('');
    setEmail('');
    loadMembers();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Remove this person from your safety circle?')) {
      await removeFamilyMember(id);
      loadMembers();
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-white pt-20 pb-24 font-sans selection:bg-[#FFF174] selection:text-black">
      <div className="container mx-auto px-4 max-w-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#FFF174] text-black font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
          >
            <UserPlus size={16} /> Add Trusted Member
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/40 text-purple-400 flex items-center justify-center shrink-0">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">MY SAFETY CIRCLE</h1>
            <p className="text-gray-400 text-xs mt-0.5">
              Parents, partner, siblings, and friends who receive instant SOS alerts and can track your ride with permission.
            </p>
          </div>
        </div>

        {/* Live Ride Sharing Toggle Card */}
        <div className="p-6 rounded-3xl bg-[#111622] border border-white/10 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {isSharingLiveRide ? <Eye size={18} className="text-emerald-400" /> : <EyeOff size={18} className="text-gray-400" />}
              <h2 className="text-xs font-black uppercase tracking-wider text-white">Ride Location Sharing</h2>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isSharingLiveRide ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-gray-400'
            }`}>
              {isSharingLiveRide ? 'SHARING ACTIVE' : 'NO HIDDEN TRACKING'}
            </span>
          </div>

          <p className="text-xs text-gray-400">
            When enabled during an active ride, family members with permission can view your destination, current highway segment, and estimated ETA.
          </p>

          <button
            type="button"
            onClick={() => setIsSharingLiveRide(!isSharingLiveRide)}
            className={`w-full py-3 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isSharingLiveRide 
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
            }`}
          >
            {isSharingLiveRide ? (
              <>
                <EyeOff size={16} /> STOP SHARING LIVE RIDE
              </>
            ) : (
              <>
                <Navigation size={16} /> SHARE MY RIDE WITH FAMILY
              </>
            )}
          </button>
        </div>

        {/* Member Cards List */}
        <div className="space-y-3.5">
          <h2 className="text-xs font-black uppercase tracking-wider text-gray-400">
            TRUSTED PEOPLE ({members.length})
          </h2>

          {loading ? (
            <div className="py-12 text-center">
              <Loader2 size={28} className="animate-spin text-[#FFF174] mx-auto" />
            </div>
          ) : members.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[#111622] border border-white/10 text-center space-y-3">
              <Users size={36} className="text-gray-500 mx-auto" />
              <p className="text-sm font-bold text-gray-300">No safety contacts added yet</p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Add parents, partner, or riding buddies to ensure someone is notified during highway emergencies.
              </p>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-5 py-2.5 bg-[#FFF174] text-black font-bold text-xs rounded-xl"
              >
                Add First Contact
              </button>
            </div>
          ) : (
            members.map(member => (
              <div
                key={member.id}
                className="p-5 rounded-3xl bg-[#111622] border border-white/10 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-base shrink-0">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-bold text-white">{member.name}</strong>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                        {member.relationship}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 font-mono mt-0.5 block">{member.phone}</span>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                      {member.notifyOnSOS && <span className="text-emerald-400">✓ SOS Alerts</span>}
                      {member.canViewLiveRide && <span className="text-blue-400">✓ Live Ride Access</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <a
                    href={buildWhatsAppEmergencyAlertUrl({ phone: member.phone, riderName: 'I' })}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition-colors"
                    title="Share via WhatsApp"
                  >
                    <MessageCircle size={16} />
                  </a>
                  <a
                    href={`tel:${member.phone.replaceAll(' ', '')}`}
                    className="p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/15 transition-colors"
                    title="Direct Call"
                  >
                    <PhoneCall size={16} />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(member.id)}
                    className="p-2.5 rounded-xl bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors cursor-pointer"
                    title="Remove member"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Add Member BottomSheet (Mobile-first sheet / Desktop modal) */}
      <BottomSheet
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add to Safety Circle"
        subtitle="Trusted contacts receive your live GPS ride beacon and emergency alerts."
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Anjali Sen"
              className="w-full bg-[#182030] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFF174]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">Relationship</label>
            <select
              value={relationship}
              onChange={e => setRelationship(e.target.value)}
              className="w-full bg-[#182030] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
            >
              {RELATIONSHIPS.map(rel => (
                <option key={rel} value={rel}>{rel}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">Phone Number</label>
            <input
              type="text"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full bg-[#182030] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFF174]"
            />
          </div>

          <div className="space-y-2 pt-2 text-xs text-gray-300">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={canViewLiveRide}
                onChange={e => setCanViewLiveRide(e.target.checked)}
                className="rounded text-purple-600"
              />
              <span>Can view live ride location & ETA</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyOnSOS}
                onChange={e => setNotifyOnSOS(e.target.checked)}
                className="rounded text-purple-600"
              />
              <span>Receive automatic emergency SOS broadcasts</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyOnSafetyTimer}
                onChange={e => setNotifyOnSafetyTimer(e.target.checked)}
                className="rounded text-purple-600"
              />
              <span>Notify if safety timer check-in expires</span>
            </label>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              className="flex-1 py-3.5 bg-[#FFF174] hover:bg-[#FCEB50] text-black font-black text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
            >
              Add Member
            </button>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="py-3.5 px-4 bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </BottomSheet>
    </div>
  );
}
