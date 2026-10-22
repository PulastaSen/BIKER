import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getBikes, saveBike, deleteBike as removeBikeFromStorage } from '../../utils/appStorage';
import { generateBikeQrTagApi, revokeBikeQrTagApi, fetchUserSubscriptionsApi } from '../../services/ecosystemApi';
import type { Bike, FuelType, UserSubscription, VehicleQrTag } from '../../types/app';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import {
  Bike as BikeIcon,
  Plus,
  Trash2,
  Edit3,
  Star,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Sparkles,
  QrCode,
  Copy,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { getAssetUrl } from '../../utils/assets';

export function MyBikesPage() {
  const { user } = useAuth();
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBike, setEditingBike] = useState<Bike | undefined>();
  const [expandedBikeIds, setExpandedBikeIds] = useState<Record<string, boolean>>({});

  // QR Modal State
  const [activeQrModalBike, setActiveQrModalBike] = useState<Bike | null>(null);
  const [activeQrTag, setActiveQrTag] = useState<VehicleQrTag | null>(null);
  const [qrCopied, setQrCopied] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);

  // Form State
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('');
  const [reg, setReg] = useState('');
  const [year, setYear] = useState('2025');
  const [fuelType, setFuelType] = useState<FuelType>('PETROL');
  const [isPrimary, setIsPrimary] = useState(false);
  const [notes, setNotes] = useState('');

  const loadBikes = async () => {
    if (user) {
      setBikes(getBikes(user.id));
      const subs = await fetchUserSubscriptionsApi(user.id);
      setSubscriptions(subs);
    }
  };

  useEffect(() => {
    loadBikes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleOpenQrModal = async (bike: Bike) => {
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
    if (!window.confirm('Are you sure you want to revoke this QR tag? Any existing printed stickers or tags will stop working.')) return;
    setQrLoading(true);
    try {
      await revokeBikeQrTagApi(bikeId);
      setActiveQrTag(null);
    } finally {
      setQrLoading(false);
    }
  };

  const toggleSpecs = (bikeId: string) => {
    setExpandedBikeIds((prev) => ({ ...prev, [bikeId]: !prev[bikeId] }));
  };

  const handleOpenAddModal = () => {
    setEditingBike(undefined);
    setBrand('');
    setModel('');
    setCategory('');
    setReg('');
    setYear('2025');
    setFuelType('PETROL');
    setIsPrimary(bikes.length === 0);
    setNotes('');
    setShowModal(true);
  };

  const handleOpenEditModal = (bike: Bike) => {
    setEditingBike(bike);
    setBrand(bike.brand);
    setModel(bike.model);
    setCategory(bike.category || '');
    setReg(bike.registrationNumber);
    setYear(bike.year.toString());
    setFuelType(bike.fuelType);
    setIsPrimary(!!bike.isPrimary);
    setNotes(bike.notes || '');
    setShowModal(true);
  };

  const handleSubmitBike = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !brand || !model || !reg) return;

    const newBike: Bike = {
      id: editingBike ? editingBike.id : `bike-${Date.now()}`,
      userId: user.id,
      brand,
      model,
      registrationNumber: reg.toUpperCase(),
      year: parseInt(year, 10) || 2025,
      fuelType,
      isPrimary,
      category: category || editingBike?.category || 'Motorcycle',
      engine: editingBike?.engine,
      power: editingBike?.power,
      torque: editingBike?.torque,
      weight: editingBike?.weight,
      tankCapacity: editingBike?.tankCapacity,
      seatHeight: editingBike?.seatHeight,
      groundClearance: editingBike?.groundClearance,
      brakes: editingBike?.brakes,
      features: editingBike?.features,
      notes,
    };

    saveBike(newBike);
    loadBikes();
    setShowModal(false);
  };

  const handleDeleteBike = (id: string) => {
    if (window.confirm('Are you sure you want to remove this motorcycle from your garage?')) {
      removeBikeFromStorage(id);
      loadBikes();
    }
  };

  const handleSetPrimary = (bike: Bike) => {
    saveBike({ ...bike, isPrimary: true });
    loadBikes();
  };

  // Helper function to format clear bike display name
  const getBikeDisplayName = (bike: Bike) => {
    const brandName = (bike.brand || '').trim();
    const modelName = (bike.model || '').trim();
    if (!brandName && !modelName) return 'Motorcycle';
    if (!brandName) return modelName;
    if (!modelName) return brandName;
    if (modelName.toLowerCase().includes(brandName.toLowerCase())) {
      return modelName;
    }
    return `${brandName} ${modelName}`;
  };

  // Helper function to resolve dynamic image path
  const getBikeImage = (bike: Bike) => {
    const bModel = bike.model.toLowerCase();
    const bBrand = (bike.brand || '').toLowerCase();
    if (bModel.includes('himalayan') || bBrand.includes('royal enfield')) {
      return getAssetUrl('/images/bikes/himalayan-450/himalayan-450-main.jpg');
    }
    if (bModel.includes('transalp') || (bBrand.includes('honda') && bModel.includes('750'))) {
      return getAssetUrl('/images/bikes/transalp-750/transalp-750-main.jpg');
    }
    if (bModel.includes('tiger') || bBrand.includes('triumph')) {
      return getAssetUrl('/images/bikes/tiger-900/tiger-900-main.jpg');
    }
    if (bModel.includes('390 adventure') || bModel.includes('ktm') || bBrand.includes('ktm')) {
      return getAssetUrl('/images/bikes/ktm-390-adventure/ktm-390-adventure-main.jpg');
    }
    if (bModel.includes('pulsar') || bModel.includes('n160') || bBrand.includes('bajaj')) {
      return getAssetUrl('/images/bikes/pulsar-n160/pulsar-n160-main.jpg');
    }
    return getAssetUrl('/images/motoassist-hero.jpg');
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">YOUR GARAGE</p>
          <h1>My Motorcycles</h1>
          <p className="subtitle">Keep your motorcycles ready with real-time specs for faster roadside assistance.</p>
        </div>
        <div>
          <Button onClick={handleOpenAddModal}>
            <Plus size={18} /> Add Motorcycle
          </Button>
        </div>
      </header>

      {/* Summary Cards */}
      {bikes.length > 0 && (
        <div className="network-stats-grid" style={{ marginBottom: '2rem' }}>
          <div className="stat-box">
            <strong className="stat-number">{bikes.length}</strong>
            <span className="stat-label">Motorcycles</span>
          </div>
          <div className="stat-box">
            <strong className="stat-number">{bikes.filter((b) => b.isPrimary).length}</strong>
            <span className="stat-label">Primary Bike</span>
          </div>
          <div className="stat-box">
            <strong className="stat-number">{bikes.length}</strong>
            <span className="stat-label">Ready for Support</span>
          </div>
        </div>
      )}

      {bikes.length > 0 ? (
        <div className="bikes-grid">
          {bikes.map((b) => {
            const isExpanded = !!expandedBikeIds[b.id];
            return (
              <div key={b.id} className={`bike-garage-card ${b.isPrimary ? 'is-primary' : ''}`}>
                <div className="bike-garage-card__image">
                  <img src={getBikeImage(b)} alt={getBikeDisplayName(b)} loading="lazy" />
                  {b.isPrimary && (
                    <div className="primary-badge-overlay">
                      <Star size={14} fill="currentColor" /> PRIMARY BIKE
                    </div>
                  )}
                </div>
                
                <div className="bike-garage-card__body" style={{ color: '#0F172A', display: 'flex', flexDirection: 'column' }}>
                  {/* Brand & Category Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span
                        className="bike-brand-badge"
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: '#475569',
                          background: '#F1F5F9',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '5px',
                          border: '1px solid #CBD5E1',
                        }}
                      >
                        {b.brand || 'Motorcycle'}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 700 }}>
                        Year {b.year}
                      </span>
                    </div>

                    {b.category && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#0369A1',
                          background: '#E0F2FE',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '12px',
                          border: '1px solid #BAE6FD',
                        }}
                      >
                        {b.category}
                      </span>
                    )}
                  </div>

                  {/* Bike Title */}
                  <h3
                    className="bike-card-title"
                    style={{
                      fontSize: '1.4rem',
                      fontWeight: 800,
                      color: '#0F172A',
                      lineHeight: 1.25,
                      marginTop: '0.2rem',
                      marginBottom: '0.55rem',
                      letterSpacing: '-0.02em',
                      textDecoration: 'none',
                    }}
                  >
                    {getBikeDisplayName(b)}
                  </h3>

                  {/* Registration Number & Status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    <div
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        color: '#0F172A',
                        background: '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        padding: '0.25rem 0.65rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#2563EB', background: '#DBEAFE', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>IND</span>
                      <span>{b.registrationNumber}</span>
                    </div>

                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: b.isPrimary ? '#854D0E' : '#475569',
                        background: b.isPrimary ? '#FEF9C3' : '#F1F5F9',
                        border: b.isPrimary ? '1px solid #FDE047' : '1px solid #E2E8F0',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '20px',
                      }}
                    >
                      {b.isPrimary ? '★ Primary Ride' : 'Active Bike'}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#059669',
                        background: '#ECFDF5',
                        border: '1px solid #A7F3D0',
                        padding: '0.25rem 0.55rem',
                        borderRadius: '20px',
                      }}
                    >
                      {b.fuelType}
                    </span>
                  </div>

                  {/* Technical Specifications 4-Grid */}
                  <div className="bike-specs-grid">
                    <div className="bike-spec-cell">
                      <span className="bike-spec-label">Engine / CC</span>
                      <span className="bike-spec-value" title={b.engine || 'Standard'}>
                        {b.engine ? b.engine.split(' ')[0] : `${b.year} Spec`}
                      </span>
                    </div>
                    <div className="bike-spec-cell">
                      <span className="bike-spec-label">Max Power</span>
                      <span className="bike-spec-value">{b.power || 'Factory Spec'}</span>
                    </div>
                    <div className="bike-spec-cell">
                      <span className="bike-spec-label">Kerb Weight</span>
                      <span className="bike-spec-value">{b.weight || 'Standard'}</span>
                    </div>
                    <div className="bike-spec-cell">
                      <span className="bike-spec-label">Fuel Tank</span>
                      <span className="bike-spec-value">{b.tankCapacity || 'Standard'}</span>
                    </div>
                  </div>

                  {/* Key Features Chips */}
                  {b.features && b.features.length > 0 && (
                    <div className="bike-feature-chips">
                      {b.features.slice(0, 3).map((feat, idx) => (
                        <span key={idx} className="bike-feature-chip">
                          <ShieldCheck size={12} className="text-emerald-600" />
                          {feat}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Toggle Detailed Specs Button */}
                  <button
                    type="button"
                    className="bike-specs-toggle-btn"
                    onClick={() => toggleSpecs(b.id)}
                    style={{ textDecoration: 'none' }}
                  >
                    {isExpanded ? (
                      <>
                        <span>Hide Full Technical Specs</span>
                        <ChevronUp size={16} />
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} className="text-amber-500" />
                        <span>View Full Specs & Electronics</span>
                        <ChevronDown size={16} />
                      </>
                    )}
                  </button>

                  {/* Expanded Full Specs Drawer */}
                  {isExpanded && (
                    <div className="bike-expanded-specs">
                      {b.engine && (
                        <div className="bike-detail-row">
                          <span className="bike-detail-label">Engine Architecture:</span>
                          <span className="bike-detail-val">{b.engine}</span>
                        </div>
                      )}
                      {b.torque && (
                        <div className="bike-detail-row">
                          <span className="bike-detail-label">Max Torque:</span>
                          <span className="bike-detail-val">{b.torque}</span>
                        </div>
                      )}
                      {b.groundClearance && (
                        <div className="bike-detail-row">
                          <span className="bike-detail-label">Ground Clearance:</span>
                          <span className="bike-detail-val">{b.groundClearance}</span>
                        </div>
                      )}
                      {b.seatHeight && (
                        <div className="bike-detail-row">
                          <span className="bike-detail-label">Seat Height:</span>
                          <span className="bike-detail-val">{b.seatHeight}</span>
                        </div>
                      )}
                      {b.brakes && (
                        <div className="bike-detail-row">
                          <span className="bike-detail-label">Brakes & ABS:</span>
                          <span className="bike-detail-val">{b.brakes}</span>
                        </div>
                      )}
                      {b.features && b.features.length > 3 && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <span className="bike-detail-label" style={{ display: 'block', marginBottom: '0.35rem' }}>Full Electronics & Equipment:</span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                            {b.features.map((f, i) => (
                              <span key={i} className="bike-feature-chip" style={{ fontSize: '0.72rem' }}>
                                ✓ {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {b.notes && (
                    <p className="notes-text" style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
                      <strong style={{ color: '#0F172A' }}>Corridor Notes:</strong> {b.notes}
                    </p>
                  )}
                  
                  {/* Active Roadside Protection Plan Badge */}
                  {(() => {
                    const activeSub = subscriptions.find(s => s.linkedBike?.bikeId === b.id && s.status === 'ACTIVE');
                    if (activeSub) {
                      return (
                        <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <ShieldCheck size={16} style={{ color: '#059669' }} />
                            <div>
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#065F46', display: 'block' }}>
                                {activeSub.planName}
                              </span>
                              <span style={{ fontSize: '0.68rem', color: '#047857' }}>
                                {activeSub.features.maxFreeBreakdowns - activeSub.features.usedBreakdowns} Free Breakdowns Left • Free Towing to {activeSub.features.towingDistanceLimitKm}km
                              </span>
                            </div>
                          </div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#059669', background: '#D1FAE5', padding: '0.15rem 0.45rem', borderRadius: '5px' }}>
                            ACTIVE
                          </span>
                        </div>
                      );
                    }
                    return (
                      <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: '#FEFCE8', border: '1px solid #FEF08A', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <AlertTriangle size={15} style={{ color: '#CA8A04' }} />
                          <div>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#854D0E', display: 'block' }}>
                              Standard Pay-Per-Incident RSA
                            </span>
                            <span style={{ fontSize: '0.68rem', color: '#A16207' }}>
                              Towing & labor billed at standard callout rate
                            </span>
                          </div>
                        </div>
                        <a
                          href="#/subscriptions"
                          style={{ fontSize: '0.7rem', fontWeight: 800, color: '#854D0E', background: '#FEF08A', padding: '0.2rem 0.55rem', borderRadius: '6px', textDecoration: 'none' }}
                        >
                          Add Shield Plan →
                        </a>
                      </div>
                    );
                  })()}

                  {/* Vehicle Garage Maintenance Health Metrics (Phase 9) */}
                  <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.75rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', fontSize: '0.72rem' }}>
                    <div>
                      <span style={{ color: '#64748B', display: 'block', fontWeight: 600 }}>Drive Chain Maintenance</span>
                      <strong style={{ color: '#0F172A', fontWeight: 800 }}>Lube every 500 km</strong>
                      <span style={{ color: '#059669', display: 'block', fontSize: '0.65rem' }}>✓ Cleaned & Tensioned</span>
                    </div>
                    <div>
                      <span style={{ color: '#64748B', display: 'block', fontWeight: 600 }}>Engine Oil Service</span>
                      <strong style={{ color: '#0F172A', fontWeight: 800 }}>Every 5,000 km</strong>
                      <span style={{ color: '#2563EB', display: 'block', fontSize: '0.65rem' }}>Motul Synthetic 10W-50</span>
                    </div>
                    <div>
                      <span style={{ color: '#64748B', display: 'block', fontWeight: 600 }}>Tyre Pressure (Cold)</span>
                      <strong style={{ color: '#0F172A', fontWeight: 800 }}>32 PSI Front / 36 Rear</strong>
                      <span style={{ color: '#059669', display: 'block', fontSize: '0.65rem' }}>Weekly Audit Due</span>
                    </div>
                    <div>
                      <span style={{ color: '#64748B', display: 'block', fontWeight: 600 }}>Compliance & Reg</span>
                      <strong style={{ color: '#0F172A', fontWeight: 800 }}>RC Active • Insurance 2026</strong>
                      <span style={{ color: '#059669', display: 'block', fontSize: '0.65rem' }}>PUC Valid</span>
                    </div>
                  </div>

                  {!b.isPrimary && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <button
                        type="button"
                        className="make-primary-btn"
                        onClick={() => handleSetPrimary(b)}
                        style={{ textDecoration: 'none' }}
                      >
                        Set as Primary Motorcycle
                      </button>
                    </div>
                  )}
                </div>

                <div className="bike-garage-card__footer">
                  <button
                    type="button"
                    className="icon-action-btn"
                    onClick={() => handleOpenQrModal(b)}
                    title="Vehicle QR Tag"
                    style={{ textDecoration: 'none', color: '#4338CA', fontWeight: 800 }}
                  >
                    <QrCode size={16} /> Emergency QR Tag
                  </button>
                  <button
                    type="button"
                    className="icon-action-btn"
                    onClick={() => handleOpenEditModal(b)}
                    title="Edit bike"
                    style={{ textDecoration: 'none' }}
                  >
                    <Edit3 size={16} /> Edit Details
                  </button>
                  <button
                    type="button"
                    className="icon-action-btn icon-action-btn--danger"
                    onClick={() => handleDeleteBike(b.id)}
                    title="Delete bike"
                    style={{ textDecoration: 'none' }}
                  >
                    <Trash2 size={16} /> Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={BikeIcon}
          title="No motorcycles yet."
          description="Add your first motorcycle to make roadside assistance faster."
          actionLabel="Add Motorcycle"
          onAction={handleOpenAddModal}
        />
      )}

      {/* Add / Edit Bike Modal */}
      {showModal && (
        <div className="custom-bike-modal">
          <div className="custom-bike-modal__content">
            <div className="modal-header">
              <h3>{editingBike ? 'Edit Motorcycle' : 'Add Motorcycle to Garage'}</h3>
              <button type="button" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitBike} className="modal-form">
              <div className="form-group">
                <label htmlFor="bikeBrandInput">Brand / Make *</label>
                <input
                  id="bikeBrandInput"
                  required
                  type="text"
                  autoCapitalize="words"
                  autoCorrect="off"
                  enterKeyHint="next"
                  placeholder="e.g. Royal Enfield, Honda, Triumph, KTM"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="bikeModelInput">Model *</label>
                <input
                  id="bikeModelInput"
                  required
                  type="text"
                  autoCapitalize="words"
                  autoCorrect="off"
                  enterKeyHint="next"
                  placeholder="e.g. Himalayan 450, XL750 Transalp, Tiger 900"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="bikeCategoryInput">Motorcycle Category / Type</label>
                <input
                  id="bikeCategoryInput"
                  type="text"
                  autoCapitalize="words"
                  placeholder="e.g. Adventure Tourer, Dual-Sport, Streetfighter, Cruiser"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="bikeRegInput">Reg. Number *</label>
                  <input
                    id="bikeRegInput"
                    required
                    type="text"
                    autoCapitalize="characters"
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint="next"
                    placeholder="WB74AB1234"
                    value={reg}
                    onChange={(e) => setReg(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="bikeYearInput">Model Year</label>
                  <input
                    id="bikeYearInput"
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    enterKeyHint="done"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="bikeFuelSelect">Fuel Type</label>
                <select
                  id="bikeFuelSelect"
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value as FuelType)}
                  className="select-input"
                >
                  <option value="PETROL">Petrol</option>
                  <option value="ELECTRIC">Electric (EV)</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: '1rem 0' }}>
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                  />
                  <span>Set as primary motorcycle</span>
                </label>
              </div>

              <div className="form-group">
                <label htmlFor="bikeNotesInput">Notes / Modifications (Optional)</label>
                <input
                  id="bikeNotesInput"
                  type="text"
                  placeholder="e.g. Panniers, crash guards, tubeless conversion"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Check size={18} /> Save Motorcycle
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MOTOASSIST VEHICLE QR TAG MODAL */}
      {activeQrModalBike && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#1D1D1D] border border-white/15 rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-6 shadow-2xl relative text-white">
            
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <QrCode size={26} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-[#FFF174] tracking-widest block">VEHICLE EMERGENCY QR TAG</span>
                  <h3 className="text-xl font-black text-white">{activeQrModalBike.brand} {activeQrModalBike.model}</h3>
                  <span className="text-xs text-gray-400 font-mono">{activeQrModalBike.registrationNumber}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveQrModalBike(null);
                  setActiveQrTag(null);
                }}
                className="p-2 text-gray-400 hover:text-white rounded-xl bg-white/5 border border-white/10"
              >
                <X size={18} />
              </button>
            </div>

            {qrLoading ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-[#FFF174] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-gray-400">Generating secure emergency QR tag...</p>
              </div>
            ) : activeQrTag ? (
              <div className="space-y-4">
                
                {/* Visual QR Card Representation */}
                <div className="p-6 bg-gradient-to-br from-indigo-950/40 via-[#1D1D1D] to-black border border-indigo-500/30 rounded-2xl text-center space-y-3 shadow-inner">
                  <div className="w-40 h-40 bg-white p-2 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                    {/* SVG Stylized QR graphic representing the token */}
                    <div className="w-full h-full border-4 border-black p-2 flex flex-col justify-between items-center text-black">
                      <div className="w-full flex justify-between">
                        <div className="w-8 h-8 border-4 border-black bg-black" />
                        <div className="w-8 h-8 border-4 border-black bg-black" />
                      </div>
                      <div className="text-[9px] font-black tracking-tighter text-center uppercase">
                        MOTOASSIST RESCUE<br />
                        <span className="font-mono text-[7px] text-gray-600 truncate block max-w-[120px]">{activeQrTag.token}</span>
                      </div>
                      <div className="w-full flex justify-between">
                        <div className="w-8 h-8 border-4 border-black bg-black" />
                        <div className="w-5 h-5 bg-black" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-gray-300 block">
                      Protected Public Scanner URL:
                    </span>
                    <span className="text-xs font-mono text-[#FFF174] break-all block mt-0.5">
                      {window.location.origin}{window.location.pathname.replace(/\/?$/, '/')}#/qr/{activeQrTag.token}
                    </span>
                  </div>
                </div>

                {/* Privacy & Instructions Notice */}
                <div className="p-3.5 bg-white/5 border border-white/5 rounded-2xl space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <ShieldCheck size={14} />
                    <span>Zero Personal Contact Leakage</span>
                  </div>
                  <p className="text-gray-300 text-[11px] leading-relaxed">
                    Print or engrave this QR code on your motorcycle's front windshield, number plate, or key fob. Anyone scanning it can notify you of parking obstruction, lights left on, or an accident without seeing your phone number or home address.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const url = `${window.location.origin}${window.location.pathname.replace(/\/?$/, '/')}#/qr/${activeQrTag.token}`;
                      navigator.clipboard.writeText(url);
                      setQrCopied(true);
                      setTimeout(() => setQrCopied(false), 2500);
                    }}
                    className="w-full sm:flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {qrCopied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    <span>{qrCopied ? 'URL Copied to Clipboard!' : 'Copy QR Scanner URL'}</span>
                  </button>

                  <a
                    href={`#/qr/${activeQrTag.token}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:flex-1 py-3 rounded-xl bg-[#FFF174] text-black font-black text-xs flex items-center justify-center gap-1.5 hover:bg-yellow-400 transition-colors shadow-md text-center"
                    style={{ textDecoration: 'none' }}
                  >
                    <ExternalLink size={15} />
                    <span>Test Scanner Page</span>
                  </a>
                </div>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => handleRevokeQrTag(activeQrModalBike.id)}
                    className="text-[11px] text-red-400 hover:text-red-300 font-bold hover:underline"
                  >
                    Revoke & Regenerate New QR Token
                  </button>
                </div>

              </div>
            ) : null}

          </div>
        </div>
      )}
    </div>
  );
}
