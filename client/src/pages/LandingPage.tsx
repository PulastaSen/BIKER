import { useNavigate } from 'react-router-dom';
import { SectionHeading } from '../components/SectionHeading';
import { Button } from '../components/Button';
import { VideoCard } from '../components/VideoCard';
import { MapSection } from '../components/MapSection';
import { SpatialCard } from '../components/SpatialCard';
import { InteractiveRadarHUD } from '../components/InteractiveRadarHUD';
import { Shield, Zap, Clock, ArrowRight, CheckCircle2, ShieldAlert, Wrench, Map as MapIcon } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div id="home" className="w-full">
      <main>
        {/* PREMIUM HERO SECTION WITH 3D ANTIGRAVITY RADAR HUD */}
        <section className="hero-premium">
          <div className="hero-premium__bg">
            <div className="hero-premium__overlay"></div>
          </div>
          <div className="shell hero-premium__content">
            <div className="hero-premium__text">
              <div 
                className="hero-emergency-badge cursor-pointer hover:bg-red-900/40 transition-colors" 
                role="status"
                onClick={() => navigate('/sos')}
                title="Tap for Emergency SOS"
              >
                <span className="hero-emergency-pulse" aria-hidden="true" />
                <span>🚨 24/7 ROADSIDE SOS • SILIGURI & HIMALAYAS</span>
              </div>
              <h1 id="hero-title">
                When the road doesn't go as planned,<br />
                <span className="hero-highlight-kinetic">MotoAssist gets you moving again.</span>
              </h1>
              <p className="hero__lead">
                Connect with verified mechanics, towing providers and rider helpers across Siliguri and Himalayan corridors. Fast, simple, and transparent roadside rescue.
              </p>
              
              {/* Main Actions with High Tactile Affordance across Mobile, Tablet, and Desktop */}
              <div className="hero__actions flex flex-wrap gap-3 items-center">
                <Button glow={true} className="button button--primary button--large" onClick={() => navigate('/request-help')}>
                  <Zap size={20} />
                  <span>REQUEST HELP NOW</span>
                </Button>
                <button
                  type="button"
                  onClick={() => navigate('/sos')}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 active:scale-95 text-white font-black text-sm tracking-widest uppercase flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(220,38,38,0.5)] transition-all cursor-pointer border border-red-500/50"
                >
                  <ShieldAlert size={18} />
                  <span>EMERGENCY SOS</span>
                </button>
                <Button variant="secondary" className="button button--ghost-white" onClick={() => navigate('/become-helper')}>
                  <span>BECOME A HELPER</span>
                </Button>
              </div>

              {/* Fast Triage Cards - Immediate Action on Mobile, Tab, and Desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6 w-full">
                <button
                  type="button"
                  onClick={() => navigate('/sos')}
                  className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 hover:border-red-500/70 hover:bg-red-900/40 flex items-center gap-3 text-left transition-all active:scale-[0.98] group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shrink-0 text-white shadow-lg group-hover:scale-105 transition-transform">
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <span className="block text-[10px] font-black text-red-400 uppercase tracking-widest">Immediate Danger</span>
                    <strong className="text-white text-sm font-black">Hold for SOS</strong>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/request-help')}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#FFF174]/40 hover:bg-white/10 flex items-center gap-3 text-left transition-all active:scale-[0.98] group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#FFF174]/20 flex items-center justify-center shrink-0 text-[#FFF174] group-hover:scale-105 transition-transform">
                    <Wrench size={20} />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Roadside Repair</span>
                    <strong className="text-white text-sm font-black">Request Help</strong>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/nearby-services')}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/40 hover:bg-white/10 flex items-center gap-3 text-left transition-all active:scale-[0.98] group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0 text-blue-400 group-hover:scale-105 transition-transform">
                    <MapIcon size={20} />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Workshops & OEM</span>
                    <strong className="text-white text-sm font-black">Nearby Services</strong>
                  </div>
                </button>
              </div>

              {/* Beginner Guidance Badges */}
              <div className="hero-trust-bar">
                <div className="hero-trust-item">
                  <Clock size={16} className="text-warning" />
                  <span>Avg Response: <strong>15–25 min</strong></span>
                </div>
                <div className="hero-trust-item">
                  <Shield size={16} className="text-success" />
                  <span><strong>100% Verified</strong> Mechanics</span>
                </div>
                <div className="hero-trust-item">
                  <CheckCircle2 size={16} className="text-primary-bright" />
                  <span><strong>No Signup</strong> Required</span>
                </div>
              </div>
            </div>

            {/* Interactive 3D Antigravity Radar Visual */}
            <div className="hero-premium__visual">
              <InteractiveRadarHUD />
            </div>
          </div>
        </section>

        {/* 4-STEP JOURNEY SECTION WITH 3D SPATIAL TILT CARDS */}
        <section className="section shell" id="how-it-works">
          <SectionHeading eyebrow="A SIMPLE PATH FROM PROBLEM TO SUPPORT" title="Four steps. One goal. Get you safely moving again." />
          
          <div className="four-steps-wrapper">
            <div className="four-steps-line"></div>
            <div className="four-steps-grid">
              
              <SpatialCard maxTilt={8} perspective={900} className="step-card-spatial">
                <div className="step-card premium-card">
                  <img src="/src/assets/images/bikes/ktm-390-adventure/ktm-390-adventure-main.jpg" alt="Motorcycle rider beside a stopped motorcycle" className="step-card__img" />
                  <div className="step-card__body">
                    <div className="step-card__number">01</div>
                    <h3>Create Request</h3>
                    <p>Select your motorcycle, describe the problem and request roadside assistance.</p>
                    <div className="step-card__tags">
                      <span>Choose bike</span>
                      <span>Select issue</span>
                    </div>
                  </div>
                </div>
              </SpatialCard>

              <SpatialCard maxTilt={8} perspective={900} className="step-card-spatial">
                <div className="step-card premium-card">
                  <img src="/src/assets/images/motoassist-hero.jpg" alt="Rider checking GPS" className="step-card__img" style={{ objectPosition: 'top' }} />
                  <div className="step-card__body">
                    <div className="step-card__number">02</div>
                    <h3>Share Location</h3>
                    <p>Share a nearby landmark or your precise location only when you choose to.</p>
                    <div className="step-card__tags">
                      <span>Secure GPS</span>
                      <span>Manual fallback</span>
                    </div>
                  </div>
                </div>
              </SpatialCard>

              <SpatialCard maxTilt={8} perspective={900} className="step-card-spatial">
                <div className="step-card premium-card">
                  <img src="/src/assets/images/mechanic-repair.jpg" alt="Mechanic helping rider" className="step-card__img" />
                  <div className="step-card__body">
                    <div className="step-card__number">03</div>
                    <h3>Connect Support</h3>
                    <p>Nearby verified mechanics, towing providers, and helpers offer assistance.</p>
                    <div className="step-card__tags">
                      <span>Verified helpers</span>
                      <span>Direct chat</span>
                    </div>
                  </div>
                </div>
              </SpatialCard>

              <SpatialCard maxTilt={8} perspective={900} className="step-card-spatial">
                <div className="step-card premium-card">
                  <img src="/src/assets/images/roadside-support.jpg" alt="Rider continuing journey" className="step-card__img" />
                  <div className="step-card__body">
                    <div className="step-card__number">04</div>
                    <h3>Get Help & Resolve</h3>
                    <p>Coordinate safely, track the status, and get your ride moving again.</p>
                    <div className="step-card__tags">
                      <span>Live status</span>
                      <span>Issue resolved</span>
                    </div>
                  </div>
                </div>
              </SpatialCard>

            </div>

            {/* Beginner Quick Guide CTA */}
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <Button glow={true} className="button button--primary button--large" onClick={() => navigate('/request-help')}>
                <span>START 4-STEP HELP REQUEST</span>
                <ArrowRight size={20} />
              </Button>
              <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--color-muted)' }}>
                Takes less than 60 seconds • Direct connection to local assistance
              </p>
            </div>
          </div>
        </section>

        {/* MAP SECTION */}
        <section className="section section--tint">
          <div className="shell">
            <div className="map-split-layout">
              <div className="map-split-content">
                <SectionHeading eyebrow="PILOT GEOGRAPHY" title="Supported Himalayan Routes" />
                <p>Currently covering Siliguri, Sevoke, Kalimpong, Darjeeling, and Gangtok. Our network of mechanics and riders is ready to assist on the toughest mountain passes.</p>
                <div className="route-stats">
                  <div className="stat-item">
                    <strong>24/7</strong>
                    <span>Platform Uptime</span>
                  </div>
                  <div className="stat-item">
                    <strong>5+</strong>
                    <span>Major Routes</span>
                  </div>
                </div>
                <Button onClick={() => navigate('/how-it-works')}>Learn How We Coordinate Help</Button>
              </div>
              <div className="map-split-visual">
                <MapSection 
                  markers={[
                    { id: '1', position: [26.7271, 88.3953], title: 'Siliguri (Hub)', type: 'mechanic' },
                    { id: '2', position: [26.8833, 88.4500], title: 'Sevoke Road', type: 'helper' },
                    { id: '3', position: [27.0594, 88.4695], title: 'Kalimpong', type: 'mechanic' },
                    { id: '4', position: [27.0410, 88.2663], title: 'Darjeeling', type: 'helper' },
                    { id: '5', position: [27.3314, 88.6138], title: 'Gangtok', type: 'mechanic' }
                  ]}
                  center={[27.0, 88.4]}
                  zoom={9}
                  interactive={false}
                  height="450px"
                />
              </div>
            </div>
          </div>
        </section>

        {/* VIDEO SECTION */}
        <section className="section shell">
          <VideoCard />
        </section>

        {/* VISUAL STORY SECTION */}
        <section className="visual-story-section">
          <div className="visual-story__bg"></div>
          <div className="shell visual-story__content">
            <h2 className="visual-story__title">WHEN THE ROAD GETS TOUGH</h2>
            <div className="visual-story__text">
              <p>Breakdown. Flat tyre. Dead battery. Fuel problem.</p>
              <p><strong>Whatever happens, you're not completely on your own.</strong></p>
            </div>
            <Button className="button button--primary button--large mt-6" onClick={() => navigate('/request-help')}>
              REQUEST HELP NOW
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
