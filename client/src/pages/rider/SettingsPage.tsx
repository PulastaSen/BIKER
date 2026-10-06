import { useState } from 'react';
import { Button } from '../../components/Button';
import { Settings, RefreshCw, ShieldCheck } from 'lucide-react';
import { initAppStorage } from '../../utils/appStorage';

export function SettingsPage() {
  const [locationPref, setLocationPref] = useState(true);
  const [resetDone, setResetDone] = useState(false);

  const handleResetData = () => {
    if (window.confirm('Reset all requests, garage bikes, and helper profiles back to default system state?')) {
      localStorage.clear();
      initAppStorage();
      setResetDone(true);
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">PREFERENCES & SYSTEM</p>
          <h1>App Settings</h1>
          <p className="subtitle">Configure location sharing privacy and system storage.</p>
        </div>
      </header>

      <div className="settings-stack">
        <div className="dash-card">
          <h3><Settings size={20} /> Location & Privacy Settings</h3>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="check-label">
              <input
                type="checkbox"
                checked={locationPref}
                onChange={(e) => setLocationPref(e.target.checked)}
              />
              <span>Require explicit consent before retrieving browser Geolocation API</span>
            </label>
            <p className="location-subtext">
              MotoAssist will never access GPS coordinates automatically without your confirmation.
            </p>
          </div>
        </div>

        <div className="dash-card">
          <h3><RefreshCw size={20} /> Clear Cache & Reset State</h3>
          <p className="subtitle">
            Restores local requests, garage bikes, and helper network profiles back to the default verified state.
          </p>

          {resetDone && (
            <div className="location-status location-status--success" style={{ marginBottom: '1rem' }}>
              <ShieldCheck size={18} /> System cache reset! Reloading application...
            </div>
          )}

          <Button variant="secondary" onClick={handleResetData}>
            <RefreshCw size={16} /> Reset System Cache
          </Button>
        </div>
      </div>
    </div>
  );
}
