import { useState, useEffect, type ChangeEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Camera,
  Upload,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Lock,
  Bike as BikeIcon,
  ChevronRight,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  fetchVerificationStatus,
  submitIdentityDocuments,
  adminReviewVerification,
  type IdentityVerificationData,
  type VerificationOverallStatus
} from '../services/verificationApi';
import { FaceVerificationModal } from '../components/FaceVerificationModal';

export function VerificationCenterPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'RIDER' | 'HELPER' | 'ADMIN'>(
    user?.role === 'HELPER' ? 'HELPER' : user?.role === 'ADMIN' ? 'ADMIN' : 'RIDER'
  );
  const [verification, setVerification] = useState<IdentityVerificationData | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showFaceModal, setShowFaceModal] = useState(false);

  // Rider Form
  const [riderDocType, setRiderDocType] = useState('DRIVING_LICENSE');
  const [riderDocNumber, setRiderDocNumber] = useState('');
  const [riderDocExpiry, setRiderDocExpiry] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Helper Form
  const [helperCategory, setHelperCategory] = useState<'MECHANIC' | 'TOWING' | 'FUEL' | 'PUNCTURE' | 'PARAMEDIC'>('MECHANIC');
  const [businessName, setBusinessName] = useState('');
  const [serviceAddress, setServiceAddress] = useState('');
  const [helperDocType, setHelperDocType] = useState('TRADE_LICENSE');
  const [helperDocNumber, setHelperDocNumber] = useState('');
  const [yearsExperience, setYearsExperience] = useState('5');

  // Admin Review Form
  const [adminTargetUserId, setAdminTargetUserId] = useState('user-rider-1');
  const [adminDecision, setAdminDecision] = useState<'VERIFIED' | 'REJECTED' | 'ACTION_REQUIRED'>('VERIFIED');
  const [adminNotes, setAdminNotes] = useState('All documents verified and physical inspection approved.');
  const [adminUpdating, setAdminUpdating] = useState(false);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const loadStatus = async () => {
    setLoading(true);
    const data = await fetchVerificationStatus();
    setVerification(data);
    setLoading(false);
  };

  useEffect(() => {
    loadStatus();
  }, [user]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(null);
      return;
    }
    const file = e.target.files[0];

    // File validation: Type
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setFileError('Invalid format. Only JPG, PNG, WEBP, or PDF are supported.');
      setSelectedFile(null);
      return;
    }

    // File validation: Size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setFileError('File size exceeds 5MB limit. Please choose a smaller file.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleRiderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!riderDocNumber.trim()) {
      setFileError('Please enter document number.');
      return;
    }

    setSubmitting(true);
    setSubmissionFeedback(null);

    const res = await submitIdentityDocuments({
      identityType: riderDocType,
      documentNumber: riderDocNumber.trim(),
      documentExpiryDate: riderDocExpiry || undefined,
      fileName: selectedFile?.name || 'identity_doc.jpg',
      fileSizeBytes: selectedFile?.size || 500000,
      fileMimeType: selectedFile?.type || 'image/jpeg',
    });

    setSubmitting(false);

    if (res.success && res.data) {
      setVerification(res.data);
      setSubmissionFeedback({
        success: true,
        message: 'Personal identity document submitted securely and masked for privacy.',
      });
      setSelectedFile(null);
      setRiderDocNumber('');
    } else {
      setSubmissionFeedback({
        success: false,
        message: res.message || 'Failed to submit document. Please try again.',
      });
    }
  };

  const handleHelperSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!helperDocNumber.trim() || !businessName.trim()) {
      setFileError('Please fill in workshop name and document number.');
      return;
    }

    setSubmitting(true);
    setSubmissionFeedback(null);

    const res = await submitIdentityDocuments({
      identityType: helperDocType,
      documentNumber: helperDocNumber.trim(),
      helperCategory,
      businessName: businessName.trim(),
      serviceAddress: serviceAddress.trim(),
      yearsOfExperience: Number(yearsExperience) || 5,
      fileName: selectedFile?.name || 'workshop_credentials.jpg',
      fileSizeBytes: selectedFile?.size || 500000,
      fileMimeType: selectedFile?.type || 'image/jpeg',
    });

    setSubmitting(false);

    if (res.success && res.data) {
      setVerification(res.data);
      setSubmissionFeedback({
        success: true,
        message: 'Provider workshop credentials submitted for verification review.',
      });
      setSelectedFile(null);
      setHelperDocNumber('');
    } else {
      setSubmissionFeedback({
        success: false,
        message: res.message || 'Failed to submit provider credentials.',
      });
    }
  };

  const handleAdminReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminUpdating(true);
    const res = await adminReviewVerification(adminTargetUserId, adminDecision, adminNotes);
    setAdminUpdating(false);
    if (res.success && res.data) {
      setSubmissionFeedback({
        success: true,
        message: `Verification review updated to ${adminDecision}.`,
      });
      loadStatus();
    } else {
      setSubmissionFeedback({
        success: false,
        message: res.message || 'Failed to update review.',
      });
    }
  };

  const getStatusBadge = (status?: VerificationOverallStatus) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black">
            <CheckCircle2 size={13} />
            <span>VERIFIED</span>
          </span>
        );
      case 'UNDER_REVIEW':
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 text-xs font-black">
            <Clock size={13} />
            <span>UNDER REVIEW</span>
          </span>
        );
      case 'ACTION_REQUIRED':
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-black">
            <AlertCircle size={13} />
            <span>ACTION REQUIRED</span>
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black">
            <AlertTriangle size={13} />
            <span>EXPIRED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-gray-400 border border-white/10 text-xs font-semibold">
            <span>NOT STARTED</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#151515] text-white flex flex-col font-sans selection:bg-[#FFF174] selection:text-black pb-28 md:pb-16">
      
      {/* Face Verification Modal */}
      <FaceVerificationModal
        isOpen={showFaceModal}
        onClose={() => setShowFaceModal(false)}
        onSuccess={(updated) => {
          setVerification(updated);
          setShowFaceModal(false);
          setSubmissionFeedback({
            success: true,
            message: 'Face verification selfie recorded.',
          });
        }}
      />

      {/* TOP HEADER */}
      <header className="sticky top-0 z-30 bg-[#1D1D1D]/95 backdrop-blur-md border-b border-white/10 px-4 py-3.5 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/safety-profile')}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Safety Profile</span>
          </button>

          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#FFF174]" />
            <h1 className="text-sm font-black uppercase tracking-wider text-white">
              Identity Verification & Documents
            </h1>
          </div>

          <div className="w-16 flex justify-end">
            {loading ? (
              <span className="text-[10px] text-gray-500 font-mono animate-pulse">Syncing...</span>
            ) : verification?.status === 'VERIFIED' ? (
              <span className="text-[10px] font-bold text-emerald-400">Verified</span>
            ) : (
              <span className="text-[10px] text-gray-500">Unverified</span>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* TAB SWITCHER */}
        <div className="flex rounded-2xl bg-[#141414] border border-white/10 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('RIDER')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'RIDER' ? 'bg-[#FFF174] text-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Rider Identity Verification
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('HELPER')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'HELPER' ? 'bg-[#FFF174] text-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Helper / Provider Verification
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ADMIN')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'ADMIN' ? 'bg-[#FFF174] text-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Admin Review
          </button>
        </div>

        {/* FEEDBACK BANNER */}
        {submissionFeedback && (
          <div
            className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in duration-150 ${
              submissionFeedback.success
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-red-950/40 border-red-500/40 text-red-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {submissionFeedback.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{submissionFeedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setSubmissionFeedback(null)}
              className="text-gray-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* ========================================================
            TAB 1: RIDER VERIFICATION
            ======================================================== */}
        {activeTab === 'RIDER' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            
            {/* CURRENT VERIFICATION STATUS CARD */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#121212] border border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Verification ID:</span>
                    <span className="text-xs font-mono text-[#FFF174]">
                      {verification?.verificationId || 'VERIF-R-1001'}
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-white">Rider Identity Status</h2>
                </div>
                {getStatusBadge(verification?.status)}
              </div>

              {/* Status breakdown grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <span className="text-gray-400 text-[11px] block">Government Identity Proof</span>
                  <strong className="text-white block font-bold">
                    {verification?.identityType ? verification.identityType.replace('_', ' ') : 'Driving Licence'}
                  </strong>
                  <span className="text-gray-400 font-mono text-[11px] block">
                    {verification?.documentNumberMasked || 'DL-WB74-****-1024'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <span className="text-gray-400 text-[11px] block">Face Biometric Status</span>
                  <strong className="text-white block font-bold">
                    {verification?.faceLivenessStatus || 'PENDING'}
                  </strong>
                  <span className="text-gray-400 text-[11px] block truncate">
                    {verification?.faceVerificationNotes || 'Queued for manual operator review'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <span className="text-gray-400 text-[11px] block">Review Outcome</span>
                  <strong className="text-white block font-bold">
                    {verification?.status === 'VERIFIED' ? 'Approved by Operations' : 'Awaiting Review'}
                  </strong>
                  <span className="text-gray-400 text-[11px] block truncate">
                    {verification?.reviewNotes || 'Documents under review'}
                  </span>
                </div>
              </div>

              {/* FACE VERIFICATION BUTTON */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setShowFaceModal(true)}
                  className="px-4 py-3 rounded-2xl bg-[#FFF174] hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Camera size={16} />
                  <span>Launch Face Selfie Verification</span>
                </button>

                <button
                  type="button"
                  onClick={loadStatus}
                  className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw size={14} />
                  <span>Refresh Status</span>
                </button>
              </div>
            </div>

            {/* SEPARATE VEHICLE DOCUMENTS CLARIFICATION CARD (Part 5 requirement) */}
            <div className="p-4 rounded-2xl bg-[#141820] border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <BikeIcon size={18} />
                </div>
                <div>
                  <strong className="text-blue-200 block font-bold">
                    Vehicle Documents (RC, Insurance, PUC) are managed separately
                  </strong>
                  <span className="text-gray-300 block text-[11px] mt-0.5">
                    Vehicle papers certify the motorcycle's legal roadworthiness, whereas this section certifies your individual rider identity.
                  </span>
                </div>
              </div>
              <Link
                to="/documents"
                className="px-3.5 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 font-bold text-xs uppercase tracking-wider shrink-0 flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Manage RC & Insurance</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* SUBMIT OR REPLACE IDENTITY DOCUMENT FORM */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#121212] border border-white/10 space-y-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Upload size={18} className="text-[#FFF174]" />
                <span>Upload Identity Document Proof</span>
              </h3>
              <p className="text-xs text-gray-400">
                Upload your Driving Licence or Government ID (Aadhaar / Voter ID / Passport). Document numbers are cryptographically masked before transit.
              </p>

              <form onSubmit={handleRiderSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="riderDocType" className="text-xs font-bold text-gray-300 block">
                      Identity Document Type
                    </label>
                    <select
                      id="riderDocType"
                      value={riderDocType}
                      onChange={(e) => setRiderDocType(e.target.value)}
                      className="w-full bg-[#181818] border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFF174]"
                    >
                      <option value="DRIVING_LICENSE">Driving Licence (Motorcycle / Transport)</option>
                      <option value="AADHAAR">Aadhaar National Identity</option>
                      <option value="PASSPORT">Passport (Republic of India)</option>
                      <option value="VOTER_ID">Election Voter Photo ID</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="riderDocNumber" className="text-xs font-bold text-gray-300 block">
                      Document Number
                    </label>
                    <input
                      id="riderDocNumber"
                      type="text"
                      value={riderDocNumber}
                      onChange={(e) => setRiderDocNumber(e.target.value)}
                      placeholder="e.g. DL-74-2024-9988123"
                      className="w-full bg-[#181818] border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFF174]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="riderDocExpiry" className="text-xs font-bold text-gray-300 block">
                      Expiry Date (Optional)
                    </label>
                    <input
                      id="riderDocExpiry"
                      type="date"
                      value={riderDocExpiry}
                      onChange={(e) => setRiderDocExpiry(e.target.value)}
                      className="w-full bg-[#181818] border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFF174]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="riderDocFile" className="text-xs font-bold text-gray-300 block">
                      Document Photo / Scan (Max 5MB • JPG, PNG, PDF)
                    </label>
                    <input
                      id="riderDocFile"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={handleFileChange}
                      className="w-full bg-[#181818] border border-white/20 rounded-xl px-3.5 py-2 text-xs text-gray-300 file:mr-3 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#FFF174] file:text-black cursor-pointer"
                    />
                    {fileError && <span className="text-[11px] text-red-400 block">{fileError}</span>}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-6 py-3 bg-[#FFF174] hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {submitting ? 'Submitting & Encrypting...' : 'Upload & Submit for Verification'}
                  </button>
                </div>
              </form>
            </div>

            {/* AUDIT LOG TIMELINE */}
            {verification?.auditLogs && verification.auditLogs.length > 0 && (
              <div className="p-5 rounded-3xl bg-[#121212] border border-white/10 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
                  Verification Security Audit Log
                </h4>
                <div className="space-y-2">
                  {verification.auditLogs.map((log, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[11px] flex items-center justify-between gap-2"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-white block">{log.action}</span>
                        <span className="text-gray-400 block">{log.details}</span>
                      </div>
                      <span className="text-gray-500 font-mono shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 2: HELPER / PROVIDER VERIFICATION
            ======================================================== */}
        {activeTab === 'HELPER' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="p-5 sm:p-6 rounded-3xl bg-[#121212] border border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Provider Credential ID:</span>
                    <span className="text-xs font-mono text-[#FFF174]">
                      {verification?.verificationId || 'VERIF-H-2001'}
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-white">Service Provider & Workshop Credentials</h2>
                </div>
                {getStatusBadge(verification?.status || 'VERIFIED')}
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                Service providers, motorcycle mechanics, and towing partners must submit trade credentials and workshop address for verification before dispatch privileges are granted.
              </p>

              <form onSubmit={handleHelperSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="helperCategory" className="text-xs font-bold text-gray-300 block">
                      Service Category
                    </label>
                    <select
                      id="helperCategory"
                      value={helperCategory}
                      onChange={(e: any) => setHelperCategory(e.target.value)}
                      className="w-full bg-[#181818] border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFF174]"
                    >
                      <option value="MECHANIC">Motorcycle Repair / Mechanic Workshop</option>
                      <option value="TOWING">Flatbed Towing & Recovery Specialist</option>
                      <option value="PUNCTURE">Mobile Tyre & Puncture Technician</option>
                      <option value="FUEL">Emergency Highway Fuel Assistance</option>
                      <option value="PARAMEDIC">First-Aid & Emergency Paramedic</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="businessName" className="text-xs font-bold text-gray-300 block">
                      Workshop / Business Name
                    </label>
                    <input
                      id="businessName"
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Raj Motors 2-Wheeler Rescue"
                      className="w-full bg-[#181818] border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFF174]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="serviceAddress" className="text-xs font-bold text-gray-300 block">
                      Workshop Physical Address
                    </label>
                    <input
                      id="serviceAddress"
                      type="text"
                      value={serviceAddress}
                      onChange={(e) => setServiceAddress(e.target.value)}
                      placeholder="e.g. Sevoke Road 2nd Mile, Siliguri, WB 734001"
                      className="w-full bg-[#181818] border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFF174]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="yearsExperience" className="text-xs font-bold text-gray-300 block">
                      Years of Mountain Roadside Experience
                    </label>
                    <input
                      id="yearsExperience"
                      type="number"
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(e.target.value)}
                      min="1"
                      max="40"
                      className="w-full bg-[#181818] border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFF174]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="helperDocType" className="text-xs font-bold text-gray-300 block">
                      Trade / Business Verification Document
                    </label>
                    <select
                      id="helperDocType"
                      value={helperDocType}
                      onChange={(e) => setHelperDocType(e.target.value)}
                      className="w-full bg-[#181818] border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFF174]"
                    >
                      <option value="TRADE_LICENSE">Municipal Trade License</option>
                      <option value="BUSINESS_PROOF">Udyam MSME Certificate</option>
                      <option value="DRIVING_LICENSE">Commercial Towing Driver's Licence</option>
                      <option value="CERTIFICATE">OEM Certified Mechanic Diploma</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="helperDocNumber" className="text-xs font-bold text-gray-300 block">
                      Certificate / Registration Number
                    </label>
                    <input
                      id="helperDocNumber"
                      type="text"
                      value={helperDocNumber}
                      onChange={(e) => setHelperDocNumber(e.target.value)}
                      placeholder="e.g. UDYAM-WB-10-0042918"
                      className="w-full bg-[#181818] border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFF174]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="helperDocFile" className="text-xs font-bold text-gray-300 block">
                    Upload Facility Photo or Trade Certificate (Max 5MB)
                  </label>
                  <input
                    id="helperDocFile"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={handleFileChange}
                    className="w-full bg-[#181818] border border-white/20 rounded-xl px-3.5 py-2 text-xs text-gray-300 file:mr-3 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#FFF174] file:text-black cursor-pointer"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-6 py-3 bg-[#FFF174] hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {submitting ? 'Submitting Provider Data...' : 'Submit Provider Credentials'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: ADMIN REVIEW
            ======================================================== */}
        {activeTab === 'ADMIN' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="p-5 sm:p-6 rounded-3xl bg-[#121212] border border-white/10 space-y-4">
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Lock size={18} className="text-[#FFF174]" />
                  <span>Operations Admin Verification Decision Panel</span>
                </h3>
                <p className="text-xs text-gray-400">
                  Authorized audit mechanism for MotoAssist Safety Operations to approve, reject, or request changes on verification submissions.
                </p>
              </div>

              <form onSubmit={handleAdminReview} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="adminUserId" className="text-xs font-bold text-gray-300 block">
                      Target User ID
                    </label>
                    <select
                      id="adminUserId"
                      value={adminTargetUserId}
                      onChange={(e) => setAdminTargetUserId(e.target.value)}
                      className="w-full bg-[#181818] border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFF174]"
                    >
                      <option value="user-rider-1">user-rider-1 (Pulasta Sen - Rider)</option>
                      <option value="user-helper-1">user-helper-1 (Suman Gurung - Helper)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="adminDecision" className="text-xs font-bold text-gray-300 block">
                      Review Status Decision
                    </label>
                    <select
                      id="adminDecision"
                      value={adminDecision}
                      onChange={(e: any) => setAdminDecision(e.target.value)}
                      className="w-full bg-[#181818] border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFF174]"
                    >
                      <option value="VERIFIED">VERIFIED (Approve & Grant Verified Badge)</option>
                      <option value="ACTION_REQUIRED">ACTION_REQUIRED (Request Clearer Scan)</option>
                      <option value="REJECTED">REJECTED (Reject Submission)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="adminNotes" className="text-xs font-bold text-gray-300 block">
                    Administrative Review Notes & Audit Reason
                  </label>
                  <textarea
                    id="adminNotes"
                    rows={2}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full bg-[#181818] border border-white/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#FFF174]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={adminUpdating}
                  className="px-6 py-3 bg-[#FFF174] hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  {adminUpdating ? 'Updating Verification...' : 'Commit Admin Decision'}
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
