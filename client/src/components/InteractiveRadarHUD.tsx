import { useState, useEffect } from 'react';
import { ShieldCheck, Radio, MapPin, Zap, CheckCircle2 } from 'lucide-react';
import { SpatialCard } from './SpatialCard';

interface HelperNode {
  id: string;
  name: string;
  role: string;
  location: string;
  distance: string;
  status: 'active' | 'responding';
  coords: { x: number; y: number };
}

const ACTIVE_CORRIDOR_HELPERS: HelperNode[] = [
  { id: '1', name: 'Tashi Mechanic', role: 'Royal Enfield & Adv Spec', location: 'Sevoke Road', distance: '1.8 km away', status: 'active', coords: { x: 38, y: 35 } },
  { id: '2', name: 'Bikers Towing Hub', role: 'Flatbed & Winch', location: 'Siliguri Junction', distance: '3.2 km away', status: 'active', coords: { x: 65, y: 55 } },
  { id: '3', name: 'Rohan (Rider Helper)', role: 'Puncture & Fuel Relay', location: 'Sukna Pass', distance: '5.4 km away', status: 'active', coords: { x: 28, y: 72 } },
];

export function InteractiveRadarHUD() {
  const [activeNode, setActiveNode] = useState<HelperNode>(ACTIVE_CORRIDOR_HELPERS[0]);
  const [isPinging, setIsPinging] = useState(false);
  const [pingCount, setPingCount] = useState(2);

  // Periodic simulated telemetry pulse
  useEffect(() => {
    const timer = setInterval(() => {
      setPingCount((prev) => (prev % 2 === 0 ? 3 : 2));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const triggerTestSignal = () => {
    setIsPinging(true);
    setTimeout(() => setIsPinging(false), 2400);
  };

  return (
    <SpatialCard
      className="hero-radar-hud"
      maxTilt={10}
      perspective={1200}
      glare={true}
      style={{ width: '100%', maxWidth: '420px', margin: '0 auto' }}
    >
      <div className="radar-hud-card">
        {/* Top Status Header */}
        <div className="radar-hud-card__header">
          <div className="radar-status-badge">
            <span className="radar-status-dot" aria-hidden="true" />
            <span className="radar-status-text">LIVE DISPATCH RADAR</span>
          </div>
          <div className="radar-telemetry-tag">
            <Radio size={14} className="radar-telemetry-icon" />
            <span>Himalayan Corridor</span>
          </div>
        </div>

        {/* Visual Radar Screen */}
        <div className="radar-screen" onClick={triggerTestSignal} role="region" aria-label="Interactive roadside helper radar">
          {/* Concentric Radar Rings */}
          <div className="radar-ring radar-ring--1" />
          <div className="radar-ring radar-ring--2" />
          <div className="radar-ring radar-ring--3" />
          <div className="radar-crosshair-h" />
          <div className="radar-crosshair-v" />

          {/* Sweeper Beam */}
          <div className={`radar-sweeper ${isPinging ? 'radar-sweeper--fast' : ''}`} />

          {/* Center Point (User Bike) */}
          <div className="radar-center-marker" title="Your Location">
            <div className="radar-center-pulse" />
            <div className="radar-center-dot" />
            <span className="radar-center-label">YOU</span>
          </div>

          {/* Helper Nodes on Radar */}
          {ACTIVE_CORRIDOR_HELPERS.map((helper) => {
            const isSelected = activeNode.id === helper.id;
            return (
              <button
                key={helper.id}
                type="button"
                className={`radar-node ${isSelected ? 'radar-node--selected' : ''}`}
                style={{ left: `${helper.coords.x}%`, top: `${helper.coords.y}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveNode(helper);
                }}
                aria-label={`Helper: ${helper.name} at ${helper.location}`}
              >
                <div className="radar-node__beacon" />
                <div className="radar-node__core" />
              </button>
            );
          })}

          {/* Live Signal Wave when pinged */}
          {isPinging && <div className="radar-signal-shockwave" />}

          {/* Hint for First-Time Users */}
          <div className="radar-interactivity-hint">
            <Zap size={12} />
            <span>Tap to test dispatch ping</span>
          </div>
        </div>

        {/* Selected Helper Info Box (High Clarity & Affordance) */}
        <div className="radar-helper-detail">
          <div className="radar-helper-detail__top">
            <div className="radar-helper-icon">
              <ShieldCheck size={20} />
            </div>
            <div className="radar-helper-info">
              <strong className="radar-helper-name">{activeNode.name}</strong>
              <span className="radar-helper-role">{activeNode.role}</span>
            </div>
            <span className="radar-helper-distance">{activeNode.distance}</span>
          </div>

          <div className="radar-helper-meta">
            <div className="radar-meta-item">
              <MapPin size={14} />
              <span>{activeNode.location}</span>
            </div>
            <div className="radar-meta-item radar-meta-item--verified">
              <CheckCircle2 size={14} />
              <span>{pingCount} Helpers Ready</span>
            </div>
          </div>
        </div>

        {/* Bottom Safety Guarantee Bar */}
        <div className="radar-hud-footer">
          <span className="radar-footer-pill">⚡ AVERAGE ARRIVAL: 15-25 MIN</span>
          <span className="radar-footer-note">Free direct rider assistance</span>
        </div>
      </div>
    </SpatialCard>
  );
}
