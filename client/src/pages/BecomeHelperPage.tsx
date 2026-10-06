import { Link } from 'react-router-dom';
import { Wrench, ShieldCheck, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';

export function BecomeHelperPage() {
  return (
    <div className="become-helper-page">
      <section className="hero-premium">
        <div className="hero-premium__bg" style={{ backgroundImage: "url('/src/assets/images/mechanic-repair.jpg')" }}>
          <div className="hero-premium__overlay"></div>
        </div>
        <div className="shell hero-premium__content">
          <div className="hero-premium__text">
            <p className="eyebrow eyebrow--yellow">JOIN OUR ASSISTANCE NETWORK</p>
            <h1>Become a Verified MotoAssist Helper</h1>
            <p className="hero__lead">
              Are you a local mechanic, towing operator, or experienced Himalayan rider? Join MotoAssist to offer roadside assistance to stranded motorcyclists.
            </p>
            <div className="hero__actions">
              <Link to="/register" className="button button--primary button--large">
                Register as a Helper <ArrowRight size={18} />
              </Link>
            </div>
          </div>
          <div className="hero-premium__visual">
             <div className="hero-floating-card">
              <h3>HELPER BENEFITS</h3>
              <ul className="floating-checklist">
                <li><CheckCircle2 size={18} className="text-success" /> Grow your business</li>
                <li><CheckCircle2 size={18} className="text-success" /> Build community trust</li>
                <li><CheckCircle2 size={18} className="text-success" /> Direct rider requests</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className="section-header text-center" style={{ marginBottom: '4rem' }}>
          <h2>Why join the network?</h2>
          <p className="text-muted">A dedicated platform connecting you with riders who need your exact skills.</p>
        </div>
        
        <div className="four-steps-grid">
          <div className="step-card premium-card">
            <div className="step-card__body" style={{ alignItems: 'center', textAlign: 'center' }}>
              <div className="step-card__number" style={{ background: 'var(--color-surface-secondary)' }}><MapPin size={24} /></div>
              <h3>Local Community Support</h3>
              <p>Help riders stranded on key mountain corridors like Sevoke, Kalimpong, Teesta, and Gangtok.</p>
            </div>
          </div>

          <div className="step-card premium-card">
            <div className="step-card__body" style={{ alignItems: 'center', textAlign: 'center' }}>
              <div className="step-card__number" style={{ background: 'var(--color-surface-secondary)' }}><ShieldCheck size={24} /></div>
              <h3>Verified Helper Profile</h3>
              <p>Build trust with a verified badge, display your workshop skills, and showcase rider ratings.</p>
            </div>
          </div>

          <div className="step-card premium-card">
            <div className="step-card__body" style={{ alignItems: 'center', textAlign: 'center' }}>
              <div className="step-card__number" style={{ background: 'var(--color-surface-secondary)' }}><Wrench size={24} /></div>
              <h3>Flexible Availability</h3>
              <p>Toggle your status between Available and Unavailable anytime based on your schedule.</p>
            </div>
          </div>

          <div className="step-card premium-card">
            <div className="step-card__body" style={{ alignItems: 'center', textAlign: 'center' }}>
              <div className="step-card__number" style={{ background: 'var(--color-surface-secondary)' }}><CheckCircle2 size={24} /></div>
              <h3>Direct Coordination</h3>
              <p>Receive live notifications of open help requests in your designated service area.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
