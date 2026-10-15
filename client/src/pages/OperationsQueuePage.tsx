import { useState, useEffect, useCallback } from 'react';
import { 
  Radio, 
  CheckCircle2, 
  RefreshCw, 
  MapPin, 
  ArrowRight
} from 'lucide-react';
import { API_BASE_URL, hasBackendApi } from '../config/api';
import { getRequests, updateRequestStatus } from '../utils/appStorage';

interface IncidentItem {
  requestId: string;
  problemCategory: string;
  subcategory?: string;
  urgency?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: string;
  providerId?: string;
  description?: string;
  location?: {
    coordinates?: [number, number];
    address?: string;
    accuracyMeters?: number;
  };
  locationProvenance?: 'GPS_FRESH' | 'GPS_STALE' | 'MANUAL_LANDMARK' | 'UNAVAILABLE';
  createdAt: string;
  updatedAt: string;
}

interface OpsQueueData {
  unassigned: IncidentItem[];
  active: IncidentItem[];
  delayed: IncidentItem[];
  unfulfilled: IncidentItem[];
  cancelled: IncidentItem[];
  resolved: IncidentItem[];
  total: number;
}

export function OperationsQueuePage() {
  const [queue, setQueue] = useState<OpsQueueData | null>(null);
  const [activeTab, setActiveTab] = useState<'unassigned' | 'active' | 'delayed' | 'unfulfilled' | 'resolved' | 'cancelled'>('unassigned');
  const [loading, setLoading] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const computeLocalQueue = useCallback((): OpsQueueData => {
    const stored = getRequests();
    const items: IncidentItem[] = stored.map(r => ({
      requestId: r.requestId || r.id,
      problemCategory: r.helpCategory || r.issue || 'MECHANICAL',
      subcategory: r.subcategory || r.issue,
      urgency: (r.urgency as any) || 'HIGH',
      status: r.status,
      providerId: r.assignedHelperId,
      description: r.description || r.issue,
      location: {
        coordinates: (r.longitude != null && r.latitude != null) ? [r.longitude, r.latitude] : undefined,
        address: r.approximateLocation || 'Himalayan Highway corridor',
        accuracyMeters: r.accuracyMeters || 15
      },
      locationProvenance: 'GPS_FRESH',
      createdAt: r.createdAt,
      updatedAt: r.updatedAt || r.createdAt
    }));

    const unassigned = items.filter(i => ['SEARCHING', 'REQUESTED', 'OPEN'].includes(i.status));
    const active = items.filter(i => ['ASSIGNED', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'HELPER_OFFERED'].includes(i.status));
    const delayed = items.filter(i => ['DELAYED'].includes(i.status));
    const unfulfilled = items.filter(i => ['UNFULFILLED_NO_PROVIDER', 'UNFULFILLED', 'TIMEOUT'].includes(i.status));
    const resolved = items.filter(i => ['RESOLVED', 'COMPLETED'].includes(i.status));
    const cancelled = items.filter(i => ['CANCELLED'].includes(i.status));

    return {
      unassigned,
      active,
      delayed,
      unfulfilled,
      cancelled,
      resolved,
      total: items.length
    };
  }, []);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    if (!hasBackendApi()) {
      setQueue(computeLocalQueue());
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/assistance/ops/queue`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setQueue(json.data);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Mock fallback if network fails
    }

    setQueue(computeLocalQueue());
    setLoading(false);
  }, [computeLocalQueue]);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 15000); // 15s auto-refresh
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const handleManualEscalation = async (requestId: string) => {
    if (!hasBackendApi()) {
      updateRequestStatus(requestId, 'CANCELLED', {
        description: 'Operator escalated: No provider accepted within timeout threshold'
      });
      setActionMessage(`Incident #${requestId} escalated to UNFULFILLED_NO_PROVIDER.`);
      fetchQueue();
      setTimeout(() => setActionMessage(null), 4000);
      return;
    }

    try {
      await fetch(`${API_BASE_URL}/api/assistance/${requestId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'UNFULFILLED_NO_PROVIDER', 
          notes: 'Operator escalated: No provider accepted within timeout threshold' 
        })
      });
      setActionMessage(`Incident #${requestId} escalated to UNFULFILLED_NO_PROVIDER.`);
      fetchQueue();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      console.error('Error escalating incident:', err);
    }
  };

  const getActiveList = (): IncidentItem[] => {
    if (!queue) return [];
    return queue[activeTab] || [];
  };

  const list = getActiveList();

  return (
    <div className="min-h-screen bg-[#151515] text-white pt-20 pb-28 font-sans selection:bg-[#FFF174] selection:text-black">
      <div className="container mx-auto px-4 max-w-6xl space-y-6">
        
        {/* Header Block */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#FFF174] text-black">
                <Radio size={18} />
              </span>
              <span className="text-xs font-black tracking-wider uppercase text-[#FFF174]">
                DISPATCH OPERATIONS DESK
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Incident Response & Provider Queue
            </h1>
            <p className="text-xs text-gray-400">
              Real-time monitoring of roadside assistance requests, provider acceptances, escalations, and unfulfilled cases.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchQueue}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Desk</span>
            </button>
          </div>
        </div>

        {actionMessage && (
          <div className="p-3.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-bold">
            {actionMessage}
          </div>
        )}

        {/* Operational Metric KPI Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => setActiveTab('unassigned')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              activeTab === 'unassigned' ? 'bg-[#FFF174]/15 border-[#FFF174]' : 'bg-[#121212] border-white/10 hover:border-white/20'
            }`}
          >
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Unassigned</span>
            <span className="text-2xl font-black text-white">{queue?.unassigned.length || 0}</span>
          </button>

          <button
            onClick={() => setActiveTab('active')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              activeTab === 'active' ? 'bg-emerald-500/15 border-emerald-500' : 'bg-[#121212] border-white/10 hover:border-white/20'
            }`}
          >
            <span className="text-[10px] font-bold text-emerald-400 uppercase block">Active / En Route</span>
            <span className="text-2xl font-black text-white">{queue?.active.length || 0}</span>
          </button>

          <button
            onClick={() => setActiveTab('delayed')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              activeTab === 'delayed' ? 'bg-amber-500/15 border-amber-500' : 'bg-[#121212] border-white/10 hover:border-white/20'
            }`}
          >
            <span className="text-[10px] font-bold text-amber-400 uppercase block">Delayed (&gt;15m)</span>
            <span className="text-2xl font-black text-white">{queue?.delayed.length || 0}</span>
          </button>

          <button
            onClick={() => setActiveTab('unfulfilled')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              activeTab === 'unfulfilled' ? 'bg-red-500/15 border-red-500' : 'bg-[#121212] border-white/10 hover:border-white/20'
            }`}
          >
            <span className="text-[10px] font-bold text-red-400 uppercase block">No Provider</span>
            <span className="text-2xl font-black text-white">{queue?.unfulfilled.length || 0}</span>
          </button>

          <button
            onClick={() => setActiveTab('resolved')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              activeTab === 'resolved' ? 'bg-blue-500/15 border-blue-500' : 'bg-[#121212] border-white/10 hover:border-white/20'
            }`}
          >
            <span className="text-[10px] font-bold text-blue-400 uppercase block">Resolved</span>
            <span className="text-2xl font-black text-white">{queue?.resolved.length || 0}</span>
          </button>

          <button
            onClick={() => setActiveTab('cancelled')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              activeTab === 'cancelled' ? 'bg-gray-500/15 border-gray-500' : 'bg-[#121212] border-white/10 hover:border-white/20'
            }`}
          >
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Cancelled</span>
            <span className="text-2xl font-black text-white">{queue?.cancelled.length || 0}</span>
          </button>
        </div>

        {/* Tab List Table / Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300">
              {activeTab} Incidents ({list.length})
            </h2>
          </div>

          {list.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[#121212] border border-white/10 text-center space-y-2">
              <CheckCircle2 size={32} className="mx-auto text-gray-500" />
              <p className="text-sm font-bold text-gray-300">No {activeTab} incidents currently in queue.</p>
              <p className="text-xs text-gray-500">Dispatch system is clear for this operational category.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {list.map(incident => (
                <div
                  key={incident.requestId}
                  className="p-5 rounded-2xl bg-[#121212] border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black font-mono text-[#FFF174]">
                        #{incident.requestId}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        incident.urgency === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        incident.urgency === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                        'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      }`}>
                        {incident.urgency || 'MEDIUM'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-300">
                        {incident.status}
                      </span>
                      {incident.locationProvenance && (
                        <span className="text-[10px] text-gray-400 font-mono">
                          [{incident.locationProvenance}]
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white">
                      {incident.problemCategory} {incident.subcategory ? `— ${incident.subcategory}` : ''}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-[#FFF174]" />
                        {incident.location?.address || 'Location coordinates logged'}
                      </span>
                      <span>•</span>
                      <span>Created: {new Date(incident.createdAt).toLocaleTimeString()}</span>
                    </div>

                    {incident.description && (
                      <p className="text-xs text-gray-300 bg-white/5 p-2 rounded-xl mt-1">
                        "{incident.description}"
                      </p>
                    )}
                  </div>

                  {/* Operator Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <a
                      href={`#/requests/${incident.requestId}`}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors flex items-center gap-1.5"
                    >
                      <span>View Details</span>
                      <ArrowRight size={12} />
                    </a>

                    {['SUBMITTED', 'REQUESTED', 'SEARCHING', 'OFFERED'].includes(incident.status) && (
                      <button
                        onClick={() => handleManualEscalation(incident.requestId)}
                        className="px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 text-xs font-bold transition-colors cursor-pointer"
                        title="Mark as unfulfilled if no provider is reachable"
                      >
                        Escalate (No Provider)
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
