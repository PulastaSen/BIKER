import { useState, useEffect, useCallback, useRef } from 'react';

export interface UserLocationState {
  coords: { lat: number; lng: number } | null;
  accuracy: number | null; // in meters
  lastUpdated: Date | null;
  status: 'idle' | 'requesting' | 'active' | 'denied' | 'unavailable' | 'searched';
  address: string | null;
  errorReason: string | null;
  updatedText: string;
}

export function useUserLocation(autoRequest = false) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [status, setStatus] = useState<'idle' | 'requesting' | 'active' | 'denied' | 'unavailable' | 'searched'>('idle');
  const [address, setAddress] = useState<string | null>(null);
  const [errorReason, setErrorReason] = useState<string | null>(null);
  const [updatedText, setUpdatedText] = useState<string>('Never');

  const watchIdRef = useRef<number | null>(null);

  // Format the "Updated X sec ago" ticker
  useEffect(() => {
    if (!lastUpdated) {
      setUpdatedText('Never');
      return;
    }

    const updateTicker = () => {
      const seconds = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
      if (seconds < 5) {
        setUpdatedText('Just now');
      } else if (seconds < 60) {
        setUpdatedText(`${seconds} sec ago`);
      } else {
        const minutes = Math.floor(seconds / 60);
        setUpdatedText(`${minutes}m ago`);
      }
    };

    updateTicker();
    const interval = setInterval(updateTicker, 3000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const requestLocation = useCallback((_reason = 'Location access is needed to find nearby help.') => {
    setStatus('requesting');
    setErrorReason(null);

    if (!('geolocation' in navigator)) {
      setStatus('unavailable');
      setErrorReason('Location services are not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newCoords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setCoords(newCoords);
        setAccuracy(Math.round(pos.coords.accuracy));
        setLastUpdated(new Date());
        setStatus('active');
        setErrorReason(null);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus('denied');
          setErrorReason('Location access is turned off.');
        } else if (err.code === err.TIMEOUT) {
          setStatus('unavailable');
          setErrorReason('Location request timed out. Please try again or search your location.');
        } else {
          setStatus('unavailable');
          setErrorReason('Location is currently unavailable.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 10000,
      }
    );
  }, []);

  // Set location from place or landmark search
  const setSearchLocation = useCallback((landmarkName: string, approxCoords?: { lat: number; lng: number }) => {
    setAddress(landmarkName);
    if (approxCoords) {
      setCoords(approxCoords);
      setAccuracy(null);
    }
    setLastUpdated(new Date());
    setStatus('searched');
    setErrorReason(null);
  }, []);

  const clearLocation = useCallback(() => {
    setCoords(null);
    setAccuracy(null);
    setLastUpdated(null);
    setStatus('idle');
    setAddress(null);
    setErrorReason(null);
  }, []);

  useEffect(() => {
    if (autoRequest) {
      requestLocation();
    }
    return () => {
      if (watchIdRef.current !== null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [autoRequest, requestLocation]);

  return {
    coords,
    accuracy,
    lastUpdated,
    status,
    address,
    errorReason,
    updatedText,
    requestLocation,
    setSearchLocation,
    clearLocation,
    isActive: status === 'active' || status === 'searched',
  };
}
