import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getBikes, saveBike, deleteBike as removeBikeFromStorage } from '../../utils/appStorage';
import type { Bike, FuelType } from '../../types/app';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { Bike as BikeIcon, Plus, Trash2, Edit3, Star, Check, X } from 'lucide-react';

export function MyBikesPage() {
  const { user } = useAuth();
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBike, setEditingBike] = useState<Bike | undefined>();

  // Form State
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
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

  const handleOpenAddModal = () => {
    setEditingBike(undefined);
    setBrand('');
    setModel('');
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
    const brand = (bike.brand || '').trim();
    const model = (bike.model || '').trim();
    if (!brand && !model) return 'Motorcycle';
    if (!brand) return model;
    if (!model) return brand;
    if (model.toLowerCase().includes(brand.toLowerCase())) {
      return model;
    }
    return `${brand} ${model}`;
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
          <p className="subtitle">Keep your motorcycles ready for faster roadside assistance.</p>
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
          {bikes.map((b) => (
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
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
                  <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
                    Year {b.year}
                  </span>
                </div>

                <h3
                  className="bike-card-title"
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: '#0F172A',
                    lineHeight: 1.25,
                    marginTop: '0.2rem',
                    marginBottom: '0.65rem',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {getBikeDisplayName(b)}
                </h3>

                <p className="reg-text" style={{ marginBottom: '0.75rem' }}>
                  <strong>{b.registrationNumber}</strong>
                </p>

                <div className="meta-pills" style={{ marginBottom: '0.75rem' }}>
                  <span>{b.fuelType}</span>
                  <span>{b.isPrimary ? 'Primary Ride' : 'Active Bike'}</span>
                </div>

                {b.notes && <p className="notes-text" style={{ color: '#475569', fontSize: '0.85rem' }}>{b.notes}</p>}
                
                {!b.isPrimary && (
                  <div style={{ marginTop: '1rem' }}>
                    <button
                      type="button"
                      className="make-primary-btn"
                      onClick={() => handleSetPrimary(b)}
                    >
                      Set as Primary
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
                >
                  <Edit3 size={16} /> Edit
                </button>
                <button
                  type="button"
                  className="icon-action-btn icon-action-btn--danger"
                  onClick={() => handleDeleteBike(b.id)}
                  title="Delete bike"
                >
                  <Trash2 size={16} /> Remove
                </button>
              </div>
            </div>
          ))}
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
