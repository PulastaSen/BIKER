import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ResponsiveHome } from './pages/ResponsiveHome';
import { SOSPage } from './pages/SOSPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { SafetyPage } from './pages/SafetyPage';
import { BecomeHelperPage } from './pages/BecomeHelperPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { RequestHelpPage } from './pages/RequestHelpPage';
import { RequestSuccessPage } from './pages/RequestSuccessPage';
import { RequestDetailsPage } from './pages/RequestDetailsPage';
import { NearbyServicesPage } from './pages/NearbyServicesPage';
import { RiderDashboardPage } from './pages/rider/RiderDashboardPage';
import { MyRequestsPage } from './pages/rider/MyRequestsPage';
import { MyBikesPage } from './pages/rider/MyBikesPage';
import { EmergencyContactsPage } from './pages/rider/EmergencyContactsPage';
import { RiderProfilePage } from './pages/rider/RiderProfilePage';
import { SettingsPage } from './pages/rider/SettingsPage';
import { HelperDashboardPage } from './pages/helper/HelperDashboardPage';
import { AvailableRequestsPage } from './pages/helper/AvailableRequestsPage';
import { HelperAssistsPage } from './pages/helper/HelperAssistsPage';
import { HelperProfilePage } from './pages/helper/HelperProfilePage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminHelpersPage } from './pages/admin/AdminHelpersPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminRequestsPage } from './pages/admin/AdminRequestsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { ImStrandedPage } from './pages/ImStrandedPage';
import { MedicalIdPage } from './pages/MedicalIdPage';
import { EmergencyServicesPage } from './pages/EmergencyServicesPage';
import { WomenSafetyPage } from './pages/WomenSafetyPage';
import { SafetyCirclePage } from './pages/SafetyCirclePage';
import { SafeRidePage } from './pages/SafeRidePage';
import { RoadHazardsPage } from './pages/RoadHazardsPage';
import { RouteCoveragePage } from './pages/RouteCoveragePage';
import { SaveMyBikePage } from './pages/SaveMyBikePage';
import { AiBikeAssistantPage } from './pages/AiBikeAssistantPage';
import { DiyGuidesPage } from './pages/DiyGuidesPage';
import { SparePartsPage } from './pages/SparePartsPage';
import { AccidentAssistantPage } from './pages/AccidentAssistantPage';
import { RiderRecoveryPage } from './pages/RiderRecoveryPage';
import { PreRideCheckPage } from './pages/PreRideCheckPage';
import { BikeDocumentsPage } from './pages/BikeDocumentsPage';
import { PrivacyCenterPage } from './pages/PrivacyCenterPage';
import { ScrollToTop } from './components/ScrollToTop';
import { OfflineNotice } from './components/OfflineNotice';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} style={{ height: '100%' }}>
      {children}
    </motion.div>
  );
}

function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<PageTransition><ResponsiveHome /></PageTransition>} />
          <Route path="/im-stranded" element={<PageTransition><ImStrandedPage /></PageTransition>} />
          <Route path="/sos" element={<PageTransition><SOSPage /></PageTransition>} />
          <Route path="/how-it-works" element={<PageTransition><HowItWorksPage /></PageTransition>} />
          <Route path="/safety" element={<PageTransition><SafetyPage /></PageTransition>} />
          <Route path="/women-safety" element={<PageTransition><WomenSafetyPage /></PageTransition>} />
          <Route path="/emergency-services" element={<PageTransition><EmergencyServicesPage /></PageTransition>} />
          <Route path="/safety-circle" element={<PageTransition><SafetyCirclePage /></PageTransition>} />
          <Route path="/safe-ride" element={<PageTransition><SafeRidePage /></PageTransition>} />
          <Route path="/medical-id" element={<PageTransition><MedicalIdPage /></PageTransition>} />
          <Route path="/road-hazards" element={<PageTransition><RoadHazardsPage /></PageTransition>} />
          <Route path="/route-coverage" element={<PageTransition><RouteCoveragePage /></PageTransition>} />
          <Route path="/save-my-bike" element={<PageTransition><SaveMyBikePage /></PageTransition>} />
          <Route path="/ai-bike-assistant" element={<PageTransition><AiBikeAssistantPage /></PageTransition>} />
          <Route path="/diy-guides" element={<PageTransition><DiyGuidesPage /></PageTransition>} />
          <Route path="/spare-parts" element={<PageTransition><SparePartsPage /></PageTransition>} />
          <Route path="/accident-assistant" element={<PageTransition><AccidentAssistantPage /></PageTransition>} />
          <Route path="/rider-recovery" element={<PageTransition><RiderRecoveryPage /></PageTransition>} />
          <Route path="/pre-ride-check" element={<PageTransition><PreRideCheckPage /></PageTransition>} />
          <Route path="/documents" element={<PageTransition><BikeDocumentsPage /></PageTransition>} />
          <Route path="/privacy" element={<PageTransition><PrivacyCenterPage /></PageTransition>} />
          <Route path="/privacy-center" element={<PageTransition><PrivacyCenterPage /></PageTransition>} />
          <Route path="/become-helper" element={<PageTransition><BecomeHelperPage /></PageTransition>} />
          <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
          <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
          <Route path="/request-help" element={<PageTransition><RequestHelpPage /></PageTransition>} />
          <Route path="/request-success" element={<PageTransition><RequestSuccessPage /></PageTransition>} />
          <Route path="/requests/:id" element={<PageTransition><RequestDetailsPage /></PageTransition>} />
          <Route path="/nearby-services" element={<PageTransition><NearbyServicesPage /></PageTransition>} />
        </Route>
        <Route element={<DashboardLayout />}>
          <Route path="/rider/dashboard" element={<PageTransition><RiderDashboardPage /></PageTransition>} />
          <Route path="/rider/requests" element={<PageTransition><MyRequestsPage /></PageTransition>} />
          <Route path="/rider/bikes" element={<PageTransition><MyBikesPage /></PageTransition>} />
          <Route path="/rider/emergency-contacts" element={<PageTransition><EmergencyContactsPage /></PageTransition>} />
          <Route path="/rider/medical-id" element={<PageTransition><MedicalIdPage /></PageTransition>} />
          <Route path="/rider/safety-circle" element={<PageTransition><SafetyCirclePage /></PageTransition>} />
          <Route path="/rider/safe-ride" element={<PageTransition><SafeRidePage /></PageTransition>} />
          <Route path="/rider/documents" element={<PageTransition><BikeDocumentsPage /></PageTransition>} />
          <Route path="/rider/privacy" element={<PageTransition><PrivacyCenterPage /></PageTransition>} />
          <Route path="/rider/profile" element={<PageTransition><RiderProfilePage /></PageTransition>} />
          <Route path="/rider/settings" element={<PageTransition><SettingsPage /></PageTransition>} />
          <Route path="/helper/dashboard" element={<PageTransition><HelperDashboardPage /></PageTransition>} />
          <Route path="/helper/available-requests" element={<PageTransition><AvailableRequestsPage /></PageTransition>} />
          <Route path="/helper/my-assists" element={<PageTransition><HelperAssistsPage /></PageTransition>} />
          <Route path="/helper/profile" element={<PageTransition><HelperProfilePage /></PageTransition>} />
          <Route path="/admin/dashboard" element={<PageTransition><AdminDashboardPage /></PageTransition>} />
          <Route path="/admin/helpers" element={<PageTransition><AdminHelpersPage /></PageTransition>} />
          <Route path="/admin/users" element={<PageTransition><AdminUsersPage /></PageTransition>} />
          <Route path="/admin/requests" element={<PageTransition><AdminRequestsPage /></PageTransition>} />
          <Route path="/admin/reports" element={<PageTransition><AdminReportsPage /></PageTransition>} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <ScrollToTop />
        <OfflineNotice />
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
}
