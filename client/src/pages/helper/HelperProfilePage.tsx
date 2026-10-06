import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getHelperProfileByUserId, saveHelperProfile } from '../../utils/appStorage';
import type { HelperProfile } from '../../types/app';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { Wrench, Check, ShieldCheck } from 'lucide-react';

export function HelperProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<HelperProfile | undefined>();
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const areasList = ['Siliguri', 'Sevoke', 'Kalimpong', 'Darjeeling', 'Gangtok', 'Teesta Bazaar', 'Rangpo'];
  const skillsList = [
    'Puncture repair',
    'Battery jump-start',
    'Chain repair',
    'Clutch repair',
    'Fuel delivery',
    'Towing',
    'Basic engine troubleshooting',
    'Electrical repair',
  ];

  useEffect(() => {
    if (user) {
      const p = getHelperProfileByUserId(user.id);
      if (p) {
        setProfile(p);
        setBusinessName(p.businessName || '');
        setPhone(p.phone);
        setSelectedAreas(p.serviceAreas || []);
        setSelectedSkills(p.skills || []);
      }
    }
  }, [user]);

  const toggleArea = (area: string) => {
    setSelectedAreas((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]));
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile) {
      const updated: HelperProfile = {
        ...profile,
        businessName,
        phone,
        serviceAreas: selectedAreas,
        skills: selectedSkills,
      };
      saveHelperProfile(updated);
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">HELPER SETTINGS</p>
          <h1>Helper Profile & Services</h1>
          <p className="subtitle">Manage workshop details, covered service areas, and skill badges.</p>
        </div>

        {profile && (
          <div>
            <StatusBadge status={profile.verificationStatus} />
          </div>
        )}
      </header>

      <div className="profile-container">
        <div className="profile-card">
          <form onSubmit={handleSave} className="modal-form">
            {saved && (
              <div className="location-status location-status--success">
                <ShieldCheck size={18} /> Helper profile updated successfully!
              </div>
            )}

            <div className="form-group">
              <label htmlFor="helperBusName">Workshop / Business Name</label>
              <input
                id="helperBusName"
                type="text"
                autoCapitalize="words"
                autoComplete="organization"
                enterKeyHint="next"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Siliguri Speed Auto Care"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="helperPhoneInput">Contact Phone Number</label>
                <input
                  id="helperPhoneInput"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  enterKeyHint="done"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="helperCategory">Service Category</label>
                <input id="helperCategory" type="text" disabled value={profile?.serviceType || 'MECHANIC'} />
              </div>
            </div>

            <div className="form-group">
              <span className="field-label">Service Areas Covered</span>
              <div className="area-tags">
                {areasList.map((area) => (
                  <button
                    key={area}
                    type="button"
                    className={`tag-btn ${selectedAreas.includes(area) ? 'is-selected' : ''}`}
                    onClick={() => toggleArea(area)}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <span className="field-label">Skills & Services Provided</span>
              <div className="area-tags">
                {skillsList.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    className={`tag-btn ${selectedSkills.includes(skill) ? 'is-selected' : ''}`}
                    onClick={() => toggleSkill(skill)}
                  >
                    <Wrench size={14} /> {skill}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" style={{ marginTop: '1rem' }}>
              <Check size={18} /> Save Helper Profile
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
