import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  PhoneCall, 
  Navigation, 
  MapPin, 
  RefreshCw, 
  Star, 
  ShieldCheck,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useUserLocation } from '../hooks/useUserLocation';
import { API_BASE_URL } from '../config/api';

export type ProviderFilter = 'all' | 'mechanic' | 'oem';

export interface ProviderItem {
  id: string;
  name: string;
  type: 'mechanic' | 'oem';
  lat: number;
  lng: number;
  rating: number;
  isDemo?: boolean;
  phone: string;
  address: string;
  services: string[];
  open?: boolean;
}

// Seeded local fallback providers (labeled explicitly as DEMO PROVIDER)
const DEMO_PROVIDERS: ProviderItem[] = [
  {
    id: 'demo-ktm',
    name: 'KTM & Husqvarna Service Centre',
    type: 'oem',
    address: 'Sevoke Road, 2nd Mile, WB 734001',
    lat: 26.7412,
    lng: 88.4285,
    phone: '+91 98320 11223',
    rating: 4.8,
    isDemo: true,
    services: ['WP Suspension', 'KTM Diagnostics', 'Engine Overhaul']
  },
  {
    id: 'demo-re',
    name: 'Royal Enfield Authorized Highway Care',
    type: 'oem',
    address: 'Near Checkpost, Sevoke Road, WB 734008',
    lat: 26.7350,
    lng: 88.4310,
    phone: '+91 98321 44556',
    rating: 4.7,
    isDemo: true,
    services: ['Himalayan 450 Diagnostics', 'Spoke Rim Truing', 'Tripper Nav']
  },
  {
    id: 'demo-mech-fast',
    name: 'Siliguri 2-Wheeler Rescue Hub',
    type: 'mechanic',
    address: 'Sevoke More Junction, WB 734001',
    lat: 26.7271,
    lng: 88.3953,
    phone: '+91 94340 12345',
    rating: 4.8,
    isDemo: true,
    services: ['Tubeless Puncture', 'Clutch Cable Replace', 'Chain Link Fix']
  },
  {
    id: 'demo-himalayan-ridge',
    name: 'Himalayan Ridge Mountain Moto Workshop',
    type: 'mechanic',
    address: 'Near Salugara, Sevoke Road, WB 734008',
    lat: 26.7550,
    lng: 88.4520,
    phone: '+91 94341 67890',
    rating: 4.9,
    isDemo: true,
    services: ['High Altitude Tuning', 'Brake Bleeding', 'Suspension Repair']
  },
  {
    id: 'demo-teesta-rescue',
    name: 'Teesta River Emergency Mountain Repair',
    type: 'mechanic',
    address: 'Teesta Bazaar Junction, NH-10 Highway, WB 734312',
    lat: 27.0594,
    lng: 88.4695,
    phone: '+91 94342 98765',
    rating: 4.8,
    isDemo: true,
    services: ['Highway Rescue', 'Landslide Recovery', 'Battery Jump-Start']
  }
];

function computeDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function NearbyServicesPage() {
  const navigate = useNavigate();

  const {
    coords,
    accuracy,
    status: locStatus,
    updatedText,
    errorReason,
    requestLocation,
    setSearchLocation,
  } = useUserLocation(true);

  const [filter, setFilter] = useState<ProviderFilter>('all');
  const [providers, setProviders] = useState<ProviderItem[]>(DEMO_PROVIDERS);
  const [selectedProvider, setSelectedProvider] = useState<ProviderItem | null>(null);
  const [searchPlace, setSearchPlace] = useState('');
  const [mobileSheetOpen, setMobileSheetOpen] = useState(true);

  // Fetch real backend providers if location is known
  useEffect(() => {
    if (coords) {
      fetch(`${API_BASE_URL}/api/assistance/providers/nearby?lat=${coords.lat}&lng=${coords.lng}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data && data.data.length > 0) {
            const mapped = data.data.map((p: any) => ({
              id: p.id || p._id,
              name: p.name || p.businessName,
              type: (p.type || 'mechanic') as 'mechanic' | 'oem',
              lat: p.location?.coordinates ? p.location.coordinates[1] : 26.74,
              lng: p.location?.coordinates ? p.location.coordinates[0] : 88.42,
              rating: p.rating || 4.8,
              isDemo: false,
              phone: p.phone || '+91 98320 12345',
              address: p.address || 'Himalayan Highway Corridor',
              services: p.services || ['Breakdown Repair', 'Puncture Plug', 'Emergency Fuel'],
            }));
            setProviders(mapped);
          }
        })
        .catch(() => {
          // Keep demo providers labeled as demo
        });
    }
  }, [coords]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchPlace.trim().length > 2) {
      setSearchLocation(searchPlace.trim());
    }
  };

  // Filtered providers
  const filtered = providers.filter((p) => filter === 'all' || p.type === filter);

  // Compute distance only if real user coordinates exist
  const providersWithDistance = filtered.map((p) => {
    let distanceStr = 'Location needed';
    let distanceVal = 9999;
    if (coords) {
      const d = computeDistanceKm(coords.lat, coords.lng, p.lat, p.lng);
      distanceVal = d;
      distanceStr = d < 1 ? `${Math.round(d * 1000)} m` : `${d} km`;
    }
    return { ...p, distanceStr, distanceVal };
  }).sort((a, b) => a.distanceVal - b.distanceVal);

  const activeProvider = selectedProvider || providersWithDistance[0];

  // Map Iframe URL
  const mapQuery = activeProvider
    ? encodeURIComponent(`${activeProvider.name}, ${activeProvider.address}`)
    : coords
    ? `${coords.lat},${coords.lng}`
    : '26.7271,88.3953';

  const mapSrc = `https://maps.google.com/maps?q=${mapQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col font-sans selection:bg-[#FFF174] selection:text-black">
      
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#090909]/95 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> Back
          </button>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filter === 'all' ? 'bg-[#FFF174] text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              All Help
            </button>
            <button
              type="button"
              onClick={() => setFilter('mechanic')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filter === 'mechanic' ? 'bg-[#FFF174] text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Mechanics
            </button>
            <button
              type="button"
              onClick={() => setFilter('oem')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filter === 'oem' ? 'bg-[#FFF174] text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              OEM Centers
            </button>
          </div>
        </div>
      </header>

      {/* LOCATION STATUS BAR (Section 6) */}
      <div className="bg-[#121212] border-b border-white/10 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <MapPin size={14} className={coords ? 'text-emerald-400' : 'text-amber-400'} />
          {coords ? (
            <span className="font-semibold text-white">
              📍 Location Active {accuracy ? `(±${accuracy}m)` : ''} • Updated: {updatedText}
            </span>
          ) : locStatus === 'denied' ? (
            <span className="text-amber-300 font-semibold">
              Location access is turned off.
            </span>
          ) : (
            <span className="text-gray-400 font-medium">
              {errorReason || 'Acquiring GPS for accurate distances...'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!coords && (
            <button
              type="button"
              onClick={() => requestLocation()}
              className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/15 text-[11px] font-bold text-[#FFF174] cursor-pointer flex items-center gap-1"
            >
              <RefreshCw size={11} /> Enable Location
            </button>
          )}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-1">
            <input
              type="text"
              value={searchPlace}
              onChange={(e) => setSearchPlace(e.target.value)}
              placeholder="Search place / town..."
              className="bg-black/40 border border-white/10 rounded px-2 py-0.5 text-[11px] text-white focus:outline-none focus:border-[#FFF174]"
            />
          </form>
        </div>
      </div>

      {/* MAIN CONTENT AREA:
          Desktop: LIST + MAP side-by-side
          Mobile: MAP on top + BOTTOM SHEET */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row relative overflow-hidden">
        
        {/* DESKTOP LIST CONTAINER (Visible on md+) */}
        <div className="hidden md:flex flex-col w-2/5 border-r border-white/10 overflow-y-auto p-4 space-y-3 max-h-[calc(100vh-120px)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-gray-400">
              {providersWithDistance.length} Providers Found
            </span>
            <span className="text-[10px] text-gray-500 font-mono">Real haversine routing</span>
          </div>

          <div className="space-y-3">
            {providersWithDistance.map((p) => {
              const isSelected = selectedProvider?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProvider(p)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#181818] border-[#FFF174] shadow-[0_0_15px_rgba(255,241,116,0.15)]'
                      : 'bg-[#121212] border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Provider Header: Name, Verified / Demo tag, Rating, Distance */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <strong className="text-sm font-black text-white">{p.name}</strong>
                        {p.isDemo ? (
                          <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                            DEMO PROVIDER
                          </span>
                        ) : (
                          <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <ShieldCheck size={10} /> Verified
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                        <span className="text-[#FFF174] font-bold flex items-center gap-0.5">
                          <Star size={12} fill="#FFF174" /> {p.rating}
                        </span>
                        <span>•</span>
                        <span className="text-white font-semibold">{p.distanceStr}</span>
                      </div>
                    </div>
                  </div>

                  {/* 2-3 Main Services */}
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {p.services.slice(0, 3).map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-gray-300 font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Call & Directions Buttons */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10">
                    <a
                      href={`tel:${p.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors text-center"
                    >
                      <PhoneCall size={13} className="text-emerald-400" />
                      <span>Call</span>
                    </a>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="py-2 px-3 rounded-xl bg-[#FFF174] hover:bg-yellow-400 text-black font-black text-xs flex items-center justify-center gap-1.5 transition-colors text-center"
                    >
                      <Navigation size={13} />
                      <span>Directions</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MAP CONTAINER (Desktop: 3/5 width, Mobile: full height with bottom sheet) */}
        <div className="flex-1 w-full h-[50vh] md:h-auto min-h-[400px] relative bg-[#121212]">
          <iframe
            title="Service Centers Map"
            src={mapSrc}
            width="100%"
            height="100%"
            style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(95%)' }}
            loading="lazy"
            allowFullScreen
          />
        </div>

        {/* MOBILE BOTTOM SHEET (Section 7: MAP + BOTTOM SHEET on mobile) */}
        <div
          className={`md:hidden fixed bottom-14 left-0 right-0 z-40 bg-[#121212] border-t-2 border-white/15 rounded-t-3xl shadow-2xl transition-all duration-300 ${
            mobileSheetOpen ? 'max-h-[60vh]' : 'max-h-[64px]'
          } flex flex-col`}
        >
          {/* Sheet Handle */}
          <button
            type="button"
            onClick={() => setMobileSheetOpen(!mobileSheetOpen)}
            className="w-full py-2.5 flex items-center justify-center gap-1 text-gray-400 hover:text-white cursor-pointer"
          >
            <div className="w-10 h-1 bg-white/20 rounded-full mb-1" />
            <span className="text-[11px] font-bold uppercase tracking-wider block">
              {mobileSheetOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </span>
          </button>

          {/* Sheet Content */}
          {mobileSheetOpen && (
            <div className="overflow-y-auto p-4 space-y-3 pb-8">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-black uppercase tracking-wider text-gray-300">
                  {providersWithDistance.length} Providers Nearby
                </span>
                <span className="text-[10px] text-[#FFF174] font-bold">Tap card to focus</span>
              </div>

              {providersWithDistance.map((p) => {
                const isSelected = activeProvider?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProvider(p)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#181818] border-[#FFF174]'
                        : 'bg-black/40 border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <strong className="text-xs font-black text-white">{p.name}</strong>
                          {p.isDemo ? (
                            <span className="text-[8px] font-black uppercase bg-amber-500/20 text-amber-300 px-1 py-0.5 rounded">
                              DEMO
                            </span>
                          ) : (
                            <span className="text-[8px] font-black uppercase bg-emerald-500/20 text-emerald-400 px-1 py-0.5 rounded">
                              VERIFIED
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                          <span className="text-[#FFF174] font-bold">★ {p.rating}</span>
                          <span>•</span>
                          <span className="text-white font-semibold">{p.distanceStr}</span>
                        </div>
                      </div>
                    </div>

                    {/* 2-3 Services */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {p.services.slice(0, 3).map((s, idx) => (
                        <span key={idx} className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-gray-300">
                          {s}
                        </span>
                      ))}
                    </div>

                    {/* Actions: Call & Directions */}
                    <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2 border-t border-white/10">
                      <a
                        href={`tel:${p.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="py-1.5 px-3 rounded-xl bg-white/10 text-xs font-bold text-white flex items-center justify-center gap-1"
                      >
                        <PhoneCall size={12} className="text-emerald-400" />
                        <span>Call</span>
                      </a>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="py-1.5 px-3 rounded-xl bg-[#FFF174] text-black font-black text-xs flex items-center justify-center gap-1"
                      >
                        <Navigation size={12} />
                        <span>Directions</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
