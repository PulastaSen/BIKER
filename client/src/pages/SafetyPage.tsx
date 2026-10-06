import { ShieldAlert, PhoneCall, CheckCircle2, Lock, AlertTriangle } from 'lucide-react';
import { SafetyNotice } from '../components/SafetyNotice';

export function SafetyPage() {
  return (
    <div className="safety-page">
      <section className="hero-premium">
        <div className="hero-premium__bg" style={{ backgroundImage: "url('/src/assets/images/motoassist-hero.jpg')" }}>
          <div className="hero-premium__overlay"></div>
        </div>
        <div className="shell hero-premium__content" style={{ justifyContent: 'center', textAlign: 'center' }}>
          <div className="hero-premium__text" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <p className="eyebrow eyebrow--yellow">YOUR SAFETY IS OUR HIGHEST PRIORITY</p>
            <h1>Safety Guidance & Disclaimer</h1>
            <p className="hero__lead mx-auto">
              MotoAssist is a roadside assistance coordination platform. We empower riders and local helpers to connect safely along Himalayan routes.
            </p>
          </div>
        </div>
      </section>

      <div className="shell safety-content">
        <div style={{ marginBottom: '2.5rem' }}>
          <SafetyNotice accident />
        </div>

      <div className="safety-grid">
        <div className="safety-card">
          <div className="feature-icon" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
            <PhoneCall size={24} />
          </div>
          <h3>1. Emergency Services First</h3>
          <p>
            If you are involved in a crash, sustain injuries, or face immediate physical danger or severe weather hazard, call local official emergency services before requesting MotoAssist assistance.
          </p>
          <div className="hotline-box">
            <strong>Emergency Hotlines in India:</strong>
            <ul>
              <li>National Emergency Number: <strong>112</strong></li>
              <li>Police: <strong>100</strong></li>
              <li>Ambulance: <strong>102 / 108</strong></li>
            </ul>
          </div>
        </div>

        <div className="safety-card">
          <div className="feature-icon">
            <Lock size={24} />
          </div>
          <h3>2. Consent-Based Location Privacy</h3>
          <p>
            Your exact GPS coordinates are never broadcast publicly or sold to third parties. Exact coordinates are shared strictly when you grant consent during a help request.
          </p>
          <ul>
            <li><CheckCircle2 size={16} /> Location sharing is off by default</li>
            <li><CheckCircle2 size={16} /> Approximate landmark descriptions supported</li>
            <li><CheckCircle2 size={16} /> Revoke permission anytime</li>
          </ul>
        </div>

        <div className="safety-card">
          <div className="feature-icon">
            <ShieldAlert size={24} />
          </div>
          <h3>3. Helper Verification & Identity</h3>
          <p>
            MotoAssist reviews mechanic and towing provider profiles before granting verified status. Always verify helper badges and cross-check business credentials upon arrival.
          </p>
          <ul>
            <li><CheckCircle2 size={16} /> Look for green Verified badges</li>
            <li><CheckCircle2 size={16} /> Confirm helper name & business title</li>
            <li><CheckCircle2 size={16} /> Never share passwords or OTPs</li>
          </ul>
        </div>

        <div className="safety-card">
          <div className="feature-icon">
            <AlertTriangle size={24} />
          </div>
          <h3>4. Himalayan Terrain Preparedness</h3>
          <p>
            Riding in high-altitude terrain requires preparation. Weather and road conditions near Sevoke, Kalimpong, and Sikkim change quickly.
          </p>
          <ul>
            <li><CheckCircle2 size={16} /> Carry basic puncture kit & tyre inflator</li>
            <li><CheckCircle2 size={16} /> Inform emergency contacts of planned route</li>
            <li><CheckCircle2 size={16} /> Carry warm layer & basic first-aid</li>
          </ul>
        </div>
      </div>
      </div>
    </div>
  );
}
