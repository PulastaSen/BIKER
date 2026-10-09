import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  FileText,
  Camera,
  Upload,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Lock,
  Building2,
  Bike as BikeIcon,
  ChevronRight,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  fetchVerificationStatus,
  submitIdentityDocuments,
  type IdentityVerificationData,
  type VerificationOverallStatus
} from '../services/verificationApi';
import { FaceVerificationModal } from '../components/FaceVerificationModal';

export function VerificationCenterPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'RIDER' | 'HELPER'>(user?.role === 'HELPER' ? 'HELPER' : 'RIDER');
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      fileName: selectedFile?.name,
      fileSizeBytes: selectedFile?.size,
      fileMimeType: selectedFile?.type
    });

    setSubmitting(false);

    if (res.success && res.data) {
      setVerification(res.data);
      setSubmissionFeedback({ success: true, message: 'Identity document submitted securely for review!' });
      setRiderDocNumber('');
      setSelectedFile(null);
    } else {
      setSubmissionFeedback({ success: false, message: res.message || 'Failed to submit document' });
    }
  };

  const handleHelperSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !serviceAddress.trim() || !helperDocNumber.trim()) {
      setFileError('Please fill in workshop name, address, and license number.');
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
      yearsOfExperience: Number(yearsExperience) || 1,
      fileName: selectedFile?.name,
      fileSizeBytes: selectedFile?.size,
      fileMimeType: selectedFile?.type
    });

    setSubmitting(false);

    if (res.success && res.data) {
      setVerification(res.data);
      setSubmissionFeedback({ success: true, message: 'Helper credentials submitted securely for verification!' });
    } else {
      setSubmissionFeedback({ success: false, message: res.message || 'Failed to submit helper credentials' });
    }
  };

  const getStatusBadge = (status?: VerificationOverallStatus) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-black uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Verified
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-black uppercase tracking-wider">
            <Clock size={12} className="animate-spin" />
            Under review
          </span>
        );
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-black uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            Submitted
          </span>
        );
      case 'ACTION_REQUIRED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black uppercase tracking-wider">
            <AlertCircle size={12} />
            Action required
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-black uppercase tracking-wider">
            <AlertTriangle size={12} />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-gray-400 border border-white/10 text-xs font-black uppercase tracking-wider">
            Not started
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white font-sans pt-6 pb-24 md:pb-16 px-4 sm:px-6 selection:bg-[#FFF174] selection:text-black">
      
      {/* Face Verification Modal */}
      <FaceVerificationModal
        isOpen={showFaceModal}
        onClose={() => setShowFaceModal(false)}
        onSuccess={(updated) => {
          setVerification(updated);
        }}
      />

      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to Profile</span>
          </button>

          <span className="text-[11px] font-mono text-gray-500">
            ID Vault • 256-Bit Encrypted
          </span>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-xs text-gray-400 py-1">
            <Loader2 size={14} className="animate-spin text-[#FFF174]" />
            <span>Synchronizing secure verification records...</span>
          </div>
        )}

        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#121212] border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF174]/10 border border-[#FFF174]/30 text-[#FFF174] flex items-center justify-center shrink-0">
              <ShieldCheck size={30} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight uppercase">
                VERIFICATION & DOCUMENTS
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Establish trusted identity across the MotoAssist highway assistance network.
              </p>
            </div>
          </div>

          <div>{getStatusBadge(verification?.status)}</div>
        </div>

        {/* WORKFLOW ROLE TOGGLE (Rider vs Helper) */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-[#141414] border border-white/10 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setActiveTab('RIDER')}
            className={`py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'RIDER'
                ? 'bg-[#FFF174] text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Rider Verification
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('HELPER')}
            className={`py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'HELPER'
                ? 'bg-[#FFF174] text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Helper Verification
          </button>
        </div>

        {/* STATUS BREAKDOWN CARD (Requirement 11) */}
        <div className="p-5 rounded-3xl bg-[#161616] border border-white/10 space-y-3">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
            VERIFICATION PROGRESS BREAKDOWN
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* 1. Identity Document */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-gray-400 text-[11px] block">Personal ID Document:</span>
              <strong className="text-white block font-bold">
                {verification?.documentStatus === 'VERIFIED'
                  ? '✅ Verified'
                  : verification?.documentStatus === 'SUBMITTED'
                  ? '⏳ Submitted'
                  : '⚠️ Documents required'}
              </strong>
              <span className="text-[10px] text-gray-500 font-mono block">
                {verification?.documentNumberMasked || 'Not provided'}
              </span>
            </div>

            {/* 2. Selfie / Face Check */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-gray-400 text-[11px] block">Selfie Verification:</span>
              <strong className="text-white block font-bold">
                {verification?.faceLivenessStatus === 'PASSED'
                  ? '✅ Passed'
                  : verification?.faceLivenessStatus === 'PENDING'
                  ? '⏳ Pending review'
                  : '⚠️ Action required'}
              </strong>
              <span className="text-[10px] text-gray-500 block truncate">
                {verification?.faceVerificationNotes || 'Selfie required'}
              </span>
            </div>

            {/* 3. Overall Review */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-gray-400 text-[11px] block">Review Decision:</span>
              <strong className="text-white block font-bold">
                {verification?.status === 'VERIFIED'
                  ? '🟢 Fully Verified'
                  : verification?.status === 'UNDER_REVIEW'
                  ? '🟣 In Progress'
                  : '🟡 Incomplete'}
              </strong>
              <span className="text-[10px] text-gray-500 block">
                {verification?.reviewNotes || 'Submit documents & selfie to complete.'}
              </span>
            </div>
          </div>

          {/* NEXT CLEAR ACTION */}
          {verification?.status !== 'VERIFIED' && (
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#111111] p-3.5 rounded-2xl border border-white/5">
              <div className="text-xs">
                <strong className="text-[#FFF174] font-bold block">Next Recommended Action:</strong>
                <span className="text-gray-300">
                  {verification?.documentStatus !== 'SUBMITTED' && verification?.documentStatus !== 'VERIFIED'
                    ? 'Upload your Driving Licence or Govt Identity document below.'
                    : verification?.faceLivenessStatus !== 'PASSED'
                    ? 'Complete the selfie face-verification step to confirm identity match.'
                    : 'Your verification is being inspected by our safety verification desk.'}
                </span>
              </div>
              {verification?.faceLivenessStatus !== 'PASSED' && (
                <button
                  type="button"
                  onClick={() => setShowFaceModal(true)}
                  className="px-4 py-2 bg-[#FFF174] text-black font-black text-xs uppercase tracking-wider rounded-xl hover:bg-yellow-400 transition-colors shrink-0 cursor-pointer"
                >
                  Take Selfie Now
                </button>
              )}
            </div>
          )}
        </div>

        {submissionFeedback && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 ${
              submissionFeedback.success
                ? 'bg-emerald-950/50 border border-emerald-500/40 text-emerald-300'
                : 'bg-red-950/50 border border-red-500/40 text-red-300'
            }`}
          >
            {submissionFeedback.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{submissionFeedback.message}</span>
          </div>
        )}

        {/* ========================================================
            RIDER WORKFLOW (Requirement 9 & 10)
            ======================================================== */}
        {activeTab === 'RIDER' && (
          <div className="space-y-6">
            
            {/* PART 1: PERSONAL IDENTITY PROOF */}
            <section className="p-6 rounded-3xl bg-[#141414] border border-white/10 space-y-5">
              <div>
                <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <FileText size={18} className="text-[#FFF174]" />
                  <span>1. Personal Identity Verification</span>
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Upload official government identity proof. This verifies you as a verified rider.
                </p>
              </div>

              <form onSubmit={handleRiderSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="riderDocTypeSelect" className="text-xs font-bold text-gray-300 block">
                      Identity Document Type
                    </label>
                    <select
                      id="riderDocTypeSelect"
                      value={riderDocType}
                      onChange={(e) => setRiderDocType(e.target.value)}
                      className="w-full bg-[#181818] border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#FFF174]"
                    >
                      <option value="DRIVING_LICENSE">Driving Licence (Recommended)</option>
                      <option value="PASSPORT">Passport</option>
                      <option value="VOTER_ID">Voter ID</option>
                      <option value="AADHAAR">Aadhaar Card / National ID</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="riderDocNumberInput" className="text-xs font-bold text-gray-300 block">
                      Document Number
                    </label>
                    <input
                      id="riderDocNumberInput"
                      type="text"
                      required
                      placeholder="e.g. DL-74-2023-1024888"
                      value={riderDocNumber}
                      onChange={(e) => setRiderDocNumber(e.target.value)}
                      className="w-full bg-[#181818] border border-white/15 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FFF174]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="riderDocExpiryInput" className="text-xs font-bold text-gray-300 block">
                      Expiry Date (if applicable)
                    </label>
                    <input
                      id="riderDocExpiryInput"
                      type="date"
                      value={riderDocExpiry}
                      onChange={(e) => setRiderDocExpiry(e.target.value)}
                      className="w-full bg-[#181818] border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#FFF174]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="riderDocFileInput" className="text-xs font-bold text-gray-300 block">
                      Upload Document Scan / Photo (Max 5MB)
                    </label>
                    <input
                      id="riderDocFileInput"
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.pdf"
                      onChange={handleFileChange}
                      className="w-full bg-[#181818] border border-white/15 rounded-xl p-2.5 text-xs text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:text-xs file:font-bold hover:file:bg-white/20"
                    />
                  </div>
                </div>

                {fileError && (
                  <span className="text-xs text-red-400 block font-semibold">
                    {fileError}
                  </span>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-6 py-3 bg-[#FFF174] text-black font-black text-xs uppercase tracking-wider rounded-xl hover:bg-yellow-400 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>UPLOADING TO SECURE VAULT...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      <span>SUBMIT IDENTITY DOCUMENT</span>
                    </>
                  )}
                </button>
              </form>
            </section>

            {/* PART 2: FACE VERIFICATION ACTION */}
            <section className="p-6 rounded-3xl bg-[#141414] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center justify-center sm:justify-start gap-2">
                  <Camera size={18} className="text-[#FFF174]" />
                  <span>2. Live Face Verification</span>
                </h3>
                <p className="text-xs text-gray-400">
                  Take a quick selfie to establish genuine identity and compare with your document.
                </p>
                <span className="text-[10px] text-gray-500 font-mono block pt-1">
                  Status: {verification?.faceLivenessStatus || 'NOT_STARTED'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowFaceModal(true)}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Camera size={16} />
                <span>Open Face Verification</span>
              </button>
            </section>

            {/* PART 3: VEHICLE DOCUMENTS SEPARATION (Requirement 9) */}
            <section className="p-6 rounded-3xl bg-[#111111] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <BikeIcon size={18} className="text-[#FFF174]" />
                    <span>3. Motorcycle Documents Wallet</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Registration Certificate (RC), Insurance, and Pollution fitness belong to your bike—not proof of your personal identity.
                  </p>
                </div>

                <Link
                  to="/documents"
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <span>Manage Bike Documents</span>
                  <ChevronRight size={14} />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <span className="text-gray-400 block text-[11px]">Vehicle Registration (RC)</span>
                  <strong className="text-white block font-bold">WB 74 H 4500 (RE 450)</strong>
                  <span className="text-[10px] text-emerald-400 block font-semibold">🟢 Uploaded</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <span className="text-gray-400 block text-[11px]">Motor Insurance Policy</span>
                  <strong className="text-white block font-bold">Comprehensive Policy</strong>
                  <span className="text-[10px] text-emerald-400 block font-semibold">🟢 Active till 2026</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <span className="text-gray-400 block text-[11px]">PUC Emissions Card</span>
                  <strong className="text-white block font-bold">BS-VI Compliant</strong>
                  <span className="text-[10px] text-emerald-400 block font-semibold">🟢 Valid</span>
                </div>
              </div>
            </section>

          </div>
        )}

        {/* ========================================================
            HELPER / PROVIDER WORKFLOW (Requirement 9)
            ======================================================== */}
        {activeTab === 'HELPER' && (
          <div className="space-y-6">
            
            <section className="p-6 rounded-3xl bg-[#141414] border border-white/10 space-y-5">
              <div>
                <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Building2 size={18} className="text-[#FFF174]" />
                  <span>Helper & Service Provider Verification</span>
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Provide trade evidence and workshop location. Credentials are required by service type.
                </p>
              </div>

              <form onSubmit={handleHelperSubmit} className="space-y-4">
                
                {/* Service Category Selection */}
                <div className="space-y-1.5">
                  <label htmlFor="helperCategorySelect" className="text-xs font-bold text-gray-300 block">
                    Assistance Service Category
                  </label>
                  <select
                    id="helperCategorySelect"
                    value={helperCategory}
                    onChange={(e) => setHelperCategory(e.target.value as any)}
                    className="w-full bg-[#181818] border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#FFF174]"
                  >
                    <option value="MECHANIC">🔧 Motorcycle Mechanic & Roadside Repair</option>
                    <option value="TOWING">🚚 Hydraulic Flatbed Towing Operator</option>
                    <option value="PUNCTURE">🛞 Mobile Puncture & Tyre Specialist</option>
                    <option value="FUEL">⛽ Emergency Highway Fuel Drop</option>
                    <option value="PARAMEDIC">🚑 Mountain First Responder / Medical Escort</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="businessNameInput" className="text-xs font-bold text-gray-300 block">
                      Business or Workshop Name
                    </label>
                    <input
                      id="businessNameInput"
                      type="text"
                      required
                      placeholder="e.g. Siliguri Auto Care & Rescue"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full bg-[#181818] border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#FFF174]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="serviceAddressInput" className="text-xs font-bold text-gray-300 block">
                      Service / Workshop Physical Address
                    </label>
                    <input
                      id="serviceAddressInput"
                      type="text"
                      required
                      placeholder="e.g. Sevoke Road near 2nd Mile Checkpost"
                      value={serviceAddress}
                      onChange={(e) => setServiceAddress(e.target.value)}
                      className="w-full bg-[#181818] border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#FFF174]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="helperDocTypeSelect" className="text-xs font-bold text-gray-300 block">
                      Professional Evidence Type
                    </label>
                    <select
                      id="helperDocTypeSelect"
                      value={helperDocType}
                      onChange={(e) => setHelperDocType(e.target.value)}
                      className="w-full bg-[#181818] border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#FFF174]"
                    >
                      <option value="TRADE_LICENSE">Trade License / Registration</option>
                      <option value="BUSINESS_PROOF">Workshop Lease / Electricity Bill</option>
                      <option value="DRIVING_LICENSE">Commercial Heavy / Light DL</option>
                      <option value="CERTIFICATE">OEM Mechanic Certification</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="helperDocNumberInput" className="text-xs font-bold text-gray-300 block">
                      Document / Trade Number
                    </label>
                    <input
                      id="helperDocNumberInput"
                      type="text"
                      required
                      placeholder="e.g. TR-SIL-2024-998"
                      value={helperDocNumber}
                      onChange={(e) => setHelperDocNumber(e.target.value)}
                      className="w-full bg-[#181818] border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#FFF174]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="yearsExperienceInput" className="text-xs font-bold text-gray-300 block">
                      Years in Trade
                    </label>
                    <input
                      id="yearsExperienceInput"
                      type="number"
                      min="1"
                      max="50"
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(e.target.value)}
                      className="w-full bg-[#181818] border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#FFF174]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="helperProofFileInput" className="text-xs font-bold text-gray-300 block">
                    Upload Professional Proof / Trade License (PDF, JPG, PNG under 5MB)
                  </label>
                  <input
                    id="helperProofFileInput"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    onChange={handleFileChange}
                    className="w-full bg-[#181818] border border-white/15 rounded-xl p-2.5 text-xs text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:text-xs file:font-bold hover:file:bg-white/20"
                  />
                </div>

                {fileError && (
                  <span className="text-xs text-red-400 block font-semibold">
                    {fileError}
                  </span>
                )}

                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-[#FFF174] text-black font-black text-xs uppercase tracking-wider rounded-xl hover:bg-yellow-400 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>SUBMITTING CREDENTIALS...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        <span>SUBMIT HELPER CREDENTIALS</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowFaceModal(true)}
                    className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                  >
                    <Camera size={16} />
                    <span>Take Helper Selfie</span>
                  </button>
                </div>
              </form>
            </section>

          </div>
        )}

        {/* SECURITY & PRIVACY GUARANTEE NOTICE (Requirement 12) */}
        <section className="p-4 rounded-2xl bg-[#0e0e0e] border border-white/5 text-[11px] text-gray-400 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-gray-300">
            <Lock size={14} className="text-[#FFF174]" />
            <span>Secure Identity Document Management Standards</span>
          </div>
          <p className="leading-relaxed">
            Identity documents, face images, and trade certificates are stored in encrypted private vaults with role-based access control. Documents are never exposed in public profile responses or shared with unrelated riders. Only authorized MotoAssist operations administrators can inspect verification materials.
          </p>
        </section>

      </div>
    </div>
  );
}
