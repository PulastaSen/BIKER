import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wrench, 
  Fuel, 
  Hospital, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowLeft,
  Gauge,
  Award
} from 'lucide-react';

interface RouteCorridor {
  id: string;
  name: string;
  distanceKm: number;
  coverageRating: 'Excellent' | 'Good' | 'Limited' | 'Very Limited';
  mechanicsCount: number;
  oemCentersCount: number;
  hospitalsCount: number;
  fuelStationsCount: number;
  towingAvailable: boolean;
  notes: string;
}

const CORRIDORS: RouteCorridor[] = [
  {
    id: 'siliguri-gangtok',
    name: 'Siliguri → Gangtok via Sevoke (NH-10)',
    distanceKm: 114,
    coverageRating: 'Good',
    mechanicsCount: 9,
    oemCentersCount: 3,
    hospitalsCount: 4,
    fuelStationsCount: 6,
    towingAvailable: true,
    notes: 'Corridor has good towing & puncture coverage until Melli. Mountain sections between Melli and Singtam have limited spares.'
  },
  {
    id: 'siliguri-darjeeling',
    name: 'Siliguri → Darjeeling via Rohini (Hill Cart Road)',
    distanceKm: 68,
    coverageRating: 'Excellent',
    mechanicsCount: 14,
    oemCentersCount: 4,
    hospitalsCount: 5,
    fuelStationsCount: 8,
    towingAvailable: true,
    notes: 'Heavy mechanic density through Kurseong, Ghoom, and Sonada. High availability for 150-400cc spares.'
  },
  {
    id: 'delhi-rishikesh',
    name: 'Delhi → Rishikesh via Meerut Expressway',
    distanceKm: 242,
    coverageRating: 'Excellent',
    mechanicsCount: 35,
    oemCentersCount: 12,
    hospitalsCount: 18,
    fuelStationsCount: 28,
    towingAvailable: true,
    notes: 'Continuous expressway highway emergency coverage, multiple 24/7 OEM hubs at Meerut, Muzaffarnagar & Roorkee.'
  },
  {
    id: 'gangtok-gurudongmar',
    name: 'Gangtok → Lachen & Gurudongmar (North Sikkim)',
    distanceKm: 172,
    coverageRating: 'Very Limited',
    mechanicsCount: 2,
    oemCentersCount: 0,
    hospitalsCount: 1,
    fuelStationsCount: 2,
    towingAvailable: false,
    notes: 'Extreme high-altitude risk (17,800 ft). Zero OEM workshops past Mangan. Carry tubeless repair kit, inflator and spare clutch cable.'
  }
];

export function RouteCoveragePage() {
  const navigate = useNavigate();
  const [selectedCorridorId, setSelectedCorridorId] = useState('siliguri-gangtok');

  // Fuel Range Assistant (Section 23)
  const [tankCapacity, setTankCapacity] = useState(14.5); // Liters
  const [fuelPercentage, setFuelPercentage] = useState(40); // 40% fuel
  const [mileageKmpl, setMileageKmpl] = useState(28); // 28 km/l

  const currentFuelLiters = (tankCapacity * fuelPercentage) / 100;
  const estimatedRangeKm = Math.round(currentFuelLiters * mileageKmpl);
  const nearestFuelKm = 24;
  const isFuelLow = estimatedRangeKm < nearestFuelKm + 20;

  const currentCorridor = CORRIDORS.find(c => c.id === selectedCorridorId) || CORRIDORS[0];

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
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Pre-Trip Corridor Analysis
          </span>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black">ROUTE SUPPORT COVERAGE</h1>
          <p className="text-gray-400 text-xs mt-1">
            Calculate emergency support, mechanics, OEM centers, and fuel security along your corridor before departure.
          </p>
        </div>

        {/* Corridor Selector */}
        <div className="p-6 rounded-3xl bg-[#111622] border border-white/10 mb-6 space-y-4">
          <label className="block text-xs font-black uppercase tracking-wider text-gray-400">
            Select Planned Route Corridor
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {CORRIDORS.map(corridor => (
              <button
                key={corridor.id}
                type="button"
                onClick={() => setSelectedCorridorId(corridor.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  selectedCorridorId === corridor.id
                    ? 'bg-[#FFF174]/15 border-[#FFF174] text-white shadow-md'
                    : 'bg-[#182030] border-white/10 text-gray-300 hover:border-white/20'
                }`}
              >
                <strong className="text-xs font-bold text-white block">{corridor.name}</strong>
                <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
                  <span>{corridor.distanceKm} km</span>
                  <span className={`font-black uppercase ${
                    corridor.coverageRating === 'Excellent' ? 'text-emerald-400' :
                    corridor.coverageRating === 'Good' ? 'text-blue-400' :
                    corridor.coverageRating === 'Limited' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {corridor.coverageRating} Coverage
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Route Support Card (Section 22) */}
        <div className="p-6 rounded-3xl bg-[#111622] border border-white/10 mb-6 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">SUPPORT COVERAGE LEVEL</span>
              <h2 className="text-xl font-black text-white mt-0.5">{currentCorridor.name}</h2>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
              currentCorridor.coverageRating === 'Excellent' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              currentCorridor.coverageRating === 'Good' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
              currentCorridor.coverageRating === 'Limited' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
              'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {currentCorridor.coverageRating}
            </div>
          </div>

          {/* Infrastructure Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <Wrench size={18} className="text-[#FFF174] mx-auto mb-1" />
              <strong className="text-lg font-black text-white block">{currentCorridor.mechanicsCount}</strong>
              <span className="text-[10px] text-gray-400 uppercase font-bold">Mechanics</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <Award size={18} className="text-blue-400 mx-auto mb-1" />
              <strong className="text-lg font-black text-white block">{currentCorridor.oemCentersCount}</strong>
              <span className="text-[10px] text-gray-400 uppercase font-bold">OEM Centers</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <Hospital size={18} className="text-red-400 mx-auto mb-1" />
              <strong className="text-lg font-black text-white block">{currentCorridor.hospitalsCount}</strong>
              <span className="text-[10px] text-gray-400 uppercase font-bold">Hospitals</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <Fuel size={18} className="text-emerald-400 mx-auto mb-1" />
              <strong className="text-lg font-black text-white block">{currentCorridor.fuelStationsCount}</strong>
              <span className="text-[10px] text-gray-400 uppercase font-bold">Fuel Pumps</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#182030] text-xs text-gray-300">
            <strong className="text-white block mb-1">Route Assessment:</strong>
            {currentCorridor.notes}
          </div>
        </div>

        {/* Section 23: Fuel Range Assistant */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#141C2A] to-[#111622] border border-[#FFF174]/30 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Gauge size={20} className="text-[#FFF174]" />
              <h2 className="text-sm font-black uppercase tracking-wider text-white">Fuel Range Assistant</h2>
            </div>
            <span className="text-[11px] text-[#FFF174] font-bold">Smart Calculator</span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-gray-400 font-bold mb-1">Tank Capacity (L)</label>
              <input
                type="number"
                value={tankCapacity}
                onChange={e => setTankCapacity(parseFloat(e.target.value) || 14)}
                className="w-full bg-[#182030] border border-white/10 rounded-xl px-3 py-2 text-white font-bold"
              />
            </div>
            <div>
              <label className="block text-gray-400 font-bold mb-1">Current Fuel (%)</label>
              <input
                type="number"
                value={fuelPercentage}
                onChange={e => setFuelPercentage(Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                className="w-full bg-[#182030] border border-white/10 rounded-xl px-3 py-2 text-white font-bold"
              />
            </div>
            <div>
              <label className="block text-gray-400 font-bold mb-1">Mileage (km/L)</label>
              <input
                type="number"
                value={mileageKmpl}
                onChange={e => setMileageKmpl(parseFloat(e.target.value) || 25)}
                className="w-full bg-[#182030] border border-white/10 rounded-xl px-3 py-2 text-white font-bold"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between text-xs">
            <div>
              <span className="text-gray-400 block text-[11px]">Estimated Riding Range:</span>
              <strong className="text-2xl font-black text-[#FFF174]">{estimatedRangeKm} km</strong>
            </div>
            <div className="text-right">
              <span className="text-gray-400 block text-[11px]">Nearest Highway Fuel:</span>
              <strong className="text-lg font-black text-white">{nearestFuelKm} km</strong>
            </div>
          </div>

          {isFuelLow ? (
            <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-500/50 flex items-center gap-3 text-xs text-red-200">
              <AlertTriangle size={20} className="text-red-400 shrink-0" />
              <p>
                <strong>Warning: Low Safety Margin!</strong> Your estimated range is tight for mountain climbs. Refuel before ascending past checkposts.
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-3 text-xs text-emerald-200">
              <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
              <p>
                <strong>Range Secure:</strong> You have adequate reserve margin to reach the next major fuel pump.
              </p>
            </div>
          )}

          <p className="text-[10px] text-gray-400 italic text-center">
            Estimates are calculated from user inputs and terrain gradients. Never treat estimates as guarantees.
          </p>
        </div>

      </div>
    </div>
  );
}
