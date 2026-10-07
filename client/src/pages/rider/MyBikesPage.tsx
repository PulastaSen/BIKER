import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getBikes, saveBike, deleteBike as removeBikeFromStorage } from '../../utils/appStorage';
import type { Bike, FuelType } from '../../types/app';
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
} from 'lucide-react';

export function MyBikesPage() {
  const { user } = useAuth();
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBike, setEditingBike] = useState<Bike | undefined>();
  const [expandedBikeIds, setExpandedBikeIds] = useState<Record<string, boolean>>({});

  // Form State
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('');
  const [reg, setReg] = useState('');
  const [year, setYear] = useState('2025');
  const [fuelType, setFuelType] = useState<FuelType>('PETROL');
  const [isPrimary, setIsPrimary] = useState(false);
  const [notes, setNotes] = useState('');

  const loadBikes = () => {
    if (user) {
      setBikes(getBikes(user.id));
    }
  };

  useEffect(() => {
    loadBikes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
      return '/images/bikes/himalayan-450/himalayan-450-main.jpg';
    }
    if (bModel.includes('transalp') || (bBrand.includes('honda') && bModel.includes('750'))) {
      return '/images/bikes/transalp-750/transalp-750-main.jpg';
    }
    if (bModel.includes('tiger') || bBrand.includes('triumph')) {
      return '/images/bikes/tiger-900/tiger-900-main.jpg';
    }
    if (bModel.includes('390 adventure') || bModel.includes('ktm') || bBrand.includes('ktm')) {
      return '/images/bikes/ktm-390-adventure/ktm-390-adventure-main.jpg';
    }
    if (bModel.includes('pulsar') || bModel.includes('n160') || bBrand.includes('bajaj')) {
      return '/images/bikes/pulsar-n160/pulsar-n160-main.jpg';
    }
    return '/images/motoassist-hero.jpg';
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
                  
                  {!b.isPrimary && (
                    <div style={{ marginTop: '1rem' }}>
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
    </div>
  );
}
