import { LoaderCircle, MapPin, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from './Button';

export type LocationState = 'idle' | 'loading' | 'granted' | 'denied' | 'unavailable';

interface LocationPermissionProps {
  shareLocation: boolean;
  onShareLocationChange: (checked: boolean) => void;
  locationState: LocationState;
  coordinates?: { latitude: number; longitude: number };
  onRequestLocation: () => void;
}

export function LocationPermission({
  shareLocation,
  onShareLocationChange,
  locationState,
  coordinates,
  onRequestLocation,
}: LocationPermissionProps) {
  return (
    <div className="location-box">
      <label className="check-label">
        <input
          type="checkbox"
          checked={shareLocation}
          onChange={(e) => onShareLocationChange(e.target.checked)}
        />
        <span>Share my current location with potential helpers.</span>
      </label>
      <p className="location-subtext">
        Your exact location will only be shared when you give permission.
      </p>

      <div className="location-action">
        <Button
          variant="secondary"
          type="button"
          onClick={onRequestLocation}
          disabled={locationState === 'loading'}
        >
          {locationState === 'loading' ? (
            <LoaderCircle className="spin" size={18} />
          ) : (
            <MapPin size={18} />
          )}
          {locationState === 'loading' ? 'Getting location...' : 'Use my current location'}
        </Button>
      </div>

      {locationState === 'granted' && coordinates && (
        <div className="location-status location-status--success" role="status">
          <ShieldCheck size={18} />
          <div>
            <strong>Location captured</strong>
            <span>
              Coordinates: {coordinates.latitude.toFixed(5)}, {coordinates.longitude.toFixed(5)}
            </span>
          </div>
        </div>
      )}

      {locationState === 'denied' && (
        <div className="location-status location-status--warning" role="alert">
          <AlertCircle size={18} />
          <div>
            <strong>Location permission was denied</strong>
            <span>You can continue using an approximate location.</span>
          </div>
        </div>
      )}

      {locationState === 'unavailable' && (
        <div className="location-status location-status--info" role="alert">
          <AlertCircle size={18} />
          <div>
            <strong>Browser does not support geolocation</strong>
            <span>You can continue using an approximate location.</span>
          </div>
        </div>
      )}
    </div>
  );
}
