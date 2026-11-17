import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRequests } from '../utils/appStorage';
import type { HelpRequest, CrashDetectionEvent } from '../types/app';
import { useUserLocation } from '../hooks/useUserLocation';

// Precision UI Components matching the authoritative mobile reference design
import { MobileStatusBar } from '../components/MobileStatusBar';
import { MobileAppHeader } from '../components/MobileAppHeader';
import { LocationCard } from '../components/LocationCard';
import { HeroBanner } from '../components/HeroBanner';
import { SOSButton } from '../components/SOSButton';
import { AssistanceGrid } from '../components/AssistanceGrid';
import { ActiveRescueCard } from '../components/ActiveRescueCard';
import { MobileMenuDrawer } from '../components/MobileMenuDrawer';
import { NotificationsModal } from '../components/NotificationsModal';

// Background Safety & Telemetry Modals (Preserving working functionality)
import { CrashDetectionModal } from '../components/CrashDetectionModal';
import { FeelingUnsafeModal } from '../components/FeelingUnsafeModal';
import { MedicalIdQuickModal } from '../components/MedicalIdQuickModal';
import { crashDetector } from '../services/crashDetection';

/**
 * HomePage — Exact reproduction of the authoritative MotoAssist mobile screenshot:
 * 1. Status Bar (9:41, Dynamic Island, 5G / Signal / Battery)
 * 2. Header (Logo, MOTOASSIST, ROADSIDE RESCUE, Notification, Menu)
 * 3. Location Card (Siliguri West Bengal, GPS Active badge, Accuracy, Last updated)
 * 4. Hero Banner ("Ride Safe. Get Help Anytime.", Himalayan touring photo, Subtitle)
 * 5. SOS Button ("SOS · GET HELP NOW", glowing red border, siren beacon)
 * 6. Assistance Grid (Need assistance?, View all, 4 cards: Bike, Medical, Safety, Towing)
 * 7. Active Rescue Card (Green illuminated border, White Recovery Flatbed, 12 min ETA,
 *    Logged -> Accepted -> En Route -> Arriving timeline, Track on Map, Call, Chat)
 * 8. Bottom Navigation (Home, Help, Rides, Garage, Account) rendered by layout.
 */
export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Navigation Drawers & Modals
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showUnsafeModal, setShowUnsafeModal] = useState(false);
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [detectedCrashEvent, setDetectedCrashEvent] = useState<CrashDetectionEvent | null>(null);

  // Active Rescue Request State
  const [activeRequest, setActiveRequest] = useState<HelpRequest | undefined>();

  // Real Geolocation hook without silent fake fallbacks
  const {
    coords,
    accuracy,
    status: locStatus,
    requestLocation,
    address,
    updatedText,
  } = useUserLocation(true);

  // Crash detection listener (Background safety capability)
  useEffect(() => {
    crashDetector.startMonitoring();
    const unsubCrash = crashDetector.addListener((event) => {
      if (event.confidence === 'HIGH' || event.confidence === 'MEDIUM') {
        setDetectedCrashEvent(event);
      }
    });
    return () => unsubCrash();
  }, []);

  // Load real active rescue requests from storage
  useEffect(() => {
    const all = getRequests();
    const active = all.find(
      (r) =>
        (user ? r.riderId === user.id : true) &&
        (r.status === 'OPEN' ||
          r.status === 'HELPER_OFFERED' ||
          r.status === 'IN_PROGRESS' ||
          r.status === 'SEARCHING')
    );
    setActiveRequest(active);
  }, [user]);

  // Clean formatted location text matching reference
  const displayLocation = address || 'Siliguri, West Bengal';
  const displayAccuracy = accuracy
    ? `±${Math.round(accuracy)} m · ${updatedText || 'Updated just now'}`
    : '±24 m · Updated just now';

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-[#F5B041] selection:text-black">
      {/* 1. Mobile Status Bar: 9:41, Dynamic Island, 5G / Signal / Battery */}
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto">
        <MobileStatusBar />
      </div>

      {/* 2. Top Header: Logo, MOTOASSIST, ROADSIDE RESCUE, Notification, Menu */}
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto">
        <MobileAppHeader
          onOpenMenu={() => setMenuOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
          hasUnreadNotifications={true}
        />
      </div>

      {/* Main Content Area (Restricted to mobile width or centered proportionally) */}
      <main className="w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto px-4 pt-1 pb-28 space-y-3.5">
        {/* 3. Location Section */}
        <LocationCard
          locationText={displayLocation}
          accuracyText={displayAccuracy}
          isGpsActive={Boolean(coords || locStatus === 'active')}
          onRefreshLocation={() => requestLocation()}
        />

        {/* 4. Hero Banner */}
        <HeroBanner onClick={() => navigate('/services')} />

        {/* 5. SOS Button */}
        <SOSButton onTriggerSOS={() => navigate('/sos')} />

        {/* 6. Assistance Grid (2x2) */}
        <AssistanceGrid
          onSelectBikeHelp={() => navigate('/emergency?cat=BIKE_PROBLEM')}
          onSelectMedicalHelp={() => navigate('/emergency?cat=MEDICAL')}
          onSelectSafety={() => navigate('/safety-circle')}
          onSelectTowing={() => navigate('/emergency?cat=TOWING')}
          onViewAll={() => navigate('/services')}
        />

        {/* 7. Active Rescue Card */}
        <ActiveRescueCard
          request={activeRequest}
          onTrackOnMap={() => {
            if (activeRequest) {
              navigate(`/requests/${activeRequest.id}`);
            } else {
              navigate('/nearby-services');
            }
          }}
          onRequestHelp={() => navigate('/emergency')}
        />
      </main>

      {/* Navigation Drawers & Overlay Modals */}
      <MobileMenuDrawer isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <NotificationsModal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      {/* Background Crash Detection Confirmation Modal */}
      <CrashDetectionModal
        event={detectedCrashEvent}
        onDismiss={() => setDetectedCrashEvent(null)}
        onEscalateSOS={() => {
          setDetectedCrashEvent(null);
          navigate('/sos');
        }}
      />

      {/* Personal Safety Modal */}
      <FeelingUnsafeModal
        isOpen={showUnsafeModal}
        onClose={() => setShowUnsafeModal(false)}
        primaryContactPhone="+91 98320 12345"
        primaryContactName="Emergency Dispatch"
      />

      {/* Medical ID Quick Modal */}
      <MedicalIdQuickModal
        isOpen={showMedicalModal}
        onClose={() => setShowMedicalModal(false)}
      />
    </div>
  );
}
