import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  PhoneCall, 
  Hospital, 
  HeartPulse, 
  Navigation, 
  ArrowLeft, 
  Building2, 
  Fuel
} from 'lucide-react';

import { useUserLocation } from '../hooks/useUserLocation';

function computeDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

interface EmergencyFacility {
  id: string;
  name: string;
  type: 'AMBULANCE' | 'HOSPITAL' | 'POLICE' | 'SAFE_HAVEN';
  address: string;
  phone: string;
  distanceKm?: number;
  lat: number;
  lng: number;
  emergencyCapable247: boolean;
  notes?: string;
}

const VERIFIED_FACILITIES: EmergencyFacility[] = [
  // Hospitals (Section 13)
  {
    id: 'hosp-1',
    name: 'Neotia Getwel Healthcare Centre',
    type: 'HOSPITAL',
    address: 'Uttorayon Township, NH-31, Matigara, Siliguri, WB 734010',
    phone: '+91 353 305 8888',
    distanceKm: 4.2,
    lat: 26.7190,
    lng: 88.3850,
    emergencyCapable247: true,
    notes: 'Level 1 Trauma & Emergency Care, ICU, Blood Bank'
  },
  {
    id: 'hosp-2',
    name: 'North Bengal Medical College & Hospital (NBMCH)',
    type: 'HOSPITAL',
    address: 'Sushruta Nagar, Siliguri, WB 734012',
    phone: '+91 353 258 5478',
    distanceKm: 6.8,
    lat: 26.6970,
    lng: 88.3750,
    emergencyCapable247: true,
    notes: 'Govt Teaching Hospital, 24/7 Emergency Casualty & Orthopedic Surgery'
  },
  {
    id: 'hosp-3',
    name: 'Siliguri District Hospital',
    type: 'HOSPITAL',
    address: 'Hospital Road, Ward 12, Siliguri, WB 734001',
    phone: '+91 353 243 2555',
    distanceKm: 2.1,
    lat: 26.7160,
    lng: 88.4230,
    emergencyCapable247: true,
    notes: 'Emergency casualty ward, 24/7 emergency medicine'
  },
  {
    id: 'hosp-4',
    name: 'Kalimpong Sub-Divisional Hospital (Hills Corridor)',
    type: 'HOSPITAL',
    address: 'Hospital Road, Kalimpong, WB 734301',
    phone: '+91 3552 255 222',
    distanceKm: 48.0,
    lat: 27.0667,
    lng: 88.4667,
    emergencyCapable247: true,
    notes: 'Critical high-altitude mountain emergency care on NH-10 corridor'
  },

  // Ambulance Providers (Section 12)
  {
    id: 'amb-1',
    name: 'Siliguri 108 Emergency Ambulance Dispatch',
    type: 'AMBULANCE',
    address: 'Siliguri Central Ambulance Hub',
    phone: '108',
    distanceKm: 1.5,
    lat: 26.7271,
    lng: 88.3953,
    emergencyCapable247: true,
    notes: 'Govt 108 Rapid Ambulance Service with Oxygen & EMT'
  },
  {
    id: 'amb-2',
    name: 'LifeCare Advanced Cardiac Ambulance (AC)',
    type: 'AMBULANCE',
    address: 'Sevoke Road near 2nd Mile, Siliguri',
    phone: '+91 98320 99111',
    distanceKm: 2.8,
    lat: 26.7380,
    lng: 88.4290,
    emergencyCapable247: true,
    notes: 'ICU on Wheels with ventilator & paramedic support'
  },
  {
    id: 'amb-3',
    name: 'Coronation Mountain Highway Ambulance Post',
    type: 'AMBULANCE',
    address: 'Near Sevoke Coronation Bridge Junction',
    phone: '+91 94340 77108',
    distanceKm: 18.4,
    lat: 26.8990,
    lng: 88.4350,
    emergencyCapable247: true,
    notes: 'Mountain corridor emergency recovery ambulance'
  },

  // Police & Safe Locations (Section 14)
  {
    id: 'pol-1',
    name: 'Sevoke Police Outpost (NH-10 Highway Corridor)',
    type: 'POLICE',
    address: 'Sevoke Military Camp Junction, NH-10, Siliguri',
    phone: '+91 353 256 0100',
    distanceKm: 16.5,
    lat: 26.8850,
    lng: 88.4320,
    emergencyCapable247: true,
    notes: '24/7 Highway Patrol Base, Hill Traffic Coordination'
  },
  {
    id: 'pol-2',
    name: 'Bhaktinagar Police Station',
    type: 'POLICE',
    address: 'Checkpost, Sevoke Road, Siliguri',
    phone: '+91 353 254 1100',
    distanceKm: 3.1,
    lat: 26.7350,
    lng: 88.4310,
    emergencyCapable247: true,
    notes: 'Siliguri Police Commissionerate 24/7 Control'
  },
  {
    id: 'safe-1',
    name: 'Indian Oil 24/7 Highway COCO Plaza & Waiting Area',
    type: 'SAFE_HAVEN',
    address: 'NH-31 Matigara Bypass, Siliguri',
    phone: '+91 353 257 1200',
    distanceKm: 3.8,
    lat: 26.7140,
    lng: 88.3890,
    emergencyCapable247: true,
    notes: 'Well-lit 24/7 petrol pump with CCTV, washrooms, drinking water and security guard'
  },
  {
    id: 'safe-2',
    name: 'HPCL 24/7 Fuel Station & Dhaba Rest Stop',
    type: 'SAFE_HAVEN',
    address: 'Near Salugara Checkpost, Sevoke Road',
    phone: '+91 353 259 4400',
    distanceKm: 5.2,
    lat: 26.7510,
    lng: 88.4390,
    emergencyCapable247: true,
    notes: 'Safe populated waiting location with 24/7 tea stalls and lighting'
  }
];

export function EmergencyServicesPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'ALL' | 'HOSPITAL' | 'AMBULANCE' | 'POLICE' | 'SAFE_HAVEN'>('ALL');
  const { coords } = useUserLocation(true);

  const filteredFacilities = filter === 'ALL' 
    ? VERIFIED_FACILITIES 
    : VERIFIED_FACILITIES.filter(f => f.type === filter);

  return (
    <div className="min-h-screen bg-[#07090E] text-white pt-20 pb-24 font-sans selection:bg-red-500 selection:text-white">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
            Emergency Resource Discovery
          </span>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black">EMERGENCY SERVICES</h1>
              <p className="text-gray-400 text-xs mt-0.5">
                Immediate access to official Indian emergency services, hospitals, ambulances, and verified safe waiting locations.
              </p>
            </div>
          </div>
        </div>

        {/* Section 11: Official Emergency Helplines Direct Dial */}
        <div className="p-6 rounded-3xl bg-[#111622] border border-red-500/30 mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-red-400 flex items-center gap-2">
              <PhoneCall size={14} /> National Emergency Numbers (India)
            </h2>
            <span className="text-[10px] text-gray-400">Toll-Free 24/7</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <a
              href="tel:112"
              className="p-4 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-center text-white hover:from-red-500 hover:to-red-700 transition-all shadow-lg active:scale-95"
            >
              <strong className="block text-2xl font-black">112</strong>
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-100 block mt-0.5">National All-in-One</span>
            </a>

            <a
              href="tel:100"
              className="p-4 rounded-2xl bg-[#182030] border border-white/10 hover:border-blue-400 text-center text-white transition-all active:scale-95"
            >
              <strong className="block text-2xl font-black text-blue-400">100</strong>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300 block mt-0.5">Police Control</span>
            </a>

            <a
              href="tel:108"
              className="p-4 rounded-2xl bg-[#182030] border border-white/10 hover:border-emerald-400 text-center text-white transition-all active:scale-95"
            >
              <strong className="block text-2xl font-black text-emerald-400">108</strong>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300 block mt-0.5">Govt Ambulance</span>
            </a>

            <a
              href="tel:101"
              className="p-4 rounded-2xl bg-[#182030] border border-white/10 hover:border-orange-400 text-center text-white transition-all active:scale-95"
            >
              <strong className="block text-2xl font-black text-orange-400">101</strong>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300 block mt-0.5">Fire & Rescue</span>
            </a>
          </div>

          <p className="text-[11px] text-gray-400 pt-1">
            Note: MotoAssist coordinates motorcycle roadside assistance and does not replace official emergency services. In severe crashes or crime events, always dial 112 first.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'ALL', label: 'All Emergency Locations' },
            { key: 'HOSPITAL', label: 'Hospitals (24/7)' },
            { key: 'AMBULANCE', label: 'Ambulance Services' },
            { key: 'POLICE', label: 'Police Stations' },
            { key: 'SAFE_HAVEN', label: 'Safe Waiting Spots' }
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as typeof filter)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === f.key
                  ? 'bg-[#FFF174] text-black shadow-md'
                  : 'bg-[#111622] border border-white/10 text-gray-300 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Facilities List */}
        <div className="space-y-3.5">
          {filteredFacilities.map(fac => {
            const mapLink = `https://maps.google.com/maps?daddr=${fac.lat},${fac.lng}`;
            return (
              <div
                key={fac.id}
                className="p-5 rounded-3xl bg-[#111622] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`p-3 rounded-2xl shrink-0 ${
                    fac.type === 'HOSPITAL' ? 'bg-red-500/20 text-red-400' :
                    fac.type === 'AMBULANCE' ? 'bg-emerald-500/20 text-emerald-400' :
                    fac.type === 'POLICE' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-[#FFF174]/20 text-[#FFF174]'
                  }`}>
                    {fac.type === 'HOSPITAL' && <Hospital size={22} />}
                    {fac.type === 'AMBULANCE' && <HeartPulse size={22} />}
                    {fac.type === 'POLICE' && <Building2 size={22} />}
                    {fac.type === 'SAFE_HAVEN' && <Fuel size={22} />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{fac.name}</h3>
                      {fac.emergencyCapable247 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          24/7 Verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{fac.address}</p>
                    {fac.notes && (
                      <p className="text-[11px] text-gray-300 mt-1 italic font-medium">{fac.notes}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                      <span className="font-semibold text-white">
                        {coords ? `~${computeDistanceKm(coords.lat, coords.lng, fac.lat, fac.lng)} km away` : 'Location needed for distance'}
                      </span>
                      <span>•</span>
                      <span>Phone: <strong className="text-gray-200">{fac.phone}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 shrink-0">
                  <a
                    href={`tel:${fac.phone.replaceAll(' ', '')}`}
                    className="flex-1 sm:flex-none py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                  >
                    <PhoneCall size={14} /> Call Now
                  </a>
                  <a
                    href={mapLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-none py-2.5 px-4 bg-white/10 hover:bg-white/15 text-gray-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Navigation size={14} /> Directions
                  </a>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
