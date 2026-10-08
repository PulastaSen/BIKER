import { useState, useEffect } from 'react';
import { Search, Wrench, ShieldCheck, Phone, CheckCircle, XCircle, AlertCircle, RefreshCw, ArrowLeft, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchSpareParts } from '../services/ecosystemApi';
import type { SparePart } from '../types/app';

const MOTORCYCLE_MODELS = [
  'All Motorcycles',
  'Royal Enfield Himalayan 450 / 411',
  'KTM Adventure 390 / 250',
  'Hero XPulse 200 4V',
  'BMW G 310 GS',
  'Bajaj Dominar 400',
  'Yamaha MT-15 / R15',
  'Triumph Scrambler 400X',
  'Universal Fitment'
];

const CATEGORIES = [
  'All Categories',
  'Chain & Sprockets',
  'Brakes & Rotors',
  'Cables & Levers',
  'Tyres & Tubes',
  'Electrical & Fuses',
  'Lubricants & Filters'
];

export function SparePartsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModel, setSelectedModel] = useState('All Motorcycles');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [parts, setParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);

  const loadParts = async () => {
    setLoading(true);
    try {
      const modelParam = selectedModel === 'All Motorcycles' ? undefined : selectedModel;
      const res = await searchSpareParts(searchTerm || undefined, modelParam);
      setParts(res);
    } catch (err) {
      console.error('Failed to load spare parts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadParts();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedModel]);

  const filteredParts = parts.filter(part => {
    if (selectedCategory === 'All Categories') return true;
    return part.partCategory?.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className="shell py-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Verified Workshop Stock
            </span>
            <span className="text-xs text-gray-400">Himalayan Corridor Inventory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Genuine Spare Parts Availability</h1>
        </div>
      </div>

      {/* Trust Notice */}
      <div className="mb-6 p-4 rounded-2xl bg-blue-950/30 border border-blue-500/20 text-xs text-blue-200 flex items-start gap-3">
        <AlertCircle size={18} className="text-blue-400 shrink-0 mt-0.5" />
        <p>
          Inventory numbers reflect verified partner and OEM service centers along NH-10, NH-717, and Siliguri foothill hubs. 
          Prices are indicative base part rates without labor. Always contact the workshop before traveling to reserve critical components.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-neutral-900 border border-white/10 space-y-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search parts (e.g. Master Cylinder, Chain Link, Clutch Cable, 21-inch Tube)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400"
            >
              {MOTORCYCLE_MODELS.map((m) => (
                <option key={m} value={m} className="bg-neutral-900">{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-amber-400 text-black'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-gray-400 mb-4 px-1">
        <span>Showing {filteredParts.length} verified listings</span>
        <button
          onClick={loadParts}
          className="flex items-center gap-1.5 hover:text-white transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Stock</span>
        </button>
      </div>

      {/* Parts List */}
      {loading ? (
        <div className="py-16 text-center text-gray-400 space-y-3">
          <RefreshCw size={32} className="animate-spin mx-auto text-amber-400" />
          <p className="text-sm">Querying verified workshop shelves along the corridor...</p>
        </div>
      ) : filteredParts.length === 0 ? (
        <div className="p-8 rounded-2xl bg-neutral-900 border border-white/10 text-center space-y-3">
          <Wrench size={40} className="mx-auto text-gray-600" />
          <h3 className="text-base font-bold text-white">No Parts Matching Search</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            We couldn't find listed inventory matching "{searchTerm}". Try broadening your motorcycle model or request emergency roadside assistance.
          </p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedModel('All Motorcycles'); setSelectedCategory('All Categories'); }}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredParts.map((part) => {
            const inStock = (part.quantityAvailable ?? 0) > 0;
            return (
              <div
                key={part.id || part.partId}
                className="p-5 rounded-2xl bg-neutral-900 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-400">
                        {part.partCategory || part.category || 'Spare Part'}
                      </span>
                      <h3 className="text-base font-bold text-white mt-0.5">{part.partName}</h3>
                      {part.partNumber && (
                        <span className="text-[11px] text-gray-500 font-mono">OEM #{part.partNumber}</span>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-black text-white">₹{(part.priceInr ?? part.price ?? 0).toLocaleString()}</span>
                      <span className="block text-[10px] text-gray-400">indicative part fee</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 my-3 text-xs">
                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-gray-300">
                      Bike: {part.compatibleModels?.[0] || 'Universal'}
                    </span>
                    {inStock ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        <CheckCircle size={12} /> {part.quantityAvailable} in stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 font-bold">
                        <XCircle size={12} /> Order on request
                      </span>
                    )}
                  </div>

                  {/* Workshop Details */}
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5 mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-blue-400" />
                        {part.providerName}
                      </span>
                      {part.distanceKm && (
                        <span className="text-gray-400 flex items-center gap-1 text-[11px]">
                          <MapPin size={11} /> {part.distanceKm.toFixed(1)} km away
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 truncate">{part.locationName || 'Siliguri Workshop Hub'}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <a
                    href={`tel:${part.contactPhone}`}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Phone size={14} /> Call Workshop ({part.contactPhone})
                  </a>
                  <button
                    onClick={() => navigate('/request-help', { state: { prefilledCategory: 'REPAIR', notes: `Part needed: ${part.partName}` } })}
                    className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors"
                  >
                    Request Fitment
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
