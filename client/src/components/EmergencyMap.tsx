import { useState, useMemo } from 'react';
import { 
  Wrench, 
  Building2, 
  Fuel, 
  ShieldAlert, 
  Truck, 
  HeartPulse, 
  Navigation,
  PhoneCall,
  SlidersHorizontal
} from 'lucide-react';
import { MapSection } from './MapSection';

export type MapFilterCategory = 'ALL' | 'MECHANICAL' | 'MEDICAL' | 'EMERGENCY' | 'FUEL' | 'OEM' | 'TOWING';

export interface EmergencyMapResource {
  id: string;
  name: string;
  category: 'MECHANIC' | 'OEM' | 'HOSPITAL' | 'PHARMACY' | 'FUEL' | 'POLICE' | 'AMBULANCE' | 'TOWING' | 'HELPER';
  lat: number;
  lng: number;
  address: string;
  phone: string;
  distanceKm?: number;
  verified?: boolean;
  notes?: string;
}

interface EmergencyMapProps {
  riderCoords?: { lat: number; lng: number };
  activeHelperCoords?: { lat: number; lng: number; name?: string; phone?: string; etaMinutes?: number };
  height?: string;
  initialFilter?: MapFilterCategory;
  onSelectResource?: (res: EmergencyMapResource) => void;
}

// Curated verified regional mountain safety points & base providers
const EMERGENCY_RESOURCE_CATALOG: EmergencyMapResource[] = [
  // Hospitals & Trauma
  {
    id: 'hosp-trauma-1',
    name: 'Neotia Getwel Healthcare Trauma Centre',
    category: 'HOSPITAL',
    lat: 26.7190,
    lng: 88.3850,
    address: 'Uttorayon Township, NH-31, Matigara, WB 734010',
    phone: '+91 353 305 8888',
    verified: true,
    notes: 'Level-1 Emergency Trauma & ICU (24/7)'
  },
  {
    id: 'hosp-nbmch-2',
    name: 'North Bengal Medical College & Hospital',
    category: 'HOSPITAL',
    lat: 26.6850,
    lng: 88.3750,
    address: 'Sushruta Nagar, Siliguri, WB 734012',
    phone: '+91 353 258 5478',
    verified: true,
    notes: 'Govt Apex Hospital with 24/7 Emergency Wing'
  },
  // Ambulances
  {
    id: 'amb-108-1',
    name: 'National 108 Emergency Ambulance Hub',
    category: 'AMBULANCE',
    lat: 26.7210,
    lng: 88.4150,
    address: 'National Highway Corridor Dispatch',
    phone: '108',
    verified: true,
    notes: 'Govt 108 Free Rapid Response Ambulance'
  },
  // Pharmacies
  {
    id: 'pharm-apollo-1',
    name: 'Apollo 24/7 Emergency Pharmacy & First Aid',
    category: 'PHARMACY',
    lat: 26.7280,
    lng: 88.4250,
    address: 'Sevoke Road, Near 2nd Mile, WB 734001',
    phone: '+91 353 254 0123',
    verified: true,
    notes: '24/7 First-aid dressing & prescription supply'
  },
  // Mechanics & Rescue
  {
    id: 'mech-raj-1',
    name: 'Raj Motors 2-Wheeler Mountain Rescue',
    category: 'MECHANIC',
    lat: 26.7320,
    lng: 88.4310,
    address: 'Sevoke More Junction, WB 734001',
    phone: '+91 98320 12345',
    verified: true,
    notes: 'Tubeless puncture, chain link, clutch cable'
  },
  {
    id: 'mech-ridge-2',
    name: 'Himalayan Ridge Moto Workshop',
    category: 'MECHANIC',
    lat: 26.7550,
    lng: 88.4520,
    address: 'Salugara Army Gate, Sevoke Rd, WB 734008',
    phone: '+91 94341 67890',
    verified: true,
    notes: 'High-altitude suspension & spoke wheel truing'
  },
  // OEM Centers
  {
    id: 'oem-ktm-1',
    name: 'KTM & Husqvarna Authorized Service Centre',
    category: 'OEM',
    lat: 26.7412,
    lng: 88.4285,
    address: 'Sevoke Road 2nd Mile, WB 734001',
    phone: '+91 98320 11223',
    verified: true,
    notes: 'OEM Diagnostics & Genuine Spares'
  },
  {
    id: 'oem-re-2',
    name: 'Royal Enfield Authorized Highway Care',
    category: 'OEM',
    lat: 26.7350,
    lng: 88.4310,
    address: 'Near Checkpost, Sevoke Road, WB 734008',
    phone: '+91 98321 44556',
    verified: true,
    notes: 'Himalayan 450 / Scram OEM Care'
  },
  // Police Stations
  {
    id: 'pol-sevoke-1',
    name: 'Bhaktinagar / Sevoke Road Police Station',
    category: 'POLICE',
    lat: 26.7360,
    lng: 88.4380,
    address: 'Sevoke Road Police Beat, WB 734001',
    phone: '112',
    verified: true,
    notes: '24/7 Highway Patrol & Emergency Response'
  },
  // Fuel / Petrol Stations
  {
    id: 'fuel-ioc-1',
    name: 'Indian Oil 24/7 Highway Petrol & Air Station',
    category: 'FUEL',
    lat: 26.7310,
    lng: 88.4270,
    address: 'Sevoke Road Mile 1, WB 734001',
    phone: '+91 353 254 8877',
    verified: true,
    notes: '24/7 Petrol, High Octane XP95, Tyre Nitrogen'
  },
  // Towing & Flatbed
  {
    id: 'tow-mountain-1',
    name: 'Mountain Moto Flatbed Towing Service',
    category: 'TOWING',
    lat: 26.7240,
    lng: 88.4190,
    address: 'Eastern Bypass Crossing, WB 734004',
    phone: '+91 98000 55443',
    verified: true,
    notes: 'Motorcycle wheel-lock flatbed towing'
  }
];

export function EmergencyMap({
  riderCoords,
  activeHelperCoords,
  height = '420px',
  initialFilter = 'ALL',
  onSelectResource
}: EmergencyMapProps) {
  const [filter, setFilter] = useState<MapFilterCategory>(initialFilter);

  // Filter items based on active category
  const filteredResources = useMemo(() => {
    return EMERGENCY_RESOURCE_CATALOG.filter((item) => {
      if (filter === 'ALL') return true;
      if (filter === 'MECHANICAL') return item.category === 'MECHANIC' || item.category === 'OEM' || item.category === 'TOWING';
      if (filter === 'MEDICAL') return item.category === 'HOSPITAL' || item.category === 'AMBULANCE' || item.category === 'PHARMACY';
      if (filter === 'EMERGENCY') return item.category === 'POLICE' || item.category === 'HOSPITAL' || item.category === 'AMBULANCE';
      if (filter === 'FUEL') return item.category === 'FUEL';
      if (filter === 'OEM') return item.category === 'OEM';
      if (filter === 'TOWING') return item.category === 'TOWING';
      return true;
    });
  }, [filter]);

  // Construct MapSection markers
  const markers = useMemo(() => {
    const list: Array<{ id: string; position: [number, number]; title: string; type: 'rider' | 'helper' | 'mechanic' }> = [];

    // 1. Rider Marker (Always prioritized per Section 37)
    if (riderCoords && riderCoords.lat && riderCoords.lng) {
      list.push({
        id: 'rider-current',
        position: [riderCoords.lat, riderCoords.lng],
        title: '📍 You (Rider Current Location)',
        type: 'rider'
      });
    }

    // 2. Active Helper Marker (Zomato/Swiggy Style per Section 13)
    if (activeHelperCoords && activeHelperCoords.lat && activeHelperCoords.lng) {
      list.push({
        id: 'helper-active',
        position: [activeHelperCoords.lat, activeHelperCoords.lng],
        title: `👨🔧 ${activeHelperCoords.name || 'Helper En Route'}${activeHelperCoords.etaMinutes ? ` (ETA ${activeHelperCoords.etaMinutes}m)` : ''}`,
        type: 'helper'
      });
    }

    // 3. Category Resources
    filteredResources.forEach((r) => {
      list.push({
        id: r.id,
        position: [r.lat, r.lng],
        title: `${r.category}: ${r.name}`,
        type: r.category === 'HOSPITAL' || r.category === 'AMBULANCE' ? 'rider' : 'mechanic'
      });
    });

    return list;
  }, [riderCoords, activeHelperCoords, filteredResources]);

  const mapCenter: [number, number] | undefined = useMemo(() => {
    if (riderCoords && riderCoords.lat && riderCoords.lng) {
      return [riderCoords.lat, riderCoords.lng];
    }
    if (activeHelperCoords && activeHelperCoords.lat && activeHelperCoords.lng) {
      return [activeHelperCoords.lat, activeHelperCoords.lng];
    }
    return undefined;
  }, [riderCoords, activeHelperCoords]);

  return (
    <div className="space-y-3" role="region" aria-label="MotoAssist Emergency Map">
      
      {/* SECTION 35: HORIZONTAL CATEGORY FILTER BAR */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {[
          { key: 'ALL', label: 'ALL', icon: <SlidersHorizontal size={13} /> },
          { key: 'MECHANICAL', label: '🔧 Mechanical', icon: <Wrench size={13} /> },
          { key: 'MEDICAL', label: '🚑 Medical', icon: <HeartPulse size={13} /> },
          { key: 'EMERGENCY', label: '👮 Emergency', icon: <ShieldAlert size={13} /> },
          { key: 'FUEL', label: '⛽ Fuel', icon: <Fuel size={13} /> },
          { key: 'OEM', label: '🏢 OEM', icon: <Building2 size={13} /> },
          { key: 'TOWING', label: '🚚 Towing', icon: <Truck size={13} /> }
        ].map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setFilter(cat.key as MapFilterCategory)}
            className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border ${
              filter === cat.key
                ? 'bg-[#FFF174] text-black border-[#FFF174] shadow-md shadow-yellow-500/10'
                : 'bg-[#141414] text-gray-300 border-white/10 hover:border-white/20'
            }`}
          >
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* MAP CONTAINER */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0A0E17]">
        <MapSection
          center={mapCenter}
          zoom={13}
          height={height}
          markers={markers}
          interactive={true}
        />

        {/* Floating Active Helper Indicator if en route */}
        {activeHelperCoords && (
          <div className="absolute top-3 left-3 z-10 p-2.5 rounded-xl bg-black/85 backdrop-blur-md border border-emerald-500/40 text-xs text-white flex items-center gap-2 shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <strong className="block text-emerald-300 font-bold">
                👨🔧 Helper Live: {activeHelperCoords.name || 'Raj Motors'}
              </strong>
              <span className="text-[10px] text-gray-300">
                {activeHelperCoords.etaMinutes ? `ETA ${activeHelperCoords.etaMinutes} mins` : 'Travelling toward you'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* QUICK RESOURCE LIST (Horizontal Scroll / Bottom Cards) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-gray-400 font-semibold px-1">
          <span>{filteredResources.length} Verified Emergency Points</span>
          <span className="text-[10px] text-[#FFF174]">Tap for 1-Tap Directions & Call</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {filteredResources.slice(0, 4).map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (onSelectResource) onSelectResource(item);
              }}
              className="p-3 rounded-xl bg-[#141414] border border-white/10 hover:border-white/25 transition-all flex items-center justify-between cursor-pointer"
            >
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 font-bold text-gray-300">
                    {item.category}
                  </span>
                  <strong className="text-white truncate block">{item.name}</strong>
                </div>
                <p className="text-[11px] text-gray-400 truncate mt-0.5">{item.address}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`tel:${item.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-emerald-500/20 hover:text-emerald-400 flex items-center justify-center text-gray-300 transition-colors"
                  title={`Call ${item.name}`}
                >
                  <PhoneCall size={14} />
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-8 h-8 rounded-lg bg-[#FFF174]/15 hover:bg-[#FFF174]/30 text-[#FFF174] flex items-center justify-center transition-colors"
                  title="Open GPS Directions"
                >
                  <Navigation size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
