import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getBikes, saveBike, deleteBike as removeBikeFromStorage } from '../../utils/appStorage';
import { generateBikeQrTagApi, revokeBikeQrTagApi, fetchUserSubscriptionsApi } from '../../services/ecosystemApi';
import type { Bike, FuelType, UserSubscription, VehicleQrTag } from '../../types/app';
import { getBikeImage, getBikeDisplayName, maskRegistrationNumber, MOTORCYCLE_CATALOG } from '../../utils/bikeUtils';
import { EmptyState } from '../../components/EmptyState';
import {
  Bike as BikeIcon,
  Plus,
  Trash2,
  Edit3,
  Star,
  Check,
  X,
  ShieldCheck,
  QrCode,
  Copy,
  ChevronRight,
  Eye,
  EyeOff,
  Search
} from 'lucide-react';

export function MyBikesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [bikes, setBikes] = useState<Bike[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [maskedRegs, setMaskedRegs] = useState<Record<string, boolean>>({});

  // Add Wizard Modal State (4-step flow)
  const [showAddWizard, setShowAddWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [brandSearch, setBrandSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('Royal Enfield');
  const [selectedModel, setSelectedModel] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [newReg, setNewReg] = useState('');
  const [newYear, setNewYear] = useState('2025');
  const [newFuelType, setNewFuelType] = useState<FuelType>('PETROL');
  const [newCategory, setNewCategory] = useState('Adventure Tourer');
  const [newIsPrimary, setNewIsPrimary] = useState(false);
  const [newNotes, setNewNotes] = useState('');

  // Edit Modal State
  const [editingBike, setEditingBike] = useState<Bike | null>(null);
  const [editBrand, setEditBrand] = useState('');
  const [editModel, setEditModel] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editReg, setEditReg] = useState('');
  const [editYear, setEditYear] = useState('2025');
  const [editFuelType, setEditFuelType] = useState<FuelType>('PETROL');
  const [editIsPrimary, setEditIsPrimary] = useState(false);
  const [editNotes, setEditNotes] = useState('');

  // QR Tag Modal State
  const [activeQrModalBike, setActiveQrModalBike] = useState<Bike | null>(null);
  const [activeQrTag, setActiveQrTag] = useState<VehicleQrTag | null>(null);
  const [qrCopied, setQrCopied] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);

  const loadBikes = async () => {
    if (user) {
      const storedBikes = getBikes(user.id);
      setBikes(storedBikes);
      const subs = await fetchUserSubscriptionsApi(user.id);
      setSubscriptions(subs);
    }
  };

  useEffect(() => {
    loadBikes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const toggleMask = (bikeId: string) => {
    setMaskedRegs((prev) => ({ ...prev, [bikeId]: !prev[bikeId] }));
  };

  const handleOpenAddWizard = () => {
    setWizardStep(1);
    setSelectedBrand('Royal Enfield');
    setSelectedModel('Himalayan 450');
    setCustomModel('');
    setNewReg('');
    setNewYear('2025');
    setNewFuelType('PETROL');
    setNewCategory('Adventure Tourer');
    setNewIsPrimary(bikes.length === 0);
    setNewNotes('');
    setShowAddWizard(true);
  };

  const handleOpenEditModal = (bike: Bike, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingBike(bike);
    setEditBrand(bike.brand);
    setEditModel(bike.model);
    setEditCategory(bike.category || '');
    setEditReg(bike.registrationNumber);
    setEditYear(bike.year.toString());
    setEditFuelType(bike.fuelType);
    setEditIsPrimary(!!bike.isPrimary);
    setEditNotes(bike.notes || '');
  };

  const handleSaveEdit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingBike || !user || !editBrand || !editModel || !editReg) return;

    const updated: Bike = {
      ...editingBike,
      brand: editBrand,
      model: editModel,
      category: editCategory || editingBike.category,
      registrationNumber: editReg.toUpperCase(),
      year: parseInt(editYear, 10) || editingBike.year,
      fuelType: editFuelType,
      isPrimary: editIsPrimary,
      notes: editNotes,
    };

    saveBike(updated);
    loadBikes();
    setEditingBike(null);
  };

  const handleDeleteBike = (bike: Bike, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (window.confirm(`Are you sure you want to remove ${getBikeDisplayName(bike)} from your garage?`)) {
      removeBikeFromStorage(bike.id);
      loadBikes();
    }
  };

  const handleSetPrimary = (bike: Bike, e?: React.MouseEvent) => {
    e?.stopPropagation();
    saveBike({ ...bike, isPrimary: true });
    loadBikes();
  };

  const handleOpenQrModal = async (bike: Bike, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveQrModalBike(bike);
    setQrCopied(false);
    setQrLoading(true);
    try {
      const tag = await generateBikeQrTagApi(bike.id);
      setActiveQrTag(tag);
    } finally {
      setQrLoading(false);
    }
  };

  const handleRevokeQrTag = async (bikeId: string) => {
    if (!window.confirm('Are you sure you want to revoke this QR tag?')) return;
    setQrLoading(true);
    try {
      await revokeBikeQrTagApi(bikeId);
      setActiveQrTag(null);
    } finally {
      setQrLoading(false);
    }
  };

  const handleSaveNewBike = () => {
    if (!user || !selectedBrand || (!selectedModel && !customModel) || !newReg) return;

    const finalModel = selectedModel === '__OTHER__' ? customModel : (selectedModel || customModel || 'Motorcycle');

    const newBike: Bike = {
      id: `bike-${Date.now()}`,
      userId: user.id,
      brand: selectedBrand,
      model: finalModel,
      registrationNumber: newReg.toUpperCase(),
      year: parseInt(newYear, 10) || 2025,
      fuelType: newFuelType,
      category: newCategory,
      isPrimary: newIsPrimary,
      notes: newNotes,
    };

    saveBike(newBike);
    loadBikes();
    setShowAddWizard(false);
  };

  const filteredBrands = MOTORCYCLE_CATALOG.filter((m) =>
    m.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const currentBrandCatalog = MOTORCYCLE_CATALOG.find((m) => m.name === selectedBrand);

  return (
    <div className="min-h-screen bg-[#12161A] text-white flex flex-col font-sans selection:bg-[#FFF174] selection:text-[#12161A] pb-24">
      
      {/* GARAGE HEADER */}
      <div className="bg-[#1A2026] border-b border-[#2E3844] px-4 py-6 sm:px-6 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FFF174] animate-pulse" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#FFF174]">
                YOUR MOTORCYCLE GARAGE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
              My Motorcycles
            </h1>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-xl">
              Keep your motorcycles ready with real-time specs and maintenance history for faster roadside assistance.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddWizard}
            className="px-5 py-3 rounded-xl bg-[#FFF174] hover:bg-yellow-400 active:scale-95 text-[#12161A] font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#FFF174]/15 transition-all cursor-pointer shrink-0 min-h-[46px]"
          >
            <Plus size={16} />
            <span>Add Motorcycle</span>
          </button>
        </div>
      </div>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-5 sm:pt-7 space-y-6">

        {/* SUMMARY STATS TILES */}
        {bikes.length > 0 && (
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#1E252D] border border-[#2E3844] flex flex-col items-center justify-center text-center shadow-md">
              <strong className="text-xl sm:text-2xl font-display font-black text-white">
                {bikes.length}
              </strong>
              <span className="text-[10px] sm:text-xs font-bold text-[#94A3B8] uppercase tracking-wider mt-0.5">
                {bikes.length === 1 ? 'Motorcycle' : 'Motorcycles'}
              </span>
            </div>

            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#1E252D] border border-[#2E3844] flex flex-col items-center justify-center text-center shadow-md">
              <strong className="text-xl sm:text-2xl font-display font-black text-[#FFF174]">
                {bikes.filter((b) => b.isPrimary).length}
              </strong>
              <span className="text-[10px] sm:text-xs font-bold text-[#94A3B8] uppercase tracking-wider mt-0.5">
                Primary Ride
              </span>
            </div>

            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#1E252D] border border-[#2E3844] flex flex-col items-center justify-center text-center shadow-md">
              <strong className="text-xl sm:text-2xl font-display font-black text-[#10B981]">
                {bikes.length}
              </strong>
              <span className="text-[10px] sm:text-xs font-bold text-[#94A3B8] uppercase tracking-wider mt-0.5">
                Ready For Dispatch
              </span>
            </div>
          </div>
        )}

        {/* ========================================================
            COMPACT RESPONSIVE MOTORCYCLE GRID
            - Mobile (<360px): 1 column
            - Mobile (360px-767px): 2 columns with compact, readable height
            - Tablet (768px-1199px): 2 or 3 columns
            - Desktop (1200px+): 3 or 4 columns
            ======================================================== */}
        {bikes.length > 0 ? (
          <div className="grid grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {bikes.map((b) => {
              const displayName = getBikeDisplayName(b);
              const bikeImg = getBikeImage(b);
              const isMasked = maskedRegs[b.id] ?? false;
              const formattedReg = maskRegistrationNumber(b.registrationNumber, isMasked);
              const activeSub = subscriptions.find((s) => s.linkedBike?.bikeId === b.id && s.status === 'ACTIVE');

              return (
                <div
                  key={b.id}
                  onClick={() => navigate(`/rider/bikes/${b.id}`)}
                  className={`rounded-2xl bg-[#1E252D] border transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden shadow-lg group hover:scale-[1.01] ${
                    b.isPrimary ? 'border-[#FFF174]/70 shadow-[#FFF174]/5' : 'border-[#2E3844] hover:border-[#FFF174]'
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') navigate(`/rider/bikes/${b.id}`);
                  }}
                  aria-label={`${displayName} - View Details`}
                >
                  {/* 1. MOTORCYCLE IMAGE WITH UNIFORM HEIGHT & BADGES */}
                  <div className="relative w-full h-36 sm:h-40 bg-[#12161A] overflow-hidden shrink-0">
                    <img
                      src={bikeImg}
                      alt={displayName}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Primary Badge Overlay */}
                    {b.isPrimary && (
                      <div className="absolute top-2.5 left-2.5 bg-[#FFF174] text-[#12161A] font-black text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                        <Star size={11} fill="currentColor" />
                        <span>PRIMARY</span>
                      </div>
                    )}

                    {/* Active Shield RSA Status Pill */}
                    {activeSub && (
                      <div className="absolute top-2.5 right-2.5 bg-emerald-900/80 backdrop-blur-md text-[#10B981] border border-emerald-500/40 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <ShieldCheck size={10} />
                        <span>SHIELD</span>
                      </div>
                    )}
                  </div>

                  {/* 2. CARD CONTENT AREA (COMPACT & BALANCED) */}
                  <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5">
                    
                    {/* Header: Brand Pill & Year */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-1 text-[11px]">
                        <span className="font-mono font-bold uppercase text-[#94A3B8] bg-[#242D37] border border-[#2E3844] px-1.5 py-0.5 rounded text-[10px]">
                          {b.brand}
                        </span>
                        <span className="text-[#94A3B8] font-bold text-[11px]">
                          {b.year} {b.category ? `• ${b.category.split('/')[0].trim()}` : ''}
                        </span>
                      </div>

                      {/* Motorcycle Model Title */}
                      <h2 className="text-sm sm:text-base font-display font-bold text-white group-hover:text-[#FFF174] transition-colors line-clamp-1 leading-snug">
                        {displayName}
                      </h2>
                    </div>

                    {/* Registration Plate Box with Privacy Eye */}
                    <div className="flex items-center justify-between gap-1.5 bg-[#12161A] border border-[#2E3844] px-2.5 py-1 rounded-lg">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-white truncate">
                        <span className="bg-blue-600 text-white text-[8px] font-black px-1 py-0.2 rounded leading-none">IND</span>
                        <span className="tracking-wide">{formattedReg}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMask(b.id);
                        }}
                        className="text-[#94A3B8] hover:text-white p-0.5"
                        title={isMasked ? 'Reveal plate' : 'Mask plate'}
                      >
                        {isMasked ? <Eye size={12} /> : <EyeOff size={12} />}
                      </button>
                    </div>

                    {/* 3 Essential Specifications Badges */}
                    <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                      <div className="bg-[#242D37] border border-[#2E3844] rounded-lg py-1 px-1">
                        <span className="text-[#94A3B8] block text-[9px] uppercase font-mono">Engine</span>
                        <strong className="text-white block font-bold truncate">
                          {b.engine ? b.engine.split(' ')[0] : '450cc'}
                        </strong>
                      </div>
                      <div className="bg-[#242D37] border border-[#2E3844] rounded-lg py-1 px-1">
                        <span className="text-[#94A3B8] block text-[9px] uppercase font-mono">Fuel</span>
                        <strong className="text-[#10B981] block font-bold truncate">
                          {b.fuelType}
                        </strong>
                      </div>
                      <div className="bg-[#242D37] border border-[#2E3844] rounded-lg py-1 px-1">
                        <span className="text-[#94A3B8] block text-[9px] uppercase font-mono">Weight</span>
                        <strong className="text-white block font-bold truncate">
                          {b.weight ? b.weight.split(' ')[0] : '196kg'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* 3. CARD ACTION BAR: CLEAR "VIEW BIKE" & TOUCH-FRIENDLY "EDIT" */}
                  <div className="p-3 pt-0 flex items-center gap-2">
                    {/* Primary Action: View Bike */}
                    <button
                      type="button"
                      onClick={() => navigate(`/rider/bikes/${b.id}`)}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#242D37] hover:bg-[#FFF174] hover:text-[#12161A] text-white border border-[#2E3844] font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer min-h-[38px] group-hover:bg-[#2A3440]"
                    >
                      <span>View Bike</span>
                      <ChevronRight size={14} />
                    </button>

                    {/* Secondary Action: Edit Bike */}
                    <button
                      type="button"
                      onClick={(e) => handleOpenEditModal(b, e)}
                      className="px-3 py-2 rounded-xl bg-[#12161A] hover:bg-[#242D37] text-[#FFF174] border border-[#2E3844] font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer min-h-[38px]"
                      title="Edit motorcycle information"
                    >
                      <Edit3 size={13} />
                      <span className="text-[11px]">Edit</span>
                    </button>

                    {/* Set Primary Button (if not primary) */}
                    {!b.isPrimary && (
                      <button
                        type="button"
                        onClick={(e) => handleSetPrimary(b, e)}
                        className="p-2 rounded-xl bg-[#12161A] hover:bg-[#242D37] text-[#94A3B8] hover:text-[#FFF174] border border-[#2E3844] flex items-center justify-center transition-colors min-h-[38px] min-w-[38px]"
                        title="Set as primary motorcycle"
                      >
                        <Star size={14} />
                      </button>
                    )}

                    {/* Emergency QR sticker */}
                    <button
                      type="button"
                      onClick={(e) => handleOpenQrModal(b, e)}
                      className="p-2 rounded-xl bg-[#12161A] hover:bg-[#242D37] text-indigo-400 border border-[#2E3844] flex items-center justify-center transition-colors min-h-[38px] min-w-[38px]"
                      title="Emergency QR sticker"
                    >
                      <QrCode size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={BikeIcon}
            title="No motorcycles in your garage yet."
            description="Add your first motorcycle to enable instant roadside triage and mechanic dispatch."
            actionLabel="Add Motorcycle"
            onAction={handleOpenAddWizard}
          />
        )}

      </main>

      {/* ========================================================
          ADD MOTORCYCLE EXPERIENCE: 4-STEP GUIDED WIZARD
          ======================================================== */}
      {showAddWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#1E252D] border border-[#2E3844] rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
            
            {/* Header & Steps Counter */}
            <div className="flex items-center justify-between border-b border-[#2E3844] pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#FFF174] tracking-wider block">
                  STEP {wizardStep} OF 4
                </span>
                <h3 className="text-lg font-bold text-white">
                  {wizardStep === 1 && 'Select Motorcycle Make'}
                  {wizardStep === 2 && `Select ${selectedBrand} Model`}
                  {wizardStep === 3 && 'Enter Registration & Details'}
                  {wizardStep === 4 && 'Review & Save to Garage'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddWizard(false)}
                className="p-1.5 rounded-xl text-[#94A3B8] hover:text-white hover:bg-[#242D37]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Step 1: Select Brand */}
            {wizardStep === 1 && (
              <div className="space-y-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="text"
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    placeholder="Search manufacturer (e.g. Royal Enfield, Honda)..."
                    className="w-full bg-[#12161A] border border-[#2E3844] rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#FFF174]"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                  {filteredBrands.map((m) => (
                    <button
                      key={m.name}
                      type="button"
                      onClick={() => {
                        setSelectedBrand(m.name);
                        setSelectedModel(m.popularModels[0] || '');
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedBrand === m.name
                          ? 'bg-[#242D37] border-[#FFF174] text-white shadow-md'
                          : 'bg-[#12161A] border-[#2E3844] text-[#94A3B8] hover:text-white hover:bg-[#1A2026]'
                      }`}
                    >
                      <strong className="text-xs block text-white">{m.name}</strong>
                      <span className="text-[10px] text-[#94A3B8] block">{m.country}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBrand('Other');
                      setSelectedModel('__OTHER__');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedBrand === 'Other'
                        ? 'bg-[#242D37] border-[#FFF174] text-white shadow-md'
                        : 'bg-[#12161A] border-[#2E3844] text-[#94A3B8] hover:text-white hover:bg-[#1A2026]'
                    }`}
                  >
                    <strong className="text-xs block text-white">Other Brand</strong>
                    <span className="text-[10px] text-[#94A3B8] block">Custom Maker</span>
                  </button>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="px-5 py-2.5 rounded-xl bg-[#FFF174] text-[#12161A] font-black text-xs uppercase tracking-wider"
                  >
                    Next: Choose Model →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Select Model */}
            {wizardStep === 2 && (
              <div className="space-y-4">
                <p className="text-xs text-[#94A3B8]">
                  Choose from popular {selectedBrand} models, or enter your custom model below:
                </p>

                {currentBrandCatalog && (
                  <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                    {currentBrandCatalog.popularModels.map((mod) => (
                      <button
                        key={mod}
                        type="button"
                        onClick={() => {
                          setSelectedModel(mod);
                          setCustomModel('');
                        }}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                          selectedModel === mod
                            ? 'bg-[#242D37] border-[#FFF174] text-white font-bold'
                            : 'bg-[#12161A] border-[#2E3844] text-[#CBD5E1] hover:text-white'
                        }`}
                      >
                        {mod}
                      </button>
                    ))}
                  </div>
                )}

                <div>
                  <label className="block text-[#94A3B8] font-bold text-xs mb-1">Or Enter Exact Model / Variant:</label>
                  <input
                    type="text"
                    value={customModel}
                    onChange={(e) => {
                      setCustomModel(e.target.value);
                      setSelectedModel('__OTHER__');
                    }}
                    placeholder="e.g. Scram 411, Interceptor 650 Custom..."
                    className="w-full bg-[#12161A] border border-[#2E3844] rounded-xl px-3 py-2 text-xs text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#FFF174]"
                  />
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="px-4 py-2 rounded-xl bg-[#242D37] text-white text-xs font-bold"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setWizardStep(3)}
                    disabled={!selectedModel && !customModel}
                    className="px-5 py-2.5 rounded-xl bg-[#FFF174] text-[#12161A] font-black text-xs uppercase tracking-wider disabled:opacity-50"
                  >
                    Next: Bike Details →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Registration & Details */}
            {wizardStep === 3 && (
              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">Registration Plate *</label>
                  <input
                    type="text"
                    required
                    value={newReg}
                    onChange={(e) => setNewReg(e.target.value)}
                    placeholder="e.g. WB 74 AB 1234"
                    className="w-full bg-[#12161A] border border-[#2E3844] rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-[#FFF174]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#94A3B8] font-bold mb-1">Model Year</label>
                    <input
                      type="number"
                      value={newYear}
                      onChange={(e) => setNewYear(e.target.value)}
                      className="w-full bg-[#12161A] border border-[#2E3844] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FFF174]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#94A3B8] font-bold mb-1">Fuel Type</label>
                    <select
                      value={newFuelType}
                      onChange={(e) => setNewFuelType(e.target.value as FuelType)}
                      className="w-full bg-[#12161A] border border-[#2E3844] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FFF174]"
                    >
                      <option value="PETROL">Petrol</option>
                      <option value="ELECTRIC">Electric (EV)</option>
                      <option value="HYBRID">Hybrid</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">Category / Purpose</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="e.g. Adventure Tourer, Daily Commute, Cruiser"
                    className="w-full bg-[#12161A] border border-[#2E3844] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FFF174]"
                  />
                </div>

                <label className="flex items-center gap-2 pt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsPrimary}
                    onChange={(e) => setNewIsPrimary(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#FFF174]"
                  />
                  <span className="text-white font-medium">Set as my primary motorcycle</span>
                </label>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="px-4 py-2 rounded-xl bg-[#242D37] text-white text-xs font-bold"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setWizardStep(4)}
                    disabled={!newReg}
                    className="px-5 py-2.5 rounded-xl bg-[#FFF174] text-[#12161A] font-black text-xs uppercase tracking-wider disabled:opacity-50"
                  >
                    Next: Review →
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Review & Save */}
            {wizardStep === 4 && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#12161A] border border-[#2E3844] space-y-2">
                  <span className="text-[10px] font-mono text-[#FFF174] uppercase block">MOTORCYCLE SUMMARY</span>
                  <strong className="text-base font-bold text-white block">
                    {selectedBrand} {selectedModel === '__OTHER__' ? customModel : selectedModel}
                  </strong>
                  <div className="divide-y divide-[#2E3844] text-xs">
                    <div className="py-1.5 flex justify-between">
                      <span className="text-[#94A3B8]">Registration Plate:</span>
                      <strong className="text-white font-mono uppercase">{newReg}</strong>
                    </div>
                    <div className="py-1.5 flex justify-between">
                      <span className="text-[#94A3B8]">Model Year:</span>
                      <strong className="text-white">{newYear}</strong>
                    </div>
                    <div className="py-1.5 flex justify-between">
                      <span className="text-[#94A3B8]">Fuel Type:</span>
                      <strong className="text-[#10B981]">{newFuelType}</strong>
                    </div>
                    <div className="py-1.5 flex justify-between">
                      <span className="text-[#94A3B8]">Category:</span>
                      <strong className="text-white">{newCategory}</strong>
                    </div>
                    <div className="py-1.5 flex justify-between">
                      <span className="text-[#94A3B8]">Role:</span>
                      <strong className={newIsPrimary ? 'text-[#FFF174]' : 'text-white'}>
                        {newIsPrimary ? '★ Primary Motorcycle' : 'Secondary Motorcycle'}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setWizardStep(3)}
                    className="px-4 py-2 rounded-xl bg-[#242D37] text-white text-xs font-bold"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNewBike}
                    className="px-6 py-2.5 rounded-xl bg-[#FFF174] hover:bg-yellow-400 text-[#12161A] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-[#FFF174]/20"
                  >
                    <Check size={16} />
                    <span>Save Motorcycle to Garage</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================
          EDIT MOTORCYCLE MODAL (VISIBLE LABELS & TOUCH-ACCESSIBLE)
          ======================================================== */}
      {editingBike && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#1E252D] border border-[#2E3844] rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#2E3844] pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 size={18} className="text-[#FFF174]" />
                <span>Edit Motorcycle Details</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingBike(null)}
                className="p-1.5 rounded-xl text-[#94A3B8] hover:text-white hover:bg-[#242D37]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#94A3B8] font-bold mb-1">Brand / Manufacturer *</label>
                <input
                  type="text"
                  required
                  value={editBrand}
                  onChange={(e) => setEditBrand(e.target.value)}
                  className="w-full bg-[#12161A] border border-[#2E3844] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FFF174]"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] font-bold mb-1">Model Name *</label>
                <input
                  type="text"
                  required
                  value={editModel}
                  onChange={(e) => setEditModel(e.target.value)}
                  className="w-full bg-[#12161A] border border-[#2E3844] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FFF174]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">Registration Plate *</label>
                  <input
                    type="text"
                    required
                    value={editReg}
                    onChange={(e) => setEditReg(e.target.value)}
                    className="w-full bg-[#12161A] border border-[#2E3844] rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-[#FFF174]"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">Model Year</label>
                  <input
                    type="number"
                    value={editYear}
                    onChange={(e) => setEditYear(e.target.value)}
                    className="w-full bg-[#12161A] border border-[#2E3844] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FFF174]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">Category / Variant</label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    placeholder="Adventure Tourer, Street..."
                    className="w-full bg-[#12161A] border border-[#2E3844] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FFF174]"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">Fuel Type</label>
                  <select
                    value={editFuelType}
                    onChange={(e) => setEditFuelType(e.target.value as FuelType)}
                    className="w-full bg-[#12161A] border border-[#2E3844] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FFF174]"
                  >
                    <option value="PETROL">Petrol</option>
                    <option value="ELECTRIC">Electric (EV)</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#94A3B8] font-bold mb-1">Notes / Modifications</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. Panniers, crash guards, tubeless rims"
                  className="w-full bg-[#12161A] border border-[#2E3844] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FFF174]"
                />
              </div>

              <label className="flex items-center gap-2 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editIsPrimary}
                  onChange={(e) => setEditIsPrimary(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#FFF174]"
                />
                <span className="text-white font-medium">Set as primary motorcycle</span>
              </label>

              <div className="flex items-center justify-between pt-3 border-t border-[#2E3844]">
                <button
                  type="button"
                  onClick={() => handleDeleteBike(editingBike)}
                  className="px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 text-xs font-bold flex items-center gap-1"
                >
                  <Trash2 size={14} />
                  <span>Remove Bike</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingBike(null)}
                    className="px-4 py-2.5 rounded-xl bg-[#242D37] text-white font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#FFF174] hover:bg-yellow-400 text-[#12161A] font-black text-xs uppercase"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          EMERGENCY QR TAG MODAL
          ======================================================== */}
      {activeQrModalBike && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#1E252D] border border-[#2E3844] rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-[#2E3844] pb-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <QrCode size={20} />
                <h3 className="text-base font-bold text-white">Emergency Vehicle QR Tag</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveQrModalBike(null);
                  setActiveQrTag(null);
                }}
                className="p-1.5 rounded-xl text-[#94A3B8] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {qrLoading ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-8 h-8 border-2 border-[#FFF174] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-[#94A3B8]">Generating emergency QR tag...</p>
              </div>
            ) : activeQrTag ? (
              (() => {
                const tagUrl = `${window.location.origin}${window.location.pathname.replace(/\/?$/, '/')}#/qr/${activeQrTag.token}`;
                const qrCodeImg = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(tagUrl)}`;
                return (
                  <div className="space-y-4 text-center">
                    <div className="w-44 h-44 bg-white p-2.5 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                      <img src={qrCodeImg} alt="Vehicle Emergency QR" className="w-full h-full object-contain" />
                    </div>
                    <div className="text-xs space-y-1">
                      <strong className="text-white block font-mono">{activeQrModalBike.registrationNumber}</strong>
                      <p className="text-[11px] text-[#94A3B8]">
                        First responders can scan this sticker on your bike to view vital ICE contacts without accessing private accounts.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(tagUrl);
                          setQrCopied(true);
                          setTimeout(() => setQrCopied(false), 2000);
                        }}
                        className="px-4 py-2 rounded-xl bg-[#242D37] hover:bg-[#2A3440] text-xs font-bold text-white flex items-center gap-1.5"
                      >
                        {qrCopied ? <Check size={14} className="text-[#10B981]" /> : <Copy size={14} />}
                        <span>{qrCopied ? 'Link Copied!' : 'Copy Tag Link'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRevokeQrTag(activeQrModalBike.id)}
                        className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-xs font-bold text-red-300 flex items-center gap-1"
                      >
                        <Trash2 size={14} />
                        <span>Revoke</span>
                      </button>
                    </div>
                  </div>
                );
              })()
            ) : null}
          </div>
        </div>
      )}

    </div>
  );
}
