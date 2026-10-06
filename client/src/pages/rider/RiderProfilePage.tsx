import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import { User, Check, ShieldCheck } from 'lucide-react';
import { addUser } from '../../utils/appStorage';

export function RiderProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email] = useState(user?.email || '');
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      const updated = { ...user, name, phone };
      addUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">RIDER ACCOUNT</p>
          <h1>Profile Details</h1>
          <p className="subtitle">Manage your personal information and contact preferences.</p>
        </div>
      </header>

      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-avatar-large">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <User size={40} />
            )}
          </div>

          <form onSubmit={handleSubmit} className="modal-form" style={{ marginTop: '1.5rem' }}>
            {saved && (
              <div className="location-status location-status--success">
                <ShieldCheck size={18} /> Profile updated successfully!
              </div>
            )}

            <div className="form-group">
              <label htmlFor="profileName">Full Name</label>
              <input
                id="profileName"
                type="text"
                autoComplete="name"
                enterKeyHint="next"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="profileEmail">Email Address (Read-only)</label>
                <input id="profileEmail" type="email" disabled value={email} />
              </div>
              <div className="form-group">
                <label htmlFor="profilePhone">Phone Number</label>
                <input
                  id="profilePhone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  enterKeyHint="done"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" style={{ marginTop: '1rem' }}>
              <Check size={18} /> Save Profile Changes
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
