import { useState, useEffect } from 'react';
import { Heart, X, PhoneCall, Shield } from 'lucide-react';
import { fetchMedicalProfile } from '../services/ecosystemApi';
import type { MedicalProfile } from '../types/app';
import { useNavigate } from 'react-router-dom';

export interface MedicalIdQuickModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MedicalIdQuickModal({ isOpen, onClose }: MedicalIdQuickModalProps) {
  const [profile, setProfile] = useState<MedicalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchMedicalProfile().then((data) => {
        setProfile(data);
        setLoading(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="medical-id-title"
    >
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#131010] border border-red-500/50 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 text-white shadow-[0_0_50px_rgba(220,38,38,0.35)] z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center border border-red-500/30">
              <Heart size={20} />
            </span>
            <div>
              <h2 id="medical-id-title" className="text-base sm:text-lg font-black text-white">
                EMERGENCY MEDICAL ID
              </h2>
              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                <Shield size={12} className="text-emerald-400" /> Minimum info for first responders
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

        {/* Essential Info Only */}
        {loading ? (
          <div className="py-8 text-center text-xs text-gray-400">Loading Medical ID...</div>
        ) : (
          <div className="space-y-3">
            {/* Blood Group Hero */}
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-red-300 block">
                  Blood Group
                </span>
                <strong className="text-2xl sm:text-3xl font-black text-white">
                  {profile?.bloodGroup || 'B+'}
                </strong>
              </div>
              <span className="text-[11px] font-bold text-red-200 bg-red-600/30 px-3 py-1 rounded-full border border-red-400/30">
                {profile?.organDonor ? 'Organ Donor: Yes' : 'Emergency Spec'}
              </span>
            </div>

            {/* Critical Allergies */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Critical Allergies
              </span>
              <strong className="text-white text-sm">
                {profile?.allergies && profile.allergies.length > 0
                  ? profile.allergies.join(', ')
                  : 'None declared'}
              </strong>
            </div>

            {/* Emergency Doctor & Hospital */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Doctor</span>
                <strong className="text-white block mt-0.5 truncate">
                  {profile?.doctorName || 'Dr. D. Sen'}
                </strong>
                {profile?.doctorContact && (
                  <a
                    href={`tel:${profile.doctorContact}`}
                    className="text-[11px] text-[#FFF174] font-bold mt-1 inline-flex items-center gap-1 hover:underline"
                  >
                    <PhoneCall size={11} /> Call Doctor
                  </a>
                )}
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Hospital</span>
                <strong className="text-white block mt-0.5 truncate">
                  {profile?.preferredHospital || 'Neotia Getwel Hospital'}
                </strong>
                <span className="text-[10px] text-gray-400 block mt-1">Siliguri Trauma</span>
              </div>
            </div>

            {/* Privacy notice */}
            <p className="text-[10px] text-gray-400 text-center pt-1">
              Protected health identifier. Only displayed during active emergency assistance.
            </p>

            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/medical-id');
              }}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-gray-200 transition-colors"
            >
              Manage Full Medical ID Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
