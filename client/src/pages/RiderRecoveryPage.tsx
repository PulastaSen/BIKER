import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Hotel, Car, Utensils, Users, MapPin, Phone, 
  ArrowLeft, ExternalLink 
} from 'lucide-react';

interface SafePlace {
  id: string;
  category: 'HOTEL' | 'TRANSPORT' | 'FOOD' | 'SAFE_HAVEN';
  name: string;
  type: string;
  distanceKm: number;
  location: string;
  phone?: string;
  openHours: string;
  verified: boolean;
  notes: string;
}

const RECOVERY_PLACES: SafePlace[] = [
  {
    id: 'rec-1',
    category: 'HOTEL',
    name: 'Teesta River Heritage Lodge',
    type: 'Secure Rider Homestay & Hotel',
    distanceKm: 2.4,
    location: 'Sevoke Road, Near Teesta Bridge Viewpoint',
    phone: '+91 98001 23456',
    openHours: '24/7 Front Desk',
    verified: true,
    notes: 'Safe indoor luggage hold, rider parking, hot water, power backup.'
  },
  {
    id: 'rec-2',
    category: 'HOTEL',
    name: 'Hotel Highway Grand Comfort',
    type: 'Highway Hotel',
    distanceKm: 4.8,
    location: 'NH-10 Junction, Salugara',
    phone: '+91 98320 88990',
    openHours: '24/7 Reception',
    verified: true,
    notes: 'Secure gated parking, emergency check-in assistance.'
  },
  {
    id: 'rec-3',
    category: 'TRANSPORT',
    name: 'Himalayan Cab Syndicate & Taxi Stand',
    type: 'Local & Outstation Taxis',
    distanceKm: 1.1,
    location: 'Sevoke Bazar Junction',
    phone: '+91 94340 55667',
    openHours: '05:00 AM - 10:30 PM',
    verified: true,
    notes: 'Pre-fixed fares to Siliguri Station, NJP, Bagdogra Airport, and Darjeeling.'
  },
  {
    id: 'rec-4',
    category: 'TRANSPORT',
    name: 'North Bengal State Transport Outpost',
    type: 'Government Bus & Shuttle Hub',
    distanceKm: 3.5,
    location: 'Hill Cart Road Bus Terminal',
    phone: '+91 353 252 1122',
    openHours: '06:00 AM - 09:00 PM',
    verified: true,
    notes: 'Regular departures to Gangtok, Kalimpong, Kurseong, and Siliguri.'
  },
  {
    id: 'rec-5',
    category: 'FOOD',
    name: 'Himalayan Rest Stop & Highway Diner',
    type: '24/7 Food & Rest Area',
    distanceKm: 0.8,
    location: 'NH-10 KM 18 Marker',
    phone: '+91 98112 34098',
    openHours: 'Open 24 Hours',
    verified: true,
    notes: 'Clean restrooms, mobile charging stations, drinking water, warm tea & food.'
  },
  {
    id: 'rec-6',
    category: 'SAFE_HAVEN',
    name: 'Sevoke Highway Police & Tourist Outpost',
    type: 'Police & Tourist Assistance',
    distanceKm: 1.8,
    location: 'Near Coronation Bridge Checkpost',
    phone: '100 / 0353-2689222',
    openHours: '24/7 Active Duty',
    verified: true,
    notes: 'Safe waiting area, state police protection, communication link.'
  }
];

export function RiderRecoveryPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'HOTEL' | 'TRANSPORT' | 'FOOD' | 'SAFE_HAVEN'>('ALL');

  const filtered = RECOVERY_PLACES.filter((p) => {
    if (selectedCategory === 'ALL') return true;
    return p.category === selectedCategory;
  });

  return (
    <div className="shell py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Post-Breakdown Care
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Rider Recovery & Safe Shelter</h1>
        </div>
      </div>

      {/* Hero Breakdown Context */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-white/10 mb-8 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-black text-white">Your motorcycle is accounted for. Now take care of yourself.</h2>
            <p className="text-xs text-gray-300 mt-1 max-w-xl">
              When roadside repairs require workshop time or overnight towing, don't stay stranded on the dark highway. Find clean shelter, reliable transport, warm food, or notify family.
            </p>
          </div>
          <button
            onClick={() => navigate('/safety-circle')}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-bold hover:bg-blue-600/30 transition-colors"
          >
            <Users size={16} /> Contact Family Circle
          </button>
        </div>

        {/* 4 Action Quick Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <button
            onClick={() => setSelectedCategory('HOTEL')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              selectedCategory === 'HOTEL'
                ? 'bg-amber-400/10 border-amber-400 text-amber-300'
                : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
            }`}
          >
            <Hotel size={20} className="mb-2 text-amber-400" />
            <strong className="block text-xs font-bold">Find Shelter / Hotel</strong>
            <span className="text-[10px] text-gray-400">Rest & wait</span>
          </button>

          <button
            onClick={() => setSelectedCategory('TRANSPORT')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              selectedCategory === 'TRANSPORT'
                ? 'bg-blue-400/10 border-blue-400 text-blue-300'
                : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
            }`}
          >
            <Car size={20} className="mb-2 text-blue-400" />
            <strong className="block text-xs font-bold">Book Taxi / Cab</strong>
            <span className="text-[10px] text-gray-400">Head home or to city</span>
          </button>

          <button
            onClick={() => setSelectedCategory('FOOD')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              selectedCategory === 'FOOD'
                ? 'bg-emerald-400/10 border-emerald-400 text-emerald-300'
                : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
            }`}
          >
            <Utensils size={20} className="mb-2 text-emerald-400" />
            <strong className="block text-xs font-bold">Food & Warmth</strong>
            <span className="text-[10px] text-gray-400">Hot tea, food, charging</span>
          </button>

          <button
            onClick={() => navigate('/safety-circle')}
            className="p-3.5 rounded-2xl border bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 text-left transition-all"
          >
            <Users size={20} className="mb-2 text-purple-400" />
            <strong className="block text-xs font-bold">Alert Family</strong>
            <span className="text-[10px] text-gray-400">Share status update</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-thin">
        {[
          { key: 'ALL', label: 'All Safe Locations' },
          { key: 'HOTEL', label: 'Hotels & Homestays' },
          { key: 'TRANSPORT', label: 'Taxis & Shuttles' },
          { key: 'FOOD', label: '24/7 Food & Rest Stops' },
          { key: 'SAFE_HAVEN', label: 'Police & Safe Havens' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedCategory(tab.key as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              selectedCategory === tab.key
                ? 'bg-white text-black'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Location Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-neutral-900 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                    {item.type}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">{item.name}</h3>
                </div>
                <span className="text-xs font-bold text-gray-400 flex items-center gap-1 shrink-0">
                  <MapPin size={12} className="text-red-400" /> {item.distanceKm} km away
                </span>
              </div>

              <p className="text-xs text-gray-400 mb-3">{item.location}</p>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-gray-300 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span>Hours: <strong className="text-white">{item.openHours}</strong></span>
                  {item.verified && (
                    <span className="text-emerald-400 font-bold">✓ Verified Safe Spot</span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 pt-1">{item.notes}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
              {item.phone && (
                <a
                  href={`tel:${item.phone}`}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone size={14} /> Call ({item.phone})
                </a>
              )}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ' ' + item.location)}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-1 transition-colors"
              >
                Directions <ExternalLink size={12} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
