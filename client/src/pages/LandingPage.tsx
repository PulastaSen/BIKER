import { useNavigate } from 'react-router-dom';
import { SectionHeading } from '../components/SectionHeading';
import { Button } from '../components/Button';
import { VideoCard } from '../components/VideoCard';
import { MapSection } from '../components/MapSection';
import { SpatialCard } from '../components/SpatialCard';
import { InteractiveRadarHUD } from '../components/InteractiveRadarHUD';
import { Shield, Zap, Clock, ArrowRight, CheckCircle2, ShieldAlert, Wrench, Map as MapIcon, Truck, Heart, Users, Sparkles, Navigation } from 'lucide-react';

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
                <button
                  type="button"
                  onClick={() => navigate('/im-stranded')}
                  className="px-6 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-orange-500 active:scale-95 text-white font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_35px_rgba(220,38,38,0.5)] transition-all cursor-pointer border border-red-500/50"
                >
                  <Zap size={20} />
                  <span>I'M STRANDED</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/safe-ride')}
                  className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 border border-white/20 transition-all cursor-pointer"
                >
                  <Navigation size={18} />
                  <span>START SAFE RIDE</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/sos')}
                  className="px-5 py-4 rounded-2xl bg-red-950/60 hover:bg-red-900/60 border border-red-500/40 text-red-300 font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ShieldAlert size={18} />
                  <span>EMERGENCY SOS</span>
                </button>
              </div>

              {/* Ecosystem 3-Pillar Quick Hub: Nearby Assistance, Safety Center, Bike & Road Intelligence */}
              <div className="my-6 space-y-4 w-full">
                {/* 1. Nearby Assistance Grid */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">
                      Nearby Assistance
                    </span>
                    <span className="text-[10px] text-gray-400">Siliguri & Himalayan Corridors</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => navigate('/nearby-services')}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-2 text-left transition-all"
                    >
                      <Wrench size={16} className="text-amber-400 shrink-0" />
                      <div>
                        <strong className="block text-xs text-white">Mechanics</strong>
                        <span className="text-[10px] text-gray-400">Verified repair</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/save-my-bike')}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-2 text-left transition-all"
                    >
                      <Truck size={16} className="text-blue-400 shrink-0" />
                      <div>
                        <strong className="block text-xs text-white">Towing</strong>
                        <span className="text-[10px] text-gray-400">Flatbed recovery</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/emergency-services')}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-2 text-left transition-all"
                    >
                      <Heart size={16} className="text-red-400 shrink-0" />
                      <div>
                        <strong className="block text-xs text-white">Ambulance</strong>
                        <span className="text-[10px] text-gray-400">Emergency 108</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/emergency-services')}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-2 text-left transition-all"
                    >
                      <Shield size={16} className="text-emerald-400 shrink-0" />
                      <div>
                        <strong className="block text-xs text-white">Hospitals</strong>
                        <span className="text-[10px] text-gray-400">Verified trauma</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. Safety Center Grid */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-red-400">
                      Safety Center
                    </span>
                    <span className="text-[10px] text-gray-400">Proactive Protection</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => navigate('/sos')}
                      className="p-2.5 rounded-xl bg-red-950/30 hover:bg-red-900/30 border border-red-500/20 flex items-center gap-2 text-left transition-all"
                    >
                      <ShieldAlert size={16} className="text-red-400 shrink-0" />
                      <div>
                        <strong className="block text-xs text-white">🚨 SOS</strong>
                        <span className="text-[10px] text-gray-400">3-sec hold trigger</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/safety-circle')}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-2 text-left transition-all"
                    >
                      <Users size={16} className="text-blue-400 shrink-0" />
                      <div>
                        <strong className="block text-xs text-white">Family Circle</strong>
                        <span className="text-[10px] text-gray-400">Live ride sharing</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/medical-id')}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-2 text-left transition-all"
                    >
                      <Heart size={16} className="text-purple-400 shrink-0" />
                      <div>
                        <strong className="block text-xs text-white">Medical ID</strong>
                        <span className="text-[10px] text-gray-400">Blood group & Rx</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/women-safety')}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-2 text-left transition-all"
                    >
                      <Shield size={16} className="text-pink-400 shrink-0" />
                      <div>
                        <strong className="block text-xs text-white">Women Safety</strong>
                        <span className="text-[10px] text-gray-400">Stealth SOS & safe havens</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 3. My Bike & Intelligence */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                      My Bike & Intelligence
                    </span>
                    <span className="text-[10px] text-gray-400">Garage & Route Coverage</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => navigate('/pre-ride-check')}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-2 text-left transition-all"
                    >
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                      <div>
                        <strong className="block text-xs text-white">Pre-Ride Check</strong>
                        <span className="text-[10px] text-gray-400">11-point inspection</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/ai-bike-assistant')}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-2 text-left transition-all"
                    >
                      <Sparkles size={16} className="text-amber-400 shrink-0" />
                      <div>
                        <strong className="block text-xs text-white">AI Assistant</strong>
                        <span className="text-[10px] text-gray-400">Symptom diagnosis</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/spare-parts')}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-2 text-left transition-all"
                    >
                      <Wrench size={16} className="text-blue-400 shrink-0" />
                      <div>
                        <strong className="block text-xs text-white">Spare Parts</strong>
                        <span className="text-[10px] text-gray-400">Workshop inventory</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/route-coverage')}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-2 text-left transition-all"
                    >
                      <MapIcon size={16} className="text-purple-400 shrink-0" />
                      <div>
                        <strong className="block text-xs text-white">Route Coverage</strong>
                        <span className="text-[10px] text-gray-400">Himalayan support</span>
                      </div>
                    </button>
                  </div>
                </div>
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
                  <img src="/images/bikes/himalayan-450/himalayan-450-main.jpg" alt="Motorcycle rider beside a stopped motorcycle" className="step-card__img" />
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
                  <img src="/images/motoassist-hero.jpg" alt="Rider checking GPS" className="step-card__img" style={{ objectPosition: 'top' }} />
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
                  <img src="/images/mechanic-repair.jpg" alt="Mechanic helping rider" className="step-card__img" />
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
                  <img src="/images/roadside-support.jpg" alt="Rider continuing journey" className="step-card__img" />
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
