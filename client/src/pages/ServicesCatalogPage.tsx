import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Wrench, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Search, 
  ChevronRight, 
  X, 
  MapPin, 
  Bike as BikeIcon, 
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getBikes } from '../utils/appStorage';
import { createServiceBookingApi } from '../services/ecosystemApi';
import type { Bike, ServiceCatalogItem, ServiceBooking } from '../types/app';

export const MOTORCYCLE_SERVICES: ServiceCatalogItem[] = [
  {
    id: 'PUNCTURE_REPAIR',
    title: 'Tubeless Puncture & Valve Repair',
    category: 'ROADSIDE_ASSISTANCE',
    shortDesc: 'On-site mushroom plug or strip seal repair for front and rear tubeless tyres.',
    fullDesc: 'Rapid roadside mechanic dispatch equipped with portable 12V high-pressure inflator, heavy-duty reamer, and vulcanizing mushroom plugs. Includes bead check, valve core inspection, and exact pressure inflation.',
    basePrice: 350,
    priceNote: 'Flat rate labor included. Second puncture on same tyre +₹100.',
    turnaroundMinutes: 25,
    supportedVehicles: ['Tubeless Alloy Wheels', 'Tubeless Spoke Rims (Outex/OEM)'],
    inclusions: ['On-site mechanic callout', 'Mushroom plug puncture repair', 'CO2 / 12V pressure inflation to OEM PSI', 'Valve core leak check'],
    exclusions: ['Severely slashed sidewalls requiring new tyre', 'Tube-type spoke wheels requiring tube patch/replacement'],
    cancellationPolicy: 'Free cancellation within 5 minutes of request. After technician dispatch, ₹150 callout fee applies.',
    badge: 'RAPID 25 MIN',
    iconName: 'Disc'
  },
  {
    id: 'TYRE_REPLACEMENT',
    title: 'Tube Replacement & Wheel Care',
    category: 'ROADSIDE_ASSISTANCE',
    shortDesc: 'Punctured tube extraction, new heavy-duty tube fitting, or bent rim support.',
    fullDesc: 'Dedicated repair for tube-type spoked motorcycles (e.g. Royal Enfield Bullet, Classic, Himalayan, Scrambler). Technician carries tyre irons, bead breaker, and standard 17", 18", 19", and 21" tubes.',
    basePrice: 550,
    priceNote: 'Labor ₹550. New tube charged at MRP if supplied by technician.',
    turnaroundMinutes: 35,
    supportedVehicles: ['Spoke Wheels (Tube Type)', 'Adventure 21" Fronts', 'Classic Cruisers'],
    inclusions: ['Wheel removal & refitment', 'Tube puncture inspection & replacement', 'Rim band check', 'Chain tension reset after wheel reinstall'],
    exclusions: ['Wheel hub bearing replacement', 'Alloy crack welding on-site'],
    cancellationPolicy: 'Free cancellation before technician arrival.',
    badge: 'SPOKE SPECIALIST',
    iconName: 'Disc'
  },
  {
    id: 'BATTERY_JUMPSTART',
    title: 'Battery Jumpstart & Health Check',
    category: 'ROADSIDE_ASSISTANCE',
    shortDesc: '12V high-cranking jumpstart, terminal cleanup, and stator charging test.',
    fullDesc: 'Specialized motorcycle jumpstart using surge-protected 12V LiFePO4 jump packs (safe for modern ECUs, TFT clusters, and ride-by-wire throttles). Includes multimeter load testing and alternator charging check.',
    basePrice: 300,
    priceNote: 'Jumpstart labor included. Replacement Exide/Amaron battery available upon quotation.',
    turnaroundMinutes: 20,
    supportedVehicles: ['All 12V Motorcycles & Scooters (100cc to 1300cc)'],
    inclusions: ['12V surge-protected jumpstart', 'Battery terminal corrosion clean & grease', 'Multimeter open-circuit & charging voltage test', 'Parasitic drain quick check'],
    exclusions: ['Physically cracked/leaking lead acid casing'],
    cancellationPolicy: 'Free cancellation within 5 minutes.',
    badge: 'ECU SAFE',
    iconName: 'Zap'
  },
  {
    id: 'MINOR_MECHANICAL',
    title: 'Cables, Spark Plugs & Minor Electricals',
    category: 'ROADSIDE_ASSISTANCE',
    shortDesc: 'Broken clutch/throttle cable, fouled spark plug, or blown fuse replacement.',
    fullDesc: 'Roadside diagnostic and repair for sudden electrical shutdowns and mechanical cable failures. Technician carries universal inner cables, solderless nipples, spare fuses, and standard NGK spark plugs.',
    basePrice: 400,
    priceNote: 'Labor ₹400. Consumables/cables billed at actuals.',
    turnaroundMinutes: 30,
    supportedVehicles: ['All Manual Motorcycles & Maxi-Scooters'],
    inclusions: ['Clutch or throttle cable inner/outer replacement', 'Fuse box diagnosis & relay bypass check', 'Spark plug removal, clean, or replacement', 'Free play adjustment'],
    exclusions: ['Internal gearbox overhaul', 'Burnt ECU / wire harness replacement'],
    cancellationPolicy: 'Free cancellation before dispatch.',
    iconName: 'Wrench'
  },
  {
    id: 'CHAIN_DRIVETRAIN',
    title: 'Chain Recovery, Lube & Master Link',
    category: 'ROADSIDE_ASSISTANCE',
    shortDesc: 'Snapped chain recovery, master link install, and slack tensioning.',
    fullDesc: 'On-road recovery for thrown, dry, or snapped drive chains. Technician carries chain rivet/breaker tool, 428, 520, and 525 O-ring master links, and heavy-duty Motul off-road chain lube.',
    basePrice: 450,
    priceNote: 'Includes slack adjustment & master link fitment. Replacement link ₹120.',
    turnaroundMinutes: 30,
    supportedVehicles: ['Chain-Driven Motorcycles (428, 520, 525, 530 pitch)'],
    inclusions: ['Chain alignment & swingarm slack adjustment', 'Master link press & clip installation', 'Sprocket wear inspection', 'Chain clean & lube spray'],
    exclusions: ['Cracked crankcase from thrown chain', 'Complete chain-sprocket kit replacement on highway'],
    cancellationPolicy: 'Free cancellation within 5 minutes.',
    iconName: 'Wrench'
  },
  {
    id: 'EMERGENCY_FUEL',
    title: 'Emergency Fuel Delivery (2L - 5L)',
    category: 'ROADSIDE_ASSISTANCE',
    shortDesc: 'Emergency delivery of 2 to 5 Litres petrol in certified safe canister.',
    fullDesc: 'Direct delivery of unleaded petrol in government-certified metal or heavy-duty HDPE fuel cans to stranded highway riders. Follows PESO safety guidelines.',
    basePrice: 200,
    priceNote: 'Delivery labor ₹200. Fuel cost billed at actual petrol pump cash receipt.',
    turnaroundMinutes: 30,
    supportedVehicles: ['All Petrol Motorcycles'],
    inclusions: ['Up to 5 Litres petrol delivered to GPS coordinates', 'Fuel funnel & spill-free transfer', 'Air lock bleeding if bike was cranked dry'],
    exclusions: ['Diesel / contaminated custom fuels', 'Delivery into unapproved plastic bottles'],
    cancellationPolicy: 'Non-refundable once fuel is dispensed from pump.',
    badge: '24/7 HIGHWAY',
    iconName: 'Fuel'
  },
  {
    id: 'FLATBED_TOWING',
    title: 'Motorcycle Hydraulic Flatbed Towing',
    category: 'TOWING_RECOVERY',
    shortDesc: 'Safe flatbed towing with front-wheel locking chock & handlebar soft straps.',
    fullDesc: 'Specialized recovery vehicle designed exclusively for two-wheelers. Features low-angle hydraulic bed, front-wheel roll-in chock, and 4-point soft ratchet straps to protect fairings, forks, and handlebars from cosmetic damage.',
    basePrice: 1200,
    priceNote: 'Base callout covers up to 10 km. Additional distance at ₹45 per km.',
    turnaroundMinutes: 45,
    supportedVehicles: ['Cruisers, Supersports, ADVs, Tourers up to 450 kg'],
    inclusions: ['Hydraulic ramp loading & soft-strap tie-down', 'Safe transit to chosen workshop or home', 'Transit damage insurance protection', 'Live GPS tracking during tow'],
    exclusions: ['Rope towing behind car/auto (prohibited for rider safety)'],
    cancellationPolicy: 'Free cancellation until tow truck departs base station.',
    badge: 'SOFT-STRAP SAFE',
    iconName: 'Truck'
  },
  {
    id: 'ACCIDENT_RECOVERY',
    title: 'Accident Winching & Police Station Transit',
    category: 'TOWING_RECOVERY',
    shortDesc: 'Heavy-duty 5-ton winch recovery from ravines, slopes, and crash transit.',
    fullDesc: 'Specialized extraction service for motorcycles that have veered off road into ditches, ravines, or riverbeds. Includes digital photo documentation of damaged components for insurance surveyor claims.',
    basePrice: 2200,
    priceNote: 'Base winching + 15 km transit. Complex mountain gorge winching quoted on-site.',
    turnaroundMinutes: 45,
    supportedVehicles: ['All Motorcycles & Quads'],
    inclusions: ['5-Ton remote winch recovery from slopes/ditches', 'Photo log of pre-tow damages for insurance claim', 'Coordination with local highway police / GD copy', 'Safe custody storage up to 24 hrs'],
    exclusions: ['Unrecovered vehicles in active water currents'],
    cancellationPolicy: 'Advance notice required.',
    badge: '5-TON WINCH',
    iconName: 'Truck'
  },
  {
    id: 'KEY_LOCK_ASSIST',
    title: 'Broken Key Extraction & Lock Relay',
    category: 'ROADSIDE_ASSISTANCE',
    shortDesc: 'Extraction of snapped key from ignition/tank cap, or home spare key courier.',
    fullDesc: 'Gentle extraction of broken brass or steel key blades from motorcycle ignition barrels, fuel caps, or pannier locks using precision extractor picks. Includes spare key relay coordination.',
    basePrice: 400,
    priceNote: 'Extraction ₹400. Lock replacement quoted separately if tumbler is damaged.',
    turnaroundMinutes: 35,
    supportedVehicles: ['All Key-Operated Motorcycles & Pannier Cases'],
    inclusions: ['Non-destructive key fragment extraction', 'Lock barrel graphite lubrication', 'Emergency ignition switch bypass check (with valid RC proof)'],
    exclusions: ['Transponder immobilizer reprogramming (OEM dealer required)'],
    cancellationPolicy: 'Free cancellation within 5 minutes.',
    iconName: 'Key'
  },
  {
    id: 'SCHEDULED_PERIODIC',
    title: 'Doorstep 21-Point Periodic Service',
    category: 'DOORSTEP_CARE',
    shortDesc: 'Scheduled oil change, brake overhaul, filters, and safety check at your doorstep.',
    fullDesc: 'Comprehensive maintenance performed at your residence or workplace by a certified motorcycle mechanic. Includes Motul/Castrol semi or fully-synthetic oil flush, filter cleaning, and full chain service.',
    basePrice: 899,
    priceNote: 'Labor ₹899. Engine oil, oil filter, and spark plug billed at actual MRP.',
    turnaroundMinutes: 90,
    supportedVehicles: ['All Commuters, Sports, & Adventure Bikes (100cc to 650cc)'],
    inclusions: ['Engine oil change & oil filter replacement', 'Air filter clean/replacement & spark plug check', 'Brake pad inspection & caliper degreasing', 'Chain wash, brush, tension, & lube', '21-Point chassis, clutch, & electrical health audit'],
    exclusions: ['Engine teardown / valve clearance adjustment'],
    cancellationPolicy: 'Reschedule or cancel free up to 2 hours before scheduled slot.',
    badge: 'DOORSTEP CARE',
    iconName: 'Calendar'
  },
  {
    id: 'DOORSTEP_FITMENT',
    title: 'Brake Pads & Wear Parts Fitment',
    category: 'DOORSTEP_CARE',
    shortDesc: 'Professional fitment of brake pads, levers, cables, or accessories at home.',
    fullDesc: 'Book an authorized technician to fit rider-supplied parts or MotoAssist verified spares. Avoid riding to crowded workshops for basic wear-and-tear items.',
    basePrice: 350,
    priceNote: 'Labor per component. Free torque specification audit.',
    turnaroundMinutes: 45,
    supportedVehicles: ['All Motorcycle Categories'],
    inclusions: ['Front and/or rear brake pad installation', 'Caliper pin cleaning & copper grease application', 'Brake fluid level inspection', 'Brake lever free-play adjustment'],
    exclusions: ['Full hydraulic line ABS bleeding (requires workshop pump)'],
    cancellationPolicy: 'Free cancellation up to 1 hour before appointment.',
    iconName: 'Wrench'
  },
  {
    id: 'WORKSHOP_PICKDROP',
    title: 'Workshop Pick-up, Service & Return Drop',
    category: 'WORKSHOP_SERVICE',
    shortDesc: 'Doorstep bike pickup, transport to authorized OEM dealer, and return delivery.',
    fullDesc: 'Effortless major servicing for busy riders. A bonded MotoAssist transit rider conducts a digital pre-service condition inspection, delivers your motorcycle to an authorized OEM workshop, tracks repair progress, and returns your serviced bike.',
    basePrice: 650,
    priceNote: 'Transit fee ₹650 both ways. Workshop service invoice paid directly at actuals.',
    turnaroundMinutes: 120,
    supportedVehicles: ['All Motorcycles'],
    inclusions: ['Pre-transit 360° video condition inspection', 'Transit to authorized OEM workshop (KTM, Royal Enfield, Yamaha, Honda, Triumph)', 'Live job-card updates via WhatsApp/app', 'Clean return delivery to your doorstep'],
    exclusions: ['Payment for unauthorized unauthorized extra repairs'],
    cancellationPolicy: 'Free cancellation before rider arrives for pickup.',
    badge: 'CONCIERGE',
    iconName: 'Truck'
  }
];

export function ServicesCatalogPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedService, setSelectedService] = useState<ServiceCatalogItem | null>(null);
  const [userBikes, setUserBikes] = useState<Bike[]>([]);
  const [selectedBikeId, setSelectedBikeId] = useState<string>('');
  const [customBrand, setCustomBrand] = useState<string>('Royal Enfield');
  const [customModel, setCustomModel] = useState<string>('Himalayan 450');
  const [customReg, setCustomReg] = useState<string>('WB-74-AB-8921');
  const [locationAddress, setLocationAddress] = useState<string>('Sevoke Road, Siliguri, West Bengal');
  const [landmark, setLandmark] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('');
  
  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingConfirmed, setBookingConfirmed] = useState<ServiceBooking | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const bikes = getBikes(user.id);
      setUserBikes(bikes);
      if (bikes.length > 0) {
        setSelectedBikeId(bikes[0].id);
      }
    }

    const preselect = searchParams.get('service');
    if (preselect) {
      const found = MOTORCYCLE_SERVICES.find(s => s.id === preselect);
      if (found) setSelectedService(found);
    }
  }, [user, searchParams]);

  // Filter logic
  const filteredServices = MOTORCYCLE_SERVICES.filter(service => {
    const matchesCategory = activeCategory === 'ALL' || service.category === activeCategory;
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          service.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          service.supportedVehicles.some(v => v.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const chosenBike = userBikes.find(b => b.id === selectedBikeId);
    const bikeDetails = chosenBike ? {
      brand: chosenBike.brand,
      model: chosenBike.model,
      registrationNumber: chosenBike.registrationNumber,
      fuelType: chosenBike.fuelType
    } : {
      brand: customBrand,
      model: customModel,
      registrationNumber: customReg,
      fuelType: 'PETROL'
    };

    try {
      const booking = await createServiceBookingApi({
        userId: user?.id || 'user-rider-1',
        riderName: user?.name || 'Pulasta Sen',
        riderPhone: user?.phone || '+91 98765 43210',
        serviceType: selectedService.id,
        serviceName: selectedService.title,
        bikeDetails,
        location: {
          address: locationAddress,
          lat: 26.7412,
          lng: 88.4285,
          landmark: landmark || undefined
        },
        scheduledTime: scheduledTime ? new Date(scheduledTime).toISOString() : undefined,
        pricing: {
          baseRate: selectedService.basePrice,
          travelFee: selectedService.category === 'TOWING_RECOVERY' ? 250 : 100,
          partsEstimate: 0,
          totalEstimated: selectedService.basePrice + (selectedService.category === 'TOWING_RECOVERY' ? 250 : 100),
          disclaimer: selectedService.priceNote
        }
      });

      setBookingConfirmed(booking);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit service booking. Please check connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#151515] text-white pt-20 pb-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase text-[#FFF174] tracking-widest mb-1">
              <Wrench size={16} />
              <span>MOTORCYCLE ROADSIDE & SERVICE CATALOGUE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">On-Demand Two-Wheeler Care</h1>
            <p className="text-sm text-[#C5C5C5] mt-1 max-w-2xl">
              Transparent, doorstep, and highway mechanical assistance engineered exclusively for motorcycles. Upfront transparent rates, verified mechanics, and real tracking.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/subscriptions')}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#FFF174]/50 hover:bg-white/10 text-xs font-bold text-[#FFF174] flex items-center gap-1.5 transition-all"
            >
              <ShieldCheck size={16} />
              <span>View RSA Subscription Plans</span>
            </button>
          </div>
        </div>

        {/* Search & Category Filter Navigation */}
        <div className="space-y-4">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search services (e.g. tubeless puncture, 390 Adventure chain, flatbed tow, jumpstart)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1D1D1D] border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:border-[#FFF174] focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'ALL', label: 'All Services' },
              { id: 'ROADSIDE_ASSISTANCE', label: 'Roadside Assistance (RSA)' },
              { id: 'TOWING_RECOVERY', label: 'Flatbed Towing & Winch' },
              { id: 'DOORSTEP_CARE', label: 'Doorstep Maintenance' },
              { id: 'WORKSHOP_SERVICE', label: 'Workshop Concierge' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all border ${
                  activeCategory === cat.id
                    ? 'bg-[#FFF174] text-black border-[#FFF174] shadow-md shadow-yellow-500/10'
                    : 'bg-[#1D1D1D] text-[#C5C5C5] border-white/10 hover:border-white/20 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map(service => (
            <div 
              key={service.id}
              className="bg-[#1D1D1D] border border-white/10 hover:border-[#FFF174]/50 rounded-2xl p-5 flex flex-col justify-between transition-all group hover:shadow-xl hover:shadow-black/50"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FFF174] group-hover:bg-[#FFF174] group-hover:text-black transition-colors">
                    <Wrench size={20} />
                  </div>
                  {service.badge && (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FFF174]/15 border border-[#FFF174]/30 text-[#FFF174]">
                      {service.badge}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-black text-white group-hover:text-[#FFF174] transition-colors">{service.title}</h3>
                  <p className="text-xs text-[#C5C5C5] line-clamp-2 mt-1">{service.shortDesc}</p>
                </div>

                <div className="pt-2 border-t border-white/5 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Clock size={14} className="text-[#FFF174]" />
                    <span>Avg Response: <strong className="text-white">{service.turnaroundMinutes} mins</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    <span className="line-clamp-1">{service.supportedVehicles[0]}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Starting At</span>
                  <span className="text-lg font-black text-[#FFF174]">₹{service.basePrice}</span>
                </div>

                <button
                  onClick={() => setSelectedService(service)}
                  className="px-4 py-2 rounded-xl bg-[#FFF174] text-black font-extrabold text-xs flex items-center gap-1 hover:bg-yellow-400 active:scale-95 transition-all shadow-md shadow-yellow-500/20"
                >
                  <span>Book Now</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="bg-[#1D1D1D] border border-white/10 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4">
            <AlertCircle size={36} className="text-gray-500 mx-auto" />
            <h3 className="text-lg font-bold">No services found</h3>
            <p className="text-xs text-gray-400">Try searching with a broader term or reset category filters.</p>
            <button
              onClick={() => { setActiveCategory('ALL'); setSearchQuery(''); }}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* COMPACT MODAL: REAL ON-DEMAND BOOKING OVERLAY */}
      {selectedService && !bookingConfirmed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#1D1D1D] border border-white/15 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 space-y-6 shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-[#FFF174] tracking-widest block">CONFIRM SERVICE BOOKING</span>
                <h2 className="text-2xl font-black text-white">{selectedService.title}</h2>
                <p className="text-xs text-[#C5C5C5] mt-0.5">{selectedService.shortDesc}</p>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="p-2 text-gray-400 hover:text-white rounded-xl bg-white/5 border border-white/10"
              >
                <X size={18} />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-5">
              
              {/* Motorcycle Selection */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                  <BikeIcon size={14} className="text-[#FFF174]" />
                  <span>Select Motorcycle</span>
                </label>

                {userBikes.length > 0 ? (
                  <select
                    value={selectedBikeId}
                    onChange={(e) => setSelectedBikeId(e.target.value)}
                    className="w-full bg-[#252525] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-[#FFF174] focus:outline-none"
                  >
                    {userBikes.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.brand} {b.model} • {b.registrationNumber}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Brand (e.g. KTM)"
                      value={customBrand}
                      onChange={(e) => setCustomBrand(e.target.value)}
                      className="bg-[#252525] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Model (e.g. 390 Adventure)"
                      value={customModel}
                      onChange={(e) => setCustomModel(e.target.value)}
                      className="bg-[#252525] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Reg Plate (e.g. WB-74-XXXX)"
                      value={customReg}
                      onChange={(e) => setCustomReg(e.target.value)}
                      className="bg-[#252525] border border-white/10 rounded-xl px-3 py-2 text-xs text-white uppercase"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Service Location */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#FFF174]" />
                  <span>Breakdown / Service Location</span>
                </label>
                <input
                  type="text"
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  placeholder="Street, Landmark, or Highway Milestone..."
                  className="w-full bg-[#252525] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-[#FFF174] focus:outline-none"
                  required
                />
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Nearby Landmark / Gate / Viewpoint (Optional)"
                  className="w-full bg-[#252525] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 focus:border-[#FFF174] focus:outline-none"
                />
              </div>

              {/* Scheduling (Immediate vs Later) */}
              {selectedService.category === 'DOORSTEP_CARE' || selectedService.category === 'WORKSHOP_SERVICE' ? (
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                    <Calendar size={14} className="text-[#FFF174]" />
                    <span>Preferred Appointment Date & Time</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full bg-[#252525] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-[#FFF174] focus:outline-none"
                  />
                </div>
              ) : null}

              {/* Transparent Price & Policy Disclosure */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between items-center text-gray-300">
                  <span>Base Service Fee</span>
                  <span className="font-bold text-white">₹{selectedService.basePrice}</span>
                </div>
                <div className="flex justify-between items-center text-gray-300">
                  <span>Travel / Technician Callout Fee</span>
                  <span className="font-bold text-white">₹{selectedService.category === 'TOWING_RECOVERY' ? 250 : 100}</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between items-center text-sm font-black">
                  <span className="text-[#FFF174]">Total Estimated Cost</span>
                  <span className="text-[#FFF174]">
                    ₹{selectedService.basePrice + (selectedService.category === 'TOWING_RECOVERY' ? 250 : 100)}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 italic pt-1">
                  {selectedService.priceNote}
                </p>
              </div>

              {/* Inclusions summary */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">What's Covered:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {selectedService.inclusions.map((inc, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-gray-300">
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                      <span className="truncate">{inc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedService(null)}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-2 py-3 rounded-xl bg-[#FFF174] text-black font-black text-xs hover:bg-yellow-400 active:scale-95 transition-all shadow-lg shadow-yellow-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Confirming Dispatch...' : `Confirm & Request Dispatch (₹${selectedService.basePrice + (selectedService.category === 'TOWING_RECOVERY' ? 250 : 100)})`}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* BOOKING CONFIRMED SUCCESS DIALOG */}
      {bookingConfirmed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#1D1D1D] border border-emerald-500/30 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">BOOKING RECORDED & PERSISTED</span>
              <h2 className="text-2xl font-black text-white">Technician Dispatch Initiated</h2>
              <p className="text-xs text-[#C5C5C5]">
                Your booking ID is <strong className="text-[#FFF174] font-mono">{bookingConfirmed.bookingId}</strong>. Nearby verified mechanics have received your vehicle details.
              </p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Service:</span>
                <span className="font-bold text-white">{bookingConfirmed.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Motorcycle:</span>
                <span className="font-bold text-[#FFF174]">{bookingConfirmed.bikeDetails.brand} {bookingConfirmed.bikeDetails.model} ({bookingConfirmed.bikeDetails.registrationNumber})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Location:</span>
                <span className="font-bold text-white line-clamp-1">{bookingConfirmed.location.address}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2">
                <span className="text-gray-400">Initial Status:</span>
                <span className="font-black text-emerald-400 uppercase tracking-wider">{bookingConfirmed.status}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setBookingConfirmed(null);
                  setSelectedService(null);
                }}
                className="flex-1 py-3 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/15 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => navigate('/rider/requests')}
                className="flex-1 py-3 rounded-xl bg-[#FFF174] text-black font-black text-xs hover:bg-yellow-400 transition-colors shadow-md shadow-yellow-500/20"
              >
                Track on Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
