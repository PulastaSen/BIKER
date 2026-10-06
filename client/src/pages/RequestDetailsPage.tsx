import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Star, Wrench, CheckCircle, Clock } from 'lucide-react';
import { getSocket } from '../services/socket';
import { getRequestById, getHelperProfileById, updateRequestStatus } from '../utils/appStorage';

const STATUS_FLOW = [
  'REQUESTED',
  'ACCEPTED',
  'EN_ROUTE',
  'ARRIVED',
  'IN_PROGRESS',
  'COMPLETED'
];

export function RequestDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchRequest = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`http://localhost:5000/api/assistance/${id}`);
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
        location: localReq.approximateLocation || 'Siliguri NH-10 Highway Corridor',
        provider: {
          name: helper?.businessName || 'Himalayan Moto Works & Towing',
          phone: '+91 98320 12345',
          vehiclePlate: 'WB 74 G 4501',
          rating: helper?.rating || 4.9,
          reviewsCount: 38
        },
        eta: '12-18 mins',
        createdAt: localReq.createdAt
      });
      setError(null);
    } else {
      setError('Incident record not found in system.');
    }
  }, [id]);

  useEffect(() => {
    fetchRequest();
    
    try {
      const socket = getSocket();
      const eventName = `assistance:updated:${id}`;
      socket.on(eventName, (updatedRequest) => {
        setRequest(updatedRequest);
      });

      return () => {
        socket.off(eventName);
      };
    } catch {
      // Offline socket ignore
    }
  }, [id, fetchRequest]);

  const simulateNextStatus = async () => {
    if (!request) return;
    const currentIndex = STATUS_FLOW.indexOf(request.status);
    if (currentIndex < STATUS_FLOW.length - 1) {
      const nextStatus = STATUS_FLOW[currentIndex + 1];
      try {
        await fetch(`http://localhost:5000/api/assistance/${request.requestId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextStatus })
        });
      } catch {
        // Offline status advance
      }

      if (id && nextStatus === 'COMPLETED') {
        updateRequestStatus(id, 'RESOLVED');
      }

      setRequest((prev: any) => ({
        ...prev,
        status: nextStatus
      }));
    }
  };

  const submitRating = async () => {
    if (!request) return;
    try {
      await fetch(`http://localhost:5000/api/assistance/${request.requestId}/rate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, review: 'Great rapid roadside service' })
      });
    } catch {
      // Offline fallback
    }

    setRequest((prev: any) => ({
      ...prev,
      rating
    }));
    alert('Thank you! Your feedback has been recorded.');
    navigate('/rider/requests');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#090909] flex flex-col items-center justify-center text-white px-4">
        <h1 className="text-4xl font-black text-[#EF4444] mb-3">Incident Unavailable</h1>
        <p className="text-gray-400 mb-6 text-center max-w-md">{error}</p>
        <button onClick={() => navigate('/rider/requests')} className="px-6 py-3 bg-[#FFF174] text-black rounded-xl hover:bg-yellow-400 font-bold">
          VIEW MY REQUESTS
        </button>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-[#090909] flex items-center justify-center text-white">
        <div className="animate-spin w-8 h-8 border-4 border-[#FFF174] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const currentIndex = STATUS_FLOW.indexOf(request.status);

  return (
    <div className="min-h-screen bg-[#090909] text-white pt-24 pb-12 font-sans selection:bg-[#FFF174] selection:text-black">
      <div className="container mx-auto px-4 max-w-4xl">
        
        <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
          <div>
            <p className="text-[#FFF174] text-xs font-black tracking-wider uppercase mb-1">INCIDENT #{request.requestId}</p>
            <h1 className="text-3xl font-black">{request.problemCategory} Assistance</h1>
            <p className="text-gray-400 text-xs mt-1">Status: {request.status.replace('_', ' ')} • ETA: {request.eta || '15 mins'}</p>
          </div>
          {currentIndex < STATUS_FLOW.length - 1 && (
            <button 
              onClick={simulateNextStatus} 
              className="px-4 py-2 bg-white/10 text-xs font-bold rounded-xl border border-white/20 hover:bg-white/20 text-[#FFF174]"
            >
              Advance Dispatch Status →
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Tracking Timeline */}
          <div className="md:col-span-1 p-6 rounded-2xl bg-[#111111] border border-white/10">
            <h3 className="text-sm font-black uppercase tracking-wider text-gray-400 mb-6">Status Timeline</h3>
            <div className="relative">
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-white/10"></div>
              
              {STATUS_FLOW.map((status, index) => {
                const isCompleted = index < currentIndex;
                const isActive = index === currentIndex;
                const isFuture = index > currentIndex;
                
                return (
                  <div key={status} className="relative flex items-center gap-4 mb-7 last:mb-0 z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                      isCompleted ? 'bg-[#22C55E] border-[#22C55E] text-white' : 
                      isActive ? 'bg-[#FFF174] border-[#FFF174] text-black ring-4 ring-[#FFF174]/20 animate-pulse' : 
                      'bg-[#161616] border-white/20 text-gray-500'
                    }`}>
                      {isCompleted ? <CheckCircle size={16} /> : 
                       isActive ? <Clock size={16} /> : 
                       <div className="w-2 h-2 rounded-full bg-gray-500"></div>}
                    </div>
                    <div>
                      <p className={`font-bold text-sm ${isActive ? 'text-[#FFF174]' : isFuture ? 'text-gray-500' : 'text-gray-300'}`}>
                        {status.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details & Live Map */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Live Map Embed */}
            <div className="h-64 rounded-2xl bg-[#111111] border border-white/10 relative overflow-hidden">
              <iframe
                title="Incident Location Map"
                className="w-full h-full border-0"
                loading="lazy"
                src="https://maps.google.com/maps?q=26.7271,88.3953&z=14&output=embed"
              ></iframe>
            </div>

            {/* Provider Info */}
            <div className="p-6 rounded-2xl bg-[#111111] border border-white/10">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">DISPATCHED MECHANIC</h3>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#FFF174]/10 text-[#FFF174] flex items-center justify-center shrink-0">
                  <Wrench size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold flex items-center gap-2">
                    {request.provider?.name || 'Himalayan Moto Works & Towing'} 
                    <ShieldCheck size={18} className="text-[#22C55E]" />
                  </h4>
                  <p className="text-gray-400 text-xs">
                    {request.provider?.vehiclePlate ? `Vehicle: ${request.provider.vehiclePlate} • ` : ''} 
                    {request.provider?.phone || '+91 98320 12345'}
                  </p>
                </div>
                <a 
                  href={`tel:${request.provider?.phone || '+919832012345'}`}
                  className="px-4 py-2 bg-emerald-500/20 text-emerald-400 font-bold text-xs rounded-xl border border-emerald-500/30 hover:bg-emerald-500/30"
                >
                  Call
                </a>
              </div>
            </div>

            {/* Completion & Rating State */}
            {request.status === 'COMPLETED' && !request.rating && (
              <div className="p-6 rounded-2xl bg-gradient-to-r from-[#FFF174]/10 to-transparent border border-[#FFF174]/30 animate-fade-in">
                <h3 className="text-xl font-black text-[#FFF174] mb-2">Service Completed</h3>
                <p className="text-gray-300 text-sm mb-4">How was your roadside assistance experience?</p>
                
                <div className="flex gap-2 mb-6">
                  {[1,2,3,4,5].map(star => (
                    <button 
                      key={star} 
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-110"
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star size={32} fill={rating >= star ? '#FFF174' : 'transparent'} stroke={rating >= star ? '#FFF174' : '#64748B'} />
                    </button>
                  ))}
                </div>
                
                <button 
                  onClick={submitRating}
                  disabled={rating === 0}
                  className="px-6 py-3 bg-[#FFF174] text-black font-black text-sm rounded-xl hover:bg-yellow-400 disabled:opacity-50"
                >
                  SUBMIT REVIEW
                </button>
              </div>
            )}

            {request.rating && (
              <div className="p-6 rounded-2xl bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] flex items-center gap-3">
                <CheckCircle size={20} />
                <span className="font-bold text-sm">Thank you! Your feedback has been recorded.</span>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
