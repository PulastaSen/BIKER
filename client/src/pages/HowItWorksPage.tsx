import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { SectionHeading } from '../components/SectionHeading';
import {
  MapPin,
  CheckCircle2,
  ArrowRight,
  Shield,
  ShieldCheck,
  PhoneCall,
  Sparkles,
  ChevronRight,
  Clock,
  UserCheck,
} from 'lucide-react';

export function HowItWorksPage() {
  const navigate = useNavigate();

  return (
    <div className="how-it-works-redesign">
      {/* 1. HERO SECTION */}
      <section className="hiw-hero-premium">
        <div className="shell hiw-hero-premium__content">
          <div className="hiw-hero-premium__text">
            <p className="eyebrow eyebrow--yellow">RIDERHUB ROAD ASSISTANCE</p>
            <h1>How MotoAssist<br />Coordinates Help</h1>
            <p className="hiw-hero-premium__lead">
              When a ride in the Eastern Himalayas doesn't go as planned, MotoAssist helps connect you with verified mechanics, towing providers, and rider helpers.
            </p>
            <div className="hero__actions mt-6">
              <Button onClick={() => navigate('/request-help')}>
                REQUEST HELP NOW <ArrowRight size={18} />
              </Button>
              <Button variant="secondary" onClick={() => navigate('/become-helper')}>
                BECOME A HELPER
              </Button>
            </div>
            
            <div className="hero-stats-row">
              <div className="hero-stat">
                <div className="hero-stat__icon"><MapPin size={20} /></div>
                <div className="hero-stat__text">
                  <strong>5+</strong>
                  <span>Supported Routes</span>
                </div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat__icon"><UserCheck size={20} /></div>
                <div className="hero-stat__text">
                  <strong>2</strong>
                  <span>Active Helpers Online</span>
                </div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat__icon"><Clock size={20} /></div>
                <div className="hero-stat__text">
                  <strong>24/7</strong>
                  <span>Request Submission</span>
                </div>
              </div>
            </div>
          </div>

          <div className="hiw-hero-premium__visual">
            <div className="hero-visual">
              <img src="/images/motorcycle-breakdown.jpg" alt="Motorcycle stopped on Himalayan road" />
              <div className="hero-status-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)' }}></div>
                  <strong style={{ fontSize: '0.9rem', letterSpacing: '0.05em', color: '#101827' }}>RIDERHUB SUPPORT</strong>
                </div>
                <div style={{ color: '#101827', fontWeight: 600, marginBottom: '0.25rem' }}>2 verified helpers nearby</div>
                <div style={{ color: '#49627F', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={14} /> Siliguri • Sevoke corridor
                </div>
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(0,0,0,0.1)', color: '#101827', fontSize: '0.85rem', fontWeight: 700 }}>
                  STATUS: AVAILABLE
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 4-STEP JOURNEY SECTION */}
      <section className="section shell">
        <SectionHeading eyebrow="A SIMPLE PATH FROM PROBLEM TO SUPPORT" title="Four steps. One goal. Get you safely moving again." />
        
        <div className="four-steps-wrapper">
          <div className="four-steps-line"></div>
          <div className="four-steps-grid">
            
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

          </div>
        </div>
      </section>

      {/* 3. MOCKUP SECTION: WHAT HAPPENS AFTER YOU REQUEST HELP */}
      <section className="hiw-mockup-section shell">
        <div className="hiw-mockup-grid">
          <div className="hiw-mockup-copy">
            <p className="eyebrow">LIVE TRACKING & STATUS</p>
            <h2>What Happens After You Request Help?</h2>
            <p>
              Once your request is submitted, nearby verified helpers receive a notification. You can track progress in real time from open status to issue resolution.
            </p>

            <div className="hiw-feature-list">
              <div className="hiw-feature-item">
                <Sparkles size={20} className="hiw-feature-icon" />
                <div>
                  <strong>Clear Status Updates</strong>
                  <span>Follow request updates from Open, Helper Offered, to Resolved.</span>
                </div>
              </div>

              <div className="hiw-feature-item">
                <UserCheck size={20} className="hiw-feature-icon" />
                <div>
                  <strong>Verified Helper Credentials</strong>
                  <span>View business names, helper ratings, and skills before accepting.</span>
                </div>
              </div>
            </div>
          </div>

          {/* UI MOCKUP CARD */}
          <div className="hiw-mockup-card">
            <div className="hiw-mockup-card__header">
              <div>
                <span className="mockup-id">RH-1092</span>
                <span className="mockup-status-badge">HELPER RESPONDED</span>
              </div>
              <span className="mockup-time"><Clock size={14} /> Just now</span>
            </div>

            <div className="hiw-mockup-card__body">
              <div className="mockup-field-row">
                <div>
                  <small>PROBLEM</small>
                  <strong>Rear tyre puncture</strong>
                </div>
                <div>
                  <small>MOTORCYCLE</small>
                  <strong>KTM 390 Adventure (WB 74 AB 8921)</strong>
                </div>
              </div>

              <div className="mockup-field-single">
                <small>LOCATION</small>
                <strong><MapPin size={14} /> Sevoke Road near Coronation Bridge</strong>
              </div>

              <div className="mockup-helper-box">
                <ShieldCheck size={20} />
                <div>
                  <strong>Siliguri Auto Care & Rescue (Suman Gurung)</strong>
                  <span>Verified Mechanic • Rating ⭐ 4.9 (38 Assists)</span>
                </div>
              </div>
            </div>

            {/* 5-STAGE LIFECYCLE TIMELINE */}
            <div className="hiw-timeline-wrapper">
              <p className="timeline-heading">Request Status Timeline</p>
              <ol className="hiw-timeline">
                <li className="is-done">
                  <span className="dot"><CheckCircle2 size={14} /></span>
                  <span>1. Request Submitted</span>
                </li>
                <li className="is-done">
                  <span className="dot"><CheckCircle2 size={14} /></span>
                  <span>2. Helpers Notified</span>
                </li>
                <li className="is-active">
                  <span className="dot" />
                  <span>3. Helper Responds</span>
                </li>
                <li>
                  <span className="dot" />
                  <span>4. Assistance In Progress</span>
                </li>
                <li>
                  <span className="dot" />
                  <span>5. Issue Resolved</span>
                </li>
              </ol>
            </div>

            <div className="hiw-mockup-card__footer">
              <Button variant="secondary" onClick={() => navigate('/request-help')}>
                Preview Help Request <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SAFETY AND PRIVACY CALLOUT */}
      <section className="hiw-safety-section shell">
        <div className="hiw-safety-card">
          <div className="hiw-safety-card__icon">
            <Shield size={32} />
          </div>
          <div className="hiw-safety-card__content">
            <h2>Help should be useful. Safety comes first.</h2>
            <p>
              MotoAssist is a coordination platform and does not replace emergency response services. Keep these essential guidelines in mind:
            </p>
            <ul className="hiw-safety-list">
              <li><CheckCircle2 size={16} /> <strong>Emergency Dispatch:</strong> For accidents, injuries, or physical danger, contact official emergency services (112) first.</li>
              <li><CheckCircle2 size={16} /> <strong>Consent-First GPS:</strong> Do not share your precise location unless you are comfortable doing so.</li>
              <li><CheckCircle2 size={16} /> <strong>Verify Helper Badge:</strong> Confirm helper identity and business credentials before accepting repairs or towing.</li>
              <li><CheckCircle2 size={16} /> <strong>Keep Info Private:</strong> Never share OTPs, account passwords, or banking details.</li>
            </ul>

            <div className="hiw-safety-card__action">
              <Link to="/safety">
                <Button variant="secondary">
                  <PhoneCall size={16} /> Read Full Safety Guidance & Hotlines
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FINAL COMPACT CTA SECTION */}
      <section className="hiw-cta-section shell">
        <div className="hiw-cta-box">
          <p className="eyebrow">READY WHEN YOU NEED IT</p>
          <h2>Ride farther. Get help when it matters.</h2>
          <p>
            Whether you are commuting through Siliguri or touring the high passes of Sikkim, MotoAssist helps you coordinate roadside support with more confidence.
          </p>
          <div className="hiw-cta-actions">
            <Button onClick={() => navigate('/request-help')}>
              Request Help Now <ArrowRight size={18} />
            </Button>
            <Button variant="secondary" onClick={() => navigate('/become-helper')}>
              Become a Helper
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
