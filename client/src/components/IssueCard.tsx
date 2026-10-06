import { Check } from 'lucide-react';
import type { IssueTypeDefinition } from '../data/issueTypes';
import { SpatialCard } from './SpatialCard';

interface IssueCardProps {
  issueDef: IssueTypeDefinition;
  isSelected: boolean;
  onSelect: (value: IssueTypeDefinition['value']) => void;
}

export function IssueCard({ issueDef, isSelected, onSelect }: IssueCardProps) {
  const Icon = issueDef.icon;

  return (
    <SpatialCard
      maxTilt={7}
      perspective={900}
      scale={isSelected ? 1.03 : 1.01}
      className={`issue-card-spatial ${isSelected ? 'issue-card-spatial--selected' : ''}`}
    >
      <button
        type="button"
        className={`premium-card issue-card ${isSelected ? 'is-selected' : ''}`}
        aria-pressed={isSelected}
        aria-label={`Issue: ${issueDef.label}. ${issueDef.description}`}
        onClick={() => onSelect(issueDef.value)}
        style={{
          width: '100%',
          height: '100%',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.75rem',
          gap: '1rem',
          borderRadius: '20px',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 250ms cubic-bezier(0.16, 1, 0.3, 1)',
          border: isSelected ? '2px solid var(--color-navy)' : '1px solid var(--color-border)',
          background: isSelected ? 'linear-gradient(180deg, #FFFFFF 0%, #FFFDF0 100%)' : '#FFFFFF',
          boxShadow: isSelected
            ? '0 16px 30px -10px rgba(255, 200, 0, 0.35), 0 0 0 3px rgba(255, 241, 116, 0.5)'
            : '0 8px 20px -4px rgba(15, 23, 42, 0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div
            className="issue-card__icon"
            style={{
              width: 52,
              height: 52,
              borderRadius: '14px',
              background: isSelected ? 'var(--color-navy)' : '#F1F5F9',
              color: isSelected ? 'var(--color-primary)' : 'var(--color-navy)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 250ms ease',
              boxShadow: isSelected ? '0 8px 16px rgba(16, 24, 39, 0.2)' : 'none',
            }}
          >
            <Icon size={26} strokeWidth={2.2} />
          </div>

          {/* Explicit Selection Indicator for Novices */}
          {isSelected ? (
            <div
              className="issue-selection-indicator"
              style={{
                background: 'var(--color-navy)',
                color: 'var(--color-primary)',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              <Check size={18} strokeWidth={3} />
            </div>
          ) : (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#64748B',
                background: '#F8FAFC',
                padding: '0.25rem 0.6rem',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
              }}
            >
              TAP TO SELECT
            </span>
          )}
        </div>

        <div className="issue-card__content" style={{ marginTop: '0.5rem' }}>
          <strong
            className="issue-card__title"
            style={{
              fontSize: '1.2rem',
              color: 'var(--color-navy)',
              display: 'block',
              marginBottom: '0.4rem',
              fontWeight: 800,
            }}
          >
            {issueDef.label}
          </strong>
          <p
            className="issue-card__description"
            style={{
              fontSize: '0.9rem',
              color: '#49627F',
              margin: 0,
              lineHeight: 1.5,
              fontWeight: 500,
            }}
          >
            {issueDef.description}
          </p>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '0.75rem' }}>
          <div
            style={{
              width: '100%',
              padding: '0.6rem',
              textAlign: 'center',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              background: isSelected ? 'var(--color-primary)' : 'transparent',
              color: isSelected ? 'var(--color-navy)' : '#64748B',
              border: isSelected ? '1px solid var(--color-navy)' : '1px dashed #CBD5E1',
            }}
          >
            {isSelected ? '✓ PROBLEM CHOSEN' : 'CHOOSE THIS ISSUE'}
          </div>
        </div>
      </button>
    </SpatialCard>
  );
}
