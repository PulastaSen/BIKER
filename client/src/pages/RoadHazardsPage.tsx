import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  MapPin, 
  ThumbsUp, 
  Plus, 
  ArrowLeft, 
  Clock, 
  Loader2
} from 'lucide-react';
import { fetchRoadHazards, reportRoadHazard, upvoteRoadHazard, resolveRoadHazard } from '../services/ecosystemApi';
import type { RoadHazard, RoadHazardType } from '../types/app';

const HAZARD_TYPES: Array<{ type: RoadHazardType; label: string; desc: string }> = [
  { type: 'LANDSLIDE', label: 'Landslide Rubble', desc: 'Active hill slips, rocks or mud on road' },
  { type: 'OIL_SPILL', label: 'Oil / Diesel Spill', desc: 'Severe slipperiness on bends or tarmac' },
  { type: 'POTHOLE', label: 'Severe Pothole', desc: 'Rim-bending depth or broken tarmac' },
  { type: 'ACCIDENT', label: 'Accident Scene', desc: 'Vehicle collision obstructing lanes' },
  { type: 'FLOODING', label: 'Waterlogging / Flood', desc: 'Deep water crossing or washed culvert' },
  { type: 'ROAD_CLOSURE', label: 'Road Blocked / Closed', desc: 'Barricade, tree fall or landslide closure' },
  { type: 'DEBRIS', label: 'Gravel / Sand Debris', desc: 'Loose gravel from construction' },
  { type: 'HEAVY_FOG', label: 'Dense Blind Fog', desc: 'Visibility below 10 meters' },
  { type: 'ANIMAL_HAZARD', label: 'Animal Crossing', desc: 'Elephants, cattle or wildlife on highway' },
  { type: 'DANGEROUS_SECTION', label: 'Dangerous Blind Corner', desc: 'Unmarked cliff edge or missing crash barrier' }
];

export function RoadHazardsPage() {
  const navigate = useNavigate();
  const [hazards, setHazards] = useState<RoadHazard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');

  // Form State
  const [hazardType, setHazardType] = useState<RoadHazardType>('LANDSLIDE');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [landmark, setLandmark] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadHazards = () => {
    fetchRoadHazards().then(data => {
      setHazards(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadHazards();
  }, []);

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    let coords: [number, number] = [88.4350, 26.8990]; // Sevoke default
    if ('geolocation' in navigator) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        coords = [pos.coords.longitude, pos.coords.latitude];
      } catch {
        // default
      }
    }

    await reportRoadHazard({
      hazardType,
      description,
      severity,
      location: { coordinates: coords, landmark: landmark || 'Highway Sector' }
    });

    setSubmitting(false);
    setShowReportModal(false);
    setDescription('');
    setLandmark('');
    loadHazards();
  };

  const handleUpvote = async (id: string) => {
    await upvoteRoadHazard(id);
    loadHazards();
  };

  const handleResolve = async (id: string) => {
    if (window.confirm('Mark this road hazard as resolved / cleared?')) {
      await resolveRoadHazard(id);
      loadHazards();
    }
  };

  const filteredHazards = filterType === 'ALL'
    ? hazards
    : hazards.filter(h => h.hazardType === filterType);

  return (
    <div className="min-h-screen bg-[#07090E] text-white pt-20 pb-24 font-sans selection:bg-[#FFF174] selection:text-black">
      <div className="container mx-auto px-4 max-w-3xl">
        
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
            onClick={() => setShowReportModal(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg active:scale-95 cursor-pointer"
          >
            <Plus size={16} /> Report Road Hazard
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 flex items-center justify-center shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">ROAD HAZARD INTELLIGENCE</h1>
            <p className="text-gray-400 text-xs mt-0.5">
              Live rider-reported obstacles, landslides, oil slicks, and potholes across Himalayan and highway routes.
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterType === 'ALL' ? 'bg-[#FFF174] text-black' : 'bg-[#111622] text-gray-400 border border-white/10'
            }`}
          >
            All Hazards ({hazards.length})
          </button>
          {HAZARD_TYPES.slice(0, 6).map(ht => (
            <button
              key={ht.type}
              onClick={() => setFilterType(ht.type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filterType === ht.type ? 'bg-[#FFF174] text-black' : 'bg-[#111622] text-gray-400 border border-white/10'
              }`}
            >
              {ht.label}
            </button>
          ))}
        </div>

        {/* Hazards List */}
        {loading ? (
          <div className="py-12 text-center">
            <Loader2 size={32} className="animate-spin text-[#FFF174] mx-auto" />
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredHazards.map(hazard => {
              const isCritical = hazard.severity === 'CRITICAL' || hazard.severity === 'HIGH';
              return (
                <div
                  key={hazard.id}
                  className={`p-5 rounded-3xl border transition-all ${
                    hazard.status === 'RESOLVED'
                      ? 'bg-[#111622]/50 border-white/5 opacity-60'
                      : isCritical
                      ? 'bg-[#141824] border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.1)]'
                      : 'bg-[#111622] border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          hazard.severity === 'CRITICAL' ? 'bg-red-600 text-white animate-pulse' :
                          hazard.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {hazard.severity} SEVERITY
                        </span>
                        <strong className="text-sm font-bold text-white">{hazard.hazardType.replace('_', ' ')}</strong>
                        {hazard.status === 'RESOLVED' && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            ✓ Cleared
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-300 mt-1.5">{hazard.description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                        <span className="flex items-center gap-1 text-gray-300 font-medium">
                          <MapPin size={12} className="text-[#FFF174]" /> {hazard.location.landmark || 'Highway Sector'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {new Date(hazard.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleUpvote(hazard.id)}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer active:scale-95"
                        title="Confirm hazard is still present"
                      >
                        <ThumbsUp size={13} className="text-[#FFF174]" /> Still Present ({hazard.upvotes})
                      </button>

                      {hazard.status !== 'RESOLVED' && (
                        <button
                          type="button"
                          onClick={() => handleResolve(hazard.id)}
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                        >
                          Mark Cleared
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleReport} className="bg-[#111622] border border-white/20 rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <AlertTriangle size={20} className="text-red-500" /> Report Road Hazard
            </h3>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Hazard Category</label>
              <select
                value={hazardType}
                onChange={e => setHazardType(e.target.value as RoadHazardType)}
                className="w-full bg-[#182030] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              >
                {HAZARD_TYPES.map(ht => (
                  <option key={ht.type} value={ht.type}>{ht.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Severity</label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value as typeof severity)}
                className="w-full bg-[#182030] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="CRITICAL">CRITICAL (Road blocked / severe danger)</option>
                <option value="HIGH">HIGH (Serious skid or rim damage risk)</option>
                <option value="MEDIUM">MEDIUM (Caution required)</option>
                <option value="LOW">LOW (Minor surface issue)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Highway / Landmark Description</label>
              <input
                type="text"
                required
                value={landmark}
                onChange={e => setLandmark(e.target.value)}
                placeholder="e.g. NH-10 after Coronation Bridge near 29th Mile"
                className="w-full bg-[#182030] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Hazard Details</label>
              <textarea
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe condition (e.g. wet diesel spill across corner, sharp rock debris in right lane)..."
                rows={3}
                className="w-full bg-[#182030] border border-white/10 rounded-xl p-3 text-xs text-white"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 font-bold text-xs text-white rounded-xl"
              >
                Broadcast Hazard Report
              </button>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="py-3 px-4 bg-white/10 text-white font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
