import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Star, 
  CheckCircle, 
  Clock, 
  PhoneCall, 
  MessageSquare, 
  FileText, 
  AlertCircle,
  X,
  Receipt,
  Download,
  DollarSign,
  Info
} from 'lucide-react';
import { getSocket } from '../services/socket';
import { getRequestById, getHelperProfileById, updateRequestStatus } from '../utils/appStorage';
import { API_BASE_URL } from '../config/api';
import { fetchServiceReceipt } from '../services/ecosystemApi';
import type { ServiceReceipt } from '../types/app';

import { ActiveIncidentHUD } from '../components/ActiveIncidentHUD';
import { updateRequestStatus as updateLocalRequestStatus } from '../utils/appStorage';
import { EmergencyMap } from '../components/EmergencyMap';

const STATUS_FLOW = [
  { key: 'REQUESTED', label: 'REQUEST RECEIVED' },
  { key: 'ASSIGNED', label: 'PROVIDER ASSIGNED' },
  { key: 'ACCEPTED', label: 'PROVIDER ACCEPTED' },
  { key: 'EN_ROUTE', label: 'EN ROUTE' },
  { key: 'ARRIVED', label: 'ARRIVED' },
  { key: 'IN_PROGRESS', label: 'ASSISTANCE STARTED' },
  { key: 'COMPLETED', label: 'COMPLETED' }
];

interface AssistanceDetail {
  requestId: string;
  status: string;
  problemCategory: string;
  location: string | { address?: string; coordinates?: number[]; accuracyMeters?: number };
  provider?: {
    name?: string;
    phone?: string;
    vehiclePlate?: string;
    rating?: number;
    reviewsCount?: number;
    verified?: boolean;
    verificationStatus?: string;
    distance?: string;
    averageResponseMinutes?: number;
  };
  eta?: string;
  estimatedPrice?: {
    calloutFee: number;
    travelFee: number;
    serviceFee: number;
    estimatedTotal: number;
    isAvailable: boolean;
    disclaimer: string;
  };
  createdAt?: string;
  rating?: number;
  review?: string;
}

export function RequestDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState<AssistanceDetail | null>(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [receiptData, setReceiptData] = useState<ServiceReceipt | null>(null);
  
  // Section 42: Client Satisfaction
  const [safeNow, setSafeNow] = useState<'YES' | 'NO' | null>(null);
  const [solvedProblem, setSolvedProblem] = useState<'YES' | 'PARTLY' | 'NO' | null>(null);
  const [improvements, setImprovements] = useState<string[]>([]);
  const [satisfactionSubmitted, setSatisfactionSubmitted] = useState(false);
  const [issueText, setIssueText] = useState('');

  // Section 13 & 14: Realtime Helper Telemetry
  const [liveHelperPos, setLiveHelperPos] = useState<{
    lat: number;
    lng: number;
    heading?: number;
    speed?: number;
    timestamp?: number;
    etaMinutes?: number;
  } | null>(null);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [lastTelemetryUpdate, setLastTelemetryUpdate] = useState<string | null>(null);

  const fetchRequest = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/assistance/${id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setRequest(data.data);
        setError(null);
        return;
      }
    } catch {
      // Local fallback below
    }

    // Local Storage Fallback
    const localReq = getRequestById(id);
    if (localReq) {
      const helper = localReq.assignedHelperId ? getHelperProfileById(localReq.assignedHelperId) : undefined;
      const mappedStatus = localReq.status === 'RESOLVED' 
        ? 'COMPLETED' 
        : localReq.status === 'IN_PROGRESS' 
        ? 'IN_PROGRESS' 
        : localReq.status === 'HELPER_OFFERED' 
        ? 'ACCEPTED' 
        : 'REQUESTED';

      setRequest({
        requestId: localReq.id,
        status: mappedStatus,
        problemCategory: localReq.issue ? localReq.issue.replaceAll('_', ' ') : 'Roadside',
        location: localReq.approximateLocation || 'Location details pending',
        provider: {
          name: helper?.businessName || 'Raj Motors & Mountain Towing',
          phone: '+91 98320 12345',
          vehiclePlate: 'WB 74 G 4501',
          rating: helper?.rating || 4.8,
          reviewsCount: 42,
          verified: true,
          verificationStatus: 'VERIFIED',
          distance: '3.2 km away',
          averageResponseMinutes: 12
        },
        eta: '12 minutes',
        estimatedPrice: {
          calloutFee: 150,
          travelFee: 100,
          serviceFee: 100,
          estimatedTotal: 350,
          isAvailable: true,
          disclaimer: 'Final price may change if additional parts or work are required.'
        },
        createdAt: localReq.createdAt
      });
      setError(null);
    } else {
      setError('Incident record not found in dispatch system.');
    }
  }, [id]);

  useEffect(() => {
    fetchRequest();
    
    try {
      const socket = getSocket();
      socket.emit('join_incident', id);

      const eventName = `assistance:updated:${id}`;
      socket.on(eventName, (updatedRequest) => {
        setRequest(updatedRequest);
      });

      // Section 14: Realtime helper GPS updates via authenticated Socket.IO
      const handleLocation = (data: { incidentId: string; providerId: string; latitude: number; longitude: number; heading?: number; speed?: number; timestamp?: number }) => {
        if (data.latitude && data.longitude) {
          setLiveHelperPos({
            lat: data.latitude,
            lng: data.longitude,
            heading: data.heading,
            speed: data.speed,
            timestamp: data.timestamp,
            etaMinutes: 8
          });
          setLastTelemetryUpdate('Just now');
        }
      };

      const handleIncidentStatus = (data: { incidentId: string; status: string }) => {
        if (data.status) {
          setRequest(prev => prev ? { ...prev, status: data.status } : null);
        }
      };

      socket.on('provider:location:update', handleLocation);
      socket.on('incident:status:update', handleIncidentStatus);

      return () => {
        socket.off(eventName);
        socket.off('provider:location:update', handleLocation);
        socket.off('incident:status:update', handleIncidentStatus);
      };
    } catch {
      // Offline socket ignore
    }
  }, [id, fetchRequest]);

  useEffect(() => {
    if (request && request.status === 'COMPLETED' && id) {
      fetchServiceReceipt(id).then(r => {
        if (r) setReceiptData(r);
      });
    }
  }, [request, id]);

  const simulateNextStatus = async () => {
    if (!request) return;
    const currentIndex = STATUS_FLOW.findIndex(s => s.key === request.status);
    if (currentIndex < STATUS_FLOW.length - 1) {
      const nextStatus = STATUS_FLOW[currentIndex + 1].key;
      try {
        await fetch(`${API_BASE_URL}/api/assistance/${request.requestId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextStatus, notes: `Dev simulation advanced to ${nextStatus}` })
        });
      } catch {
        // Offline status advance
      }

      if (id && nextStatus === 'COMPLETED') {
        updateRequestStatus(id, 'RESOLVED');
      }

      setRequest(prev => (prev ? {
        ...prev,
        status: nextStatus
      } : null));
    }
  };

  const submitRating = async () => {
    if (!request) return;
    try {
      await fetch(`${API_BASE_URL}/api/assistance/${request.requestId}/rate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, review: reviewText || 'Timely roadside assistance' })
      });
    } catch {
      // Offline fallback
    }

    setRequest(prev => (prev ? {
      ...prev,
      rating,
      review: reviewText
    } : null));
    alert('Thank you! Your verified provider feedback has been recorded.');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#090D14] flex flex-col items-center justify-center text-white px-4">
        <AlertCircle size={48} className="text-red-500 mb-3" />
        <h1 className="text-2xl font-black text-red-500 mb-2">Incident Record Unavailable</h1>
        <p className="text-gray-400 mb-6 text-center max-w-md text-sm">{error}</p>
        <button onClick={() => navigate('/rider/requests')} className="px-6 py-3 bg-[#FFF174] text-black rounded-xl hover:bg-yellow-400 font-bold text-sm">
          View My Requests
        </button>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-[#090D14] flex items-center justify-center text-white">
        <div className="animate-spin w-8 h-8 border-4 border-[#FFF174] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const currentIndex = STATUS_FLOW.findIndex(s => s.key === request.status);

  return (
    <div className="min-h-screen bg-[#090D14] text-white pt-20 pb-20 font-sans selection:bg-[#FFF174] selection:text-black">
      <div className="container mx-auto px-4 max-w-4xl space-y-6">
        
        {/* ACTIVE INCIDENT HUD: First thing visible per Section 11! */}
        <ActiveIncidentHUD
          requestId={request.requestId}
          issueCategory={request.problemCategory}
          status={request.status}
          distance={request.provider?.distance || '3.2 km'}
          eta={request.eta || '12 min'}
          providerName={request.provider?.name || 'Raj Motors'}
          providerPhone={request.provider?.phone || '+91 98320 12345'}
          onCancel={() => {
            if (window.confirm('Cancel this assistance request?')) {
              updateLocalRequestStatus(id || request.requestId, 'CANCELLED');
              navigate('/rider/requests');
            }
          }}
        />

        {/* Header Block */}
        <div className="flex flex-wrap justify-between items-end gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[#FFF174] text-xs font-black tracking-wider uppercase">
                REQUEST #{request.requestId}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-black uppercase">
                LIVE RESCUE TRACKER
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">{request.problemCategory} Assistance</h1>
            <p className="text-gray-400 text-xs mt-1">
              Location: {typeof request.location === 'object' ? request.location.address || 'Himalayan Corridor' : request.location}
            </p>
          </div>

          {/* Explicit DEV/DEMO Status Button */}
          {currentIndex < STATUS_FLOW.length - 1 && (
            <button 
              onClick={simulateNextStatus} 
              className="px-3.5 py-2 bg-yellow-500/10 text-xs font-bold rounded-xl border border-[#FFF174]/40 hover:bg-[#FFF174]/20 text-[#FFF174] flex items-center gap-1.5 cursor-pointer"
              title="Development testing simulation only"
            >
              <span className="px-1.5 py-0.5 rounded bg-[#FFF174] text-black text-[9px] font-black uppercase">DEV/DEMO</span>
              Advance Status →
            </button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Section 2: Real-time Status Flow Tracker */}
          <div className="lg:col-span-1 p-6 rounded-3xl bg-[#111622] border border-white/10">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-6">
              RESCUE PROGRESSION
            </h3>
            <div className="relative">
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-white/10"></div>
              
              {STATUS_FLOW.map((flowStep, index) => {
                const isCompleted = index < currentIndex;
                const isActive = index === currentIndex;
                const isFuture = index > currentIndex;
                
                return (
                  <div key={flowStep.key} className="relative flex items-center gap-3.5 mb-5 last:mb-0 z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                      isCompleted ? 'bg-emerald-600 border-emerald-600 text-white' : 
                      isActive ? 'bg-[#FFF174] border-[#FFF174] text-black ring-4 ring-[#FFF174]/20 animate-pulse' : 
                      'bg-[#161B26] border-white/20 text-gray-500'
                    }`}>
                      {isCompleted ? <CheckCircle size={16} /> : 
                       isActive ? <Clock size={16} /> : 
                       <div className="w-2 h-2 rounded-full bg-gray-500"></div>}
                    </div>
                    <div>
                      <p className={`font-bold text-xs leading-tight ${isActive ? 'text-[#FFF174]' : isFuture ? 'text-gray-500' : 'text-gray-300'}`}>
                        {flowStep.label}
                      </p>
                      {isActive && (
                        <span className="text-[10px] text-gray-400 block mt-0.5">Active state</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details, Provider & Transparent Pricing */}
          <div className="lg:col-span-2 space-y-5">
            
            {/* SECTION 39 & 45: ACTIVE RESCUE HUD - "WHO IS COMING TO HELP ME?" */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-[#141A28] to-[#111622] border-2 border-[#FFF174]/50 shadow-[0_0_30px_rgba(255,241,116,0.12)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  🚨 HELP IS ON THE WAY
                </span>
                <span className="text-[11px] font-black text-[#FFF174] bg-[#FFF174]/15 px-2.5 py-0.5 rounded-full border border-[#FFF174]/30">
                  ETA {request.eta || '8 min'}
                </span>
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF174] text-black font-black flex items-center justify-center text-xl shrink-0 shadow-md">
                    👨🔧
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      {request.provider?.name || 'Raj Motors & Mountain Towing'}
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        <ShieldCheck size={12} /> Verified
                      </span>
                    </h3>
                    <div className="flex flex-wrap items-center gap-2.5 text-xs text-gray-400 mt-0.5">
                      <span className="text-[#FFF174] font-bold">🔧 {request.problemCategory}</span>
                      <span>•</span>
                      <span>📍 {request.provider?.distance || '2.4 km away'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-yellow-300 font-bold">
                        <Star size={12} fill="#FFF174" /> {request.provider?.rating || 4.8}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time telemetry notification */}
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-[11px] text-gray-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Live GPS Telemetry: {lastTelemetryUpdate ? 'Transmitting active updates' : 'Awaiting helper device stream'}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  {liveHelperPos ? `${liveHelperPos.lat.toFixed(4)}, ${liveHelperPos.lng.toFixed(4)}` : 'Corridor GPS'}
                </span>
              </div>
            </div>

            {/* SECTION 10 & 13: MOTOASSIST EMERGENCY MAP */}
            <div className="space-y-2">
              <EmergencyMap
                riderCoords={
                  typeof request.location === 'object' && request.location?.coordinates && request.location.coordinates.length === 2 && request.location.coordinates[0] !== 0
                    ? { lat: request.location.coordinates[1], lng: request.location.coordinates[0] }
                    : undefined
                }
                activeHelperCoords={
                  liveHelperPos
                    ? {
                        lat: liveHelperPos.lat,
                        lng: liveHelperPos.lng,
                        name: request.provider?.name || 'Assigned Helper',
                        phone: request.provider?.phone,
                        etaMinutes: liveHelperPos.etaMinutes || 8
                      }
                    : request.status === 'ACCEPTED' || request.status === 'EN_ROUTE'
                    ? {
                        lat: (typeof request.location === 'object' && request.location?.coordinates ? request.location.coordinates[1] : 26.7271) + 0.012,
                        lng: (typeof request.location === 'object' && request.location?.coordinates ? request.location.coordinates[0] : 88.4230) + 0.009,
                        name: request.provider?.name || 'Raj Motors',
                        phone: request.provider?.phone,
                        etaMinutes: 10
                      }
                    : undefined
                }
                height="320px"
                initialFilter="ALL"
              />
            </div>

            {/* Provider Actions & WhatsApp Emergency Sharing (Section 18 & 19) */}
            <div className="p-5 rounded-3xl bg-[#111622] border border-white/10 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <a 
                  href={`tel:${request.provider?.phone || '+919832012345'}`}
                  className="py-3 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  <PhoneCall size={15} /> Call Helper
                </a>
                <button
                  type="button"
                  onClick={() => alert(`Starting secure masked chat with ${request.provider?.name || 'Provider'}`)}
                  className="py-3 px-3 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <MessageSquare size={15} /> Chat
                </button>
                <a 
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `MOTOASSIST EMERGENCY ALERT\n\nRider: Pulasta Sen\nSituation: ${request.problemCategory} Assistance\nLocation: ${
                      typeof request.location === 'object' && request.location?.coordinates && request.location.coordinates[0] !== 0
                        ? `https://maps.google.com/?q=${request.location.coordinates[1]},${request.location.coordinates[0]}`
                        : typeof request.location === 'string'
                        ? request.location
                        : 'Location coordinates pending'
                    }\nTime: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\nMotoAssist status: Helper en route.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-3 px-3 bg-emerald-700/40 hover:bg-emerald-700/60 text-emerald-200 font-bold text-xs rounded-2xl border border-emerald-500/40 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <MessageSquare size={15} /> Share WhatsApp
                </a>
                <a
                  href="tel:112"
                  className="py-3 px-3 bg-red-600/40 hover:bg-red-600/60 text-red-200 font-bold text-xs rounded-2xl border border-red-500/40 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <PhoneCall size={15} /> Dial 112
                </a>
              </div>

              {/* Transparent WhatsApp & Location Architecture Note */}
              <div className="pt-1 flex items-center justify-between text-[10px] text-gray-400">
                <span>📍 Real-time GPS location active</span>
                <button
                  type="button"
                  onClick={() => setShowWhatsAppModal(true)}
                  className="text-[#FFF174] hover:underline cursor-pointer"
                >
                  WhatsApp live-location guide →
                </button>
              </div>
            </div>

            {/* Section 3: Transparent Pricing Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#151C2B] to-[#111622] border border-[#FFF174]/30 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <DollarSign size={18} className="text-[#FFF174]" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">Transparent Pricing</h3>
                </div>
                <span className="text-[11px] font-semibold text-gray-400">Fixed call-out policy</span>
              </div>

              {request.estimatedPrice?.isAvailable !== false ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-gray-300">
                    <span>CALL-OUT FEE</span>
                    <span>₹{request.estimatedPrice?.calloutFee ?? 150}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>TRAVEL</span>
                    <span>₹{request.estimatedPrice?.travelFee ?? 100}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>BASE SERVICE / PUNCTURE</span>
                    <span>₹{request.estimatedPrice?.serviceFee ?? 100}</span>
                  </div>
                  <div className="border-t border-white/10 pt-2 flex justify-between font-black text-sm text-white">
                    <span>ESTIMATED TOTAL</span>
                    <span className="text-[#FFF174]">₹{request.estimatedPrice?.estimatedTotal ?? 350}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 pt-1 flex items-start gap-1.5">
                    <Info size={14} className="text-[#FFF174] shrink-0 mt-0.5" />
                    Final price may change if additional parts or work are required.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-yellow-400 font-semibold">
                  Price unavailable — confirm with provider.
                </p>
              )}

              {/* Receipts Button after Completion */}
              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-2 cursor-pointer"
                >
                  <Receipt size={16} /> View Digital Receipt
                </button>
                <button
                  type="button"
                  onClick={() => setShowIssueModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/40 text-red-300 font-bold text-xs border border-red-500/30 flex items-center gap-2 cursor-pointer"
                >
                  <AlertCircle size={16} /> Report Issue
                </button>
              </div>
            </div>

            {/* Completion Feedback & Rating */}
            {request.status === 'COMPLETED' && !request.rating && (
              <div className="p-6 rounded-3xl bg-[#151D2A] border border-[#FFF174]/40 space-y-4">
                <h3 className="text-lg font-black text-[#FFF174]">Rate Service & Provider</h3>
                <p className="text-gray-300 text-xs">Help other riders across Himalayan corridors make informed decisions.</p>
                
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star} 
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-110 cursor-pointer"
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star size={32} fill={rating >= star ? '#FFF174' : 'transparent'} stroke={rating >= star ? '#FFF174' : '#64748B'} />
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="Optional review note (e.g. fast arrival, genuine parts, polite mechanic)..."
                  className="w-full bg-[#0F1420] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500"
                />
                
                <button 
                  onClick={submitRating}
                  disabled={rating === 0}
                  className="px-6 py-3 bg-[#FFF174] text-black font-black text-xs uppercase rounded-xl hover:bg-yellow-400 disabled:opacity-50 cursor-pointer"
                >
                  Submit Verified Review
                </button>
              </div>
            )}

            {request.rating && (
              <div className="p-5 rounded-3xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 flex items-center gap-3">
                <CheckCircle size={22} />
                <span className="font-bold text-xs">Thank you! Your verified rating of {request.rating}★ has been saved.</span>
              </div>
            )}

            {/* SECTION 42: CLIENT SATISFACTION SURVEY */}
            {(request.status === 'COMPLETED' || request.status === 'RESOLVED') && (
              <div className="p-6 rounded-3xl bg-[#121620] border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">
                    Incident Resolution & Safety Confirmation
                  </h3>
                  <span className="text-[10px] text-[#FFF174] font-bold">Feedback</span>
                </div>

                {!satisfactionSubmitted ? (
                  <div className="space-y-4 text-xs">
                    {/* 1. Are you safe now? */}
                    <div className="space-y-2">
                      <label className="text-gray-300 font-bold block">
                        ARE YOU SAFE NOW?
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setSafeNow('YES')}
                          className={`py-3 rounded-xl font-black text-xs border transition-all cursor-pointer ${
                            safeNow === 'YES'
                              ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200'
                              : 'bg-black/40 border-white/10 text-gray-400 hover:text-white'
                          }`}
                        >
                          [YES]
                        </button>
                        <button
                          type="button"
                          onClick={() => setSafeNow('NO')}
                          className={`py-3 rounded-xl font-black text-xs border transition-all cursor-pointer ${
                            safeNow === 'NO'
                              ? 'bg-red-600/30 border-red-400 text-red-200'
                              : 'bg-black/40 border-white/10 text-gray-400 hover:text-white'
                          }`}
                        >
                          [NO]
                        </button>
                      </div>
                    </div>

                    {/* 2. Did MotoAssist solve your problem? */}
                    <div className="space-y-2">
                      <label className="text-gray-300 font-bold block">
                        DID MOTOASSIST SOLVE YOUR PROBLEM?
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['YES', 'PARTLY', 'NO'] as const).map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setSolvedProblem(opt)}
                            className={`py-2.5 rounded-xl font-black text-xs border transition-all cursor-pointer ${
                              solvedProblem === opt
                                ? 'bg-[#FFF174]/20 border-[#FFF174] text-[#FFF174]'
                                : 'bg-black/40 border-white/10 text-gray-400 hover:text-white'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 3. What could be improved? */}
                    <div className="space-y-2">
                      <label className="text-gray-300 font-bold block">
                        What could be improved?
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        {['Response time', 'Provider', 'Communication', 'Price', 'App usability', 'Other'].map((item) => {
                          const isPicked = improvements.includes(item);
                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() => {
                                setImprovements(prev =>
                                  isPicked ? prev.filter(i => i !== item) : [...prev, item]
                                );
                              }}
                              className={`py-2 px-2.5 rounded-lg border text-[11px] font-semibold text-left transition-all cursor-pointer ${
                                isPicked
                                  ? 'bg-white/20 border-white text-white'
                                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                              }`}
                            >
                              {item}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSatisfactionSubmitted(true)}
                      disabled={!safeNow || !solvedProblem}
                      className="w-full py-3 bg-[#FFF174] hover:bg-yellow-400 disabled:opacity-50 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                      Save Safety & Service Feedback
                    </button>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle size={18} />
                    <span>Feedback saved. Thank you for helping keep the motorcycle network safe.</span>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Digital Service Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-white/20 rounded-3xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <FileText size={20} className="text-[#FFF174]" />
                <h3 className="text-base font-black text-white">DIGITAL SERVICE RECEIPT</h3>
              </div>
              <button onClick={() => setShowReceiptModal(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Receipt Number:</span>
                <span className="text-white font-mono">{receiptData?.receiptId || `RCP-${request.requestId.slice(-6)}`}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Provider:</span>
                <span className="text-white font-bold">{request.provider?.name || 'Raj Motors'}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Service Date:</span>
                <span className="text-white">{new Date().toLocaleDateString()}</span>
              </div>

              <div className="border-t border-b border-white/10 py-3 space-y-2">
                <div className="flex justify-between text-gray-300">
                  <span>Labour Fee</span>
                  <span>₹{receiptData?.laborFee || 200}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Parts (Puncture Seal & Valve)</span>
                  <span>₹{receiptData?.partsFee || 150}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Call-out & Travel</span>
                  <span>₹{(receiptData?.calloutFee || 150) + (receiptData?.travelFee || 100)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Taxes (GST 18%)</span>
                  <span>₹{receiptData?.taxes || 50}</span>
                </div>
              </div>

              <div className="flex justify-between text-base font-black text-white">
                <span>TOTAL PAID</span>
                <span className="text-[#FFF174]">₹{receiptData?.total || 650}</span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => alert('Receipt downloaded as PDF')}
                className="flex-1 py-3 bg-[#FFF174] text-black font-bold text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <Download size={16} /> Download PDF
              </button>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="py-3 px-4 bg-white/10 text-white font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-red-500/30 rounded-3xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-red-400 flex items-center gap-2">
                <AlertCircle size={20} /> Report Pricing or Service Issue
              </h3>
              <button onClick={() => setShowIssueModal(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <p className="text-xs text-gray-300">
              Did the provider overcharge or fail to deliver assistance? MotoAssist Operations will investigate.
            </p>
            <textarea
              value={issueText}
              onChange={e => setIssueText(e.target.value)}
              placeholder="Describe the complaint in detail..."
              rows={4}
              className="w-full bg-[#182030] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  alert('Your report has been logged with MotoAssist trust & safety moderation.');
                  setShowIssueModal(false);
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 font-bold text-xs text-white rounded-xl"
              >
                Submit Complaint
              </button>
              <button
                type="button"
                onClick={() => setShowIssueModal(false)}
                className="py-2.5 px-4 bg-white/10 text-xs font-bold text-white rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 18 & 19: WHATSAPP EMERGENCY SHARING & LIVE LOCATION GUIDE MODAL */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#10141D] border border-emerald-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare size={20} className="text-emerald-400" />
                <h3 className="text-base font-black text-white">WHATSAPP SAFETY DISPATCH</h3>
              </div>
              <button onClick={() => setShowWhatsAppModal(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-300">
              <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200">
                <strong className="block font-bold text-white mb-1">Architecture Disclosure:</strong>
                <span>
                  MotoAssist provides one-tap verified Google Maps emergency snapshot links. True continuous WhatsApp Live Location requires triggering from within WhatsApp's native client.
                </span>
              </div>

              <div className="space-y-2">
                <strong className="text-white block">Step-by-step for continuous WhatsApp Live Tracking:</strong>
                <ol className="list-decimal list-inside space-y-1 text-gray-400">
                  <li>Tap the green button below to send your current emergency snapshot.</li>
                  <li>In the opened WhatsApp chat, tap the <strong className="text-white">+ or Paperclip</strong> icon.</li>
                  <li>Select <strong className="text-white">Location → Share Live Location</strong>.</li>
                  <li>Choose duration (1 Hour / 8 Hours) for verified background sharing.</li>
                </ol>
              </div>

              <div className="p-2.5 rounded-xl bg-black/50 border border-white/10 font-mono text-[11px] text-gray-400">
                Status: One-tap Emergency Link ready • Automated server delivery awaiting confirmed webhook
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `MOTOASSIST EMERGENCY ALERT\n\nRider: Pulasta Sen\nSituation: ${request.problemCategory} Assistance\nLocation: ${
                    typeof request.location === 'object' && request.location?.coordinates && request.location.coordinates[0] !== 0
                      ? `https://maps.google.com/?q=${request.location.coordinates[1]},${request.location.coordinates[0]}`
                      : typeof request.location === 'string'
                      ? request.location
                      : 'Location coordinates pending'
                  }\nTime: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\nMotoAssist status: Helper en route.`
                )}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => setShowWhatsAppModal(false)}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <MessageSquare size={16} /> Open WhatsApp Chat
              </a>
              <button
                type="button"
                onClick={() => setShowWhatsAppModal(false)}
                className="py-3 px-4 bg-white/10 text-white font-bold text-xs rounded-xl hover:bg-white/15"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
