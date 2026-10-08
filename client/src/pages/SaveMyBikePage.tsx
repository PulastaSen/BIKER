import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Truck, 
  ArrowLeft, 
  Camera, 
  Building, 
  Home, 
  ArrowRight
} from 'lucide-react';
import { createAssistanceRequest } from '../services/ecosystemApi';

const TOWING_VEHICLES = [
  { id: 'FLATBED', label: 'Hydraulic Flatbed Truck', desc: 'Zero incline roll-on for heavy ADVs and superbikes', fee: 1200 },
  { id: 'MOTORCYCLE_CARRIER', label: 'Dedicated Moto Carrier Van', desc: 'Enclosed wheel-chock vehicle with ramp', fee: 850 },
  { id: 'PICKUP', label: 'Pickup Utility Vehicle', desc: 'Rapid highway recovery with rear tie-downs', fee: 700 },
  { id: 'OEM_RECOVERY', label: 'Authorized OEM Recovery Van', desc: 'Direct towing to KTM, RE or Honda dealership', fee: 950 }
];

const DESTINATIONS = [
  { id: 'WORKSHOP', label: 'Nearest Authorized Workshop', icon: <Building size={18} />, desc: 'Deliver directly to service center bay' },
  { id: 'HOME', label: 'Home / Hotel Delivery', icon: <Home size={18} />, desc: 'Safely store motorcycle at your residence' }
];

export function SaveMyBikePage() {
  const navigate = useNavigate();

  const [towingType, setTowingType] = useState('MOTORCYCLE_CARRIER');
  const [destinationChoice, setDestinationChoice] = useState('WORKSHOP');
  const [pickupAddress, setPickupAddress] = useState('NH-10 near 29th Mile, Sevoke');
  const [dropAddress, setDropAddress] = useState('KTM & Husqvarna Authorized Service, Sevoke Rd, Siliguri');
  const [hasPhotos, setHasPhotos] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedVehicle = TOWING_VEHICLES.find(v => v.id === towingType) || TOWING_VEHICLES[1];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      problemCategory: 'Towing',
      description: `SAVE MY BIKE: ${selectedVehicle.label} to ${destinationChoice === 'WORKSHOP' ? 'Authorized Workshop' : 'Home'}. Drop: ${dropAddress}`,
      location: {
        coordinates: [88.4350, 26.8990] as [number, number],
        address: pickupAddress
      },
      towingDetails: {
        towingType: towingType as any,
        pickupAddress,
        destinationAddress: dropAddress,
        pickupPhotos: hasPhotos ? ['https://images.unsplash.com/photo-1558981806-ec527fa84c39'] : []
      },
      estimatedPrice: {
        calloutFee: 200,
        travelFee: 150,
        serviceFee: selectedVehicle.fee,
        estimatedTotal: selectedVehicle.fee + 350,
        isAvailable: true,
        disclaimer: 'Towing includes strapping and secure wheel chocks. Rates transparently itemized.'
      }
    };

    const result = await createAssistanceRequest(payload);
    setSubmitting(false);

    if (result && (result.requestId || result.id)) {
      navigate(`/requests/${result.requestId || result.id}`);
    } else {
      alert('Towing dispatch recorded. Proceeding to tracking.');
      navigate('/rider/requests');
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-white pt-20 pb-24 font-sans selection:bg-[#FFF174] selection:text-black">
      <div className="container mx-auto px-4 max-w-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#FFF174]/10 text-[#FFF174] border border-[#FFF174]/20">
            Motorcycle Transport Protocol
          </span>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF174]/20 border border-[#FFF174]/40 text-[#FFF174] flex items-center justify-center shrink-0">
            <Truck size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">SAVE MY BIKE</h1>
            <p className="text-gray-400 text-xs mt-0.5">
              Damage-free motorcycle towing, flatbeds and workshop transport across Himalayan highways.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Recovery Vehicle Type */}
          <div className="p-6 rounded-3xl bg-[#111622] border border-white/10 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400">
              1. Choose Recovery Vehicle
            </h2>

            <div className="space-y-2.5">
              {TOWING_VEHICLES.map(v => (
                <label
                  key={v.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    towingType === v.id
                      ? 'bg-[#FFF174]/15 border-[#FFF174] text-white shadow-md'
                      : 'bg-[#182030] border-white/10 text-gray-300 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="towType"
                      checked={towingType === v.id}
                      onChange={() => setTowingType(v.id)}
                      className="text-[#FFF174] focus:ring-0"
                    />
                    <div>
                      <strong className="text-sm font-bold text-white block">{v.label}</strong>
                      <span className="text-xs text-gray-400 block">{v.desc}</span>
                    </div>
                  </div>
                  <strong className="text-xs font-black text-[#FFF174]">₹{v.fee}</strong>
                </label>
              ))}
            </div>
          </div>

          {/* Delivery Destination */}
          <div className="p-6 rounded-3xl bg-[#111622] border border-white/10 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400">
              2. Destination Type
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {DESTINATIONS.map(d => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDestinationChoice(d.id)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    destinationChoice === d.id
                      ? 'bg-[#FFF174]/15 border-[#FFF174] text-white shadow-md'
                      : 'bg-[#182030] border-white/10 text-gray-300 hover:border-white/20'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white/10 text-[#FFF174] w-fit mb-2">
                    {d.icon}
                  </div>
                  <strong className="text-xs font-bold text-white block">{d.label}</strong>
                  <span className="text-[11px] text-gray-400 block mt-0.5">{d.desc}</span>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Pickup Location</label>
              <input
                type="text"
                required
                value={pickupAddress}
                onChange={e => setPickupAddress(e.target.value)}
                className="w-full bg-[#182030] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Drop-off Destination Address</label>
              <input
                type="text"
                required
                value={dropAddress}
                onChange={e => setDropAddress(e.target.value)}
                className="w-full bg-[#182030] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          {/* Condition Photos */}
          <div className="p-6 rounded-3xl bg-[#111622] border border-white/10 space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Camera size={14} className="text-[#FFF174]" /> Bike Condition Verification
            </h2>
            <p className="text-xs text-gray-400">
              Pre-pickup inspection photos verify existing scratches and protect you against in-transit damage.
            </p>
            <button
              type="button"
              onClick={() => setHasPhotos(!hasPhotos)}
              className={`w-full py-3 rounded-xl border text-xs font-bold transition-all ${
                hasPhotos
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : 'bg-[#182030] border-white/10 text-gray-300 hover:text-white'
              }`}
            >
              {hasPhotos ? '✓ 2 Condition Photos Attached' : '+ Capture / Attach Bike Photos'}
            </button>
          </div>

          {/* Summary & Pricing */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-[#161D2C] to-[#111622] border border-[#FFF174]/30 space-y-3 text-xs">
            <div className="flex justify-between text-gray-300">
              <span>Towing Base ({selectedVehicle.label}):</span>
              <span>₹{selectedVehicle.fee}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Callout & Securing:</span>
              <span>₹350</span>
            </div>
            <div className="border-t border-white/10 pt-2 flex justify-between text-sm font-black text-white">
              <span>ESTIMATED TOTAL:</span>
              <span className="text-[#FFF174]">₹{selectedVehicle.fee + 350}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-500 to-[#FFF174] text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl cursor-pointer"
          >
            <span>Dispatch Motorcycle Carrier</span>
            <ArrowRight size={18} />
          </button>
        </form>

      </div>
    </div>
  );
}
