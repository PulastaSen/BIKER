import { Check, Sparkles } from 'lucide-react';
import type { Bike } from '../types/request';
import { SpatialCard } from './SpatialCard';

interface BikeCardProps {
  bike: Bike;
  isSelected: boolean;
  onSelect: (bike: Bike) => void;
}

export function BikeCard({ bike, isSelected, onSelect }: BikeCardProps) {
  // Mapping for images
  const getBikeImage = (model: string) => {
    const lModel = model.toLowerCase();
    if (lModel.includes('himalayan') || lModel.includes('royal enfield')) {
      return '/images/bikes/himalayan-450/himalayan-450-main.jpg';
    }
    if (lModel.includes('transalp') || lModel.includes('750')) {
      return '/images/bikes/transalp-750/transalp-750-main.jpg';
    }
    if (lModel.includes('tiger') || lModel.includes('triumph') || lModel.includes('900')) {
      return '/images/bikes/tiger-900/tiger-900-main.jpg';
    }
    if (lModel.includes('ktm') || lModel.includes('390')) {
      return '/images/bikes/ktm-390-adventure/ktm-390-adventure-main.jpg';
    }
    if (lModel.includes('pulsar') || lModel.includes('n160')) {
      return '/images/bikes/pulsar-n160/pulsar-n160-main.jpg';
    }
    return '/images/motoassist-hero.jpg';
  };

  return (
    <SpatialCard
      maxTilt={6}
      perspective={1000}
      scale={isSelected ? 1.03 : 1.01}
      className={`bike-card-spatial ${isSelected ? 'bike-card-spatial--selected' : ''}`}
    >
      <button
        type="button"
        className={`premium-card bike-card ${isSelected ? 'is-selected' : ''}`}
        aria-pressed={isSelected}
        aria-label={`Select ${bike.brand} ${bike.model}, Registration ${bike.registrationNumber}`}
        onClick={() => onSelect(bike)}
        style={{
          width: '100%',
          height: '100%',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          borderRadius: '20px',
          overflow: 'hidden',
          transition: 'all 250ms cubic-bezier(0.16, 1, 0.3, 1)',
          border: isSelected ? '2px solid var(--color-navy)' : '1px solid var(--color-border)',
          background: isSelected ? 'linear-gradient(180deg, #FFFFFF 0%, #FFFDF0 100%)' : '#FFFFFF',
          boxShadow: isSelected
            ? '0 20px 35px -10px rgba(255, 200, 0, 0.35), 0 0 0 3px rgba(255, 241, 116, 0.6)'
            : '0 10px 25px -5px rgba(15, 23, 42, 0.08)',
        }}
      >
        <div style={{ position: 'relative', width: '100%', height: '210px', overflow: 'hidden' }}>
          <img
            src={getBikeImage(bike.model)}
            alt={`${bike.brand} ${bike.model}`}
            className="bike-card__img"
            style={{
              height: '100%',
              width: '100%',
              objectFit: 'cover',
              transition: 'transform 400ms ease',
            }}
            loading="lazy"
          />

          {/* Active Glowing Border Overlay when selected */}
          {isSelected && (
            <div
              className="bike-card-selected-glow"
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                border: '3px solid var(--color-primary)',
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Visual Checkmark Badge */}
          {isSelected ? (
            <div
              className="selection-indicator selection-indicator--active"
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                background: 'var(--color-navy)',
                color: 'var(--color-primary)',
                borderRadius: '50%',
                width: 38,
                height: 38,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.25)',
                animation: 'bounceIn 300ms ease',
              }}
            >
              <Check size={22} strokeWidth={3} />
            </div>
          ) : (
            <div
              className="selection-indicator selection-indicator--idle"
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(6px)',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(0,0,0,0.1)',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-navy)' }}>TAP</span>
            </div>
          )}

          {/* Year & Fuel Pill */}
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              background: 'rgba(16, 24, 39, 0.8)',
              backdropFilter: 'blur(8px)',
              padding: '0.3rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '0.04em',
            }}
          >
            {bike.year} • PETROL
          </div>
        </div>

        <div
          className="bike-card__body"
          style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            flex: 1,
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#64748B',
                display: 'block',
                marginBottom: '0.2rem',
              }}
            >
              {bike.brand}
            </span>
            <strong
              className="bike-card__title"
              style={{
                fontSize: '1.35rem',
                color: 'var(--color-navy)',
                display: 'block',
                lineHeight: 1.25,
                fontWeight: 800,
              }}
            >
              {bike.model.toLowerCase().includes((bike.brand || '').toLowerCase())
                ? bike.model
                : `${bike.brand} ${bike.model}`}
            </strong>

            <div style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  padding: '0.3rem 0.65rem',
                  background: 'var(--color-surface-secondary)',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  color: 'var(--color-navy)',
                  letterSpacing: '0.05em',
                  fontFamily: 'monospace',
                }}
              >
                {bike.registrationNumber}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#49627F', fontWeight: 600 }}>Active in Garage</span>
            </div>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '1.25rem' }}>
            <div
              style={{
                width: '100%',
                padding: '0.85rem',
                textAlign: 'center',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.95rem',
                letterSpacing: '0.04em',
                transition: 'all 200ms ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                background: isSelected ? 'var(--color-primary)' : '#F1F5F9',
                color: isSelected ? 'var(--color-navy)' : '#334155',
                border: isSelected ? '1px solid var(--color-navy)' : '1px solid #E2E8F0',
              }}
            >
              {isSelected ? (
                <>
                  <Check size={18} strokeWidth={3} />
                  <span>BIKE SELECTED</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>CLICK TO CHOOSE</span>
                </>
              )}
            </div>
          </div>
        </div>
      </button>
    </SpatialCard>
  );
}
