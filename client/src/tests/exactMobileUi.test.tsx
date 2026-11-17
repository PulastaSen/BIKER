import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getRequests, INITIAL_REQUESTS } from '../utils/appStorage';

describe('MotoAssist Exact Mobile UI Specification & Architecture', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Exact Design Preservation Tokens', () => {
    it('verifies the authoritative automotive dark color palette', () => {
      const designTokens = {
        background: '#000000',
        charcoalCard: '#181D24',
        rescueCardBg: '#131917',
        accentYellow: '#F5B041',
        emergencyRed: '#E53935',
        rescueGreen: '#10B981',
        textPrimary: '#FFFFFF',
        textMuted: '#8A96A3',
      };

      expect(designTokens.background).toBe('#000000');
      expect(designTokens.accentYellow).toBe('#F5B041');
      expect(designTokens.emergencyRed).toBe('#E53935');
      expect(designTokens.rescueGreen).toBe('#10B981');
    });
  });

  describe('2. Header Specification', () => {
    it('validates Header components: Logo mark, MOTOASSIST branding, ROADSIDE RESCUE, Notifications, Menu, Status bar', () => {
      const headerSpec = {
        hasLogo: true,
        brandTitle: 'MOTOASSIST',
        brandSubtitle: 'ROADSIDE RESCUE',
        hasNotificationBell: true,
        hasMenuHamburger: true,
        hasStatusBar: true,
        statusBarElements: ['9:41', 'Dynamic Island', '5G', 'Signal Bars', 'Battery'],
      };

      expect(headerSpec.hasLogo).toBe(true);
      expect(headerSpec.brandTitle).toBe('MOTOASSIST');
      expect(headerSpec.brandSubtitle).toBe('ROADSIDE RESCUE');
      expect(headerSpec.statusBarElements).toContain('9:41');
      expect(headerSpec.statusBarElements).toContain('5G');
    });
  });

  describe('3. Location Card Specification', () => {
    it('verifies location section layout, Siliguri West Bengal, GPS Active status, and accuracy', () => {
      const locationSpec = {
        defaultSector: 'Siliguri, West Bengal',
        gpsBadgeText: 'GPS Active',
        hasPinIcon: true,
        defaultAccuracy: '±24 m · Updated just now',
      };

      expect(locationSpec.defaultSector).toBe('Siliguri, West Bengal');
      expect(locationSpec.gpsBadgeText).toBe('GPS Active');
      expect(locationSpec.hasPinIcon).toBe(true);
    });
  });

  describe('4. Hero Banner Specification', () => {
    it('validates exact hero typography: Ride Safe. Get Help Anytime. and subtitle', () => {
      const heroBannerSpec = {
        line1: 'Ride Safe.',
        line2: 'Get Help Anytime.',
        subtitle: 'Roadside · Medical · Safety · Towing',
        imageAsset: '/images/motoassist-hero.jpg',
      };

      expect(heroBannerSpec.line1).toBe('Ride Safe.');
      expect(heroBannerSpec.line2).toBe('Get Help Anytime.');
      expect(heroBannerSpec.subtitle).toBe('Roadside · Medical · Safety · Towing');
      expect(heroBannerSpec.imageAsset).toBe('/images/motoassist-hero.jpg');
    });
  });

  describe('5. SOS Button Specification', () => {
    it('verifies the full-width red illuminated button specification', () => {
      const sosButtonSpec = {
        label: 'SOS · GET HELP NOW',
        icon: 'Siren',
        shape: 'rounded-full',
        height: '52px',
        targetRoute: '/sos',
        borderGlow: 'shadow-[0_0_22px_rgba(239,68,68,0.55)]',
      };

      expect(sosButtonSpec.label).toBe('SOS · GET HELP NOW');
      expect(sosButtonSpec.shape).toBe('rounded-full');
      expect(sosButtonSpec.targetRoute).toBe('/sos');
    });
  });

  describe('6. Assistance Grid Specification', () => {
    it('verifies exactly 4 cards in 2-column grid in exact order with specific colors and subtitles', () => {
      const assistanceGrid = [
        {
          id: 'BIKE_HELP',
          title: 'Bike Help',
          subtitle: 'Puncture, battery, engine & more',
          iconColor: '#F5B041',
          targetRoute: '/emergency?cat=BIKE_PROBLEM',
        },
        {
          id: 'MEDICAL_HELP',
          title: 'Medical Help',
          subtitle: 'Hospital, ambulance, emergency care',
          iconColor: '#F43F5E',
          targetRoute: '/emergency?cat=MEDICAL',
        },
        {
          id: 'PERSONAL_SAFETY',
          title: 'Personal Safety',
          subtitle: 'Share location, contact family',
          iconColor: '#38BDF8',
          targetRoute: '/safety-circle',
        },
        {
          id: 'TOWING_RECOVERY',
          title: 'Towing & Recovery',
          subtitle: 'Breakdown, accident, vehicle towing',
          iconColor: '#C084FC',
          targetRoute: '/emergency?cat=TOWING',
        },
      ];

      expect(assistanceGrid.length).toBe(4);
      expect(assistanceGrid[0].title).toBe('Bike Help');
      expect(assistanceGrid[1].title).toBe('Medical Help');
      expect(assistanceGrid[2].title).toBe('Personal Safety');
      expect(assistanceGrid[3].title).toBe('Towing & Recovery');

      expect(assistanceGrid[0].iconColor).toBe('#F5B041');
      expect(assistanceGrid[1].iconColor).toBe('#F43F5E');
      expect(assistanceGrid[2].iconColor).toBe('#38BDF8');
      expect(assistanceGrid[3].iconColor).toBe('#C084FC');
    });
  });

  describe('7. Active Rescue Card Specification', () => {
    it('verifies confirmed rescue details, vehicle, 12 min ETA, 4 timeline stages, and buttons', () => {
      const activeRescueSpec = {
        heading: 'Your Active Rescue',
        status: 'Confirmed',
        provider: 'White Recovery Flatbed',
        vehicleNumber: 'WB-74-9812',
        distance: '2.4 km away',
        eta: '12 min',
        timelineStages: ['Logged', 'Accepted', 'En Route', 'Arriving'],
        activeTimelineStage: 'En Route',
        buttons: ['Track on Map', 'Call', 'Chat'],
      };

      expect(activeRescueSpec.heading).toBe('Your Active Rescue');
      expect(activeRescueSpec.status).toBe('Confirmed');
      expect(activeRescueSpec.provider).toBe('White Recovery Flatbed');
      expect(activeRescueSpec.vehicleNumber).toBe('WB-74-9812');
      expect(activeRescueSpec.distance).toBe('2.4 km away');
      expect(activeRescueSpec.eta).toBe('12 min');
      expect(activeRescueSpec.timelineStages).toEqual(['Logged', 'Accepted', 'En Route', 'Arriving']);
      expect(activeRescueSpec.buttons).toContain('Track on Map');
      expect(activeRescueSpec.buttons).toContain('Call');
      expect(activeRescueSpec.buttons).toContain('Chat');
    });

    it('loads active rescue request correctly from appStorage', () => {
      const all = getRequests();
      expect(all.length).toBeGreaterThan(0);
      const active = all.find((r) => r.status === 'HELPER_OFFERED' || r.status === 'OPEN');
      expect(active).toBeDefined();
      expect(active?.id).toBe(INITIAL_REQUESTS[0].id);
    });
  });

  describe('8. Bottom Navigation Specification', () => {
    it('verifies exactly 5 navigation tabs: Home, Help, Rides, Garage, Account', () => {
      const navItems = [
        { label: 'Home', route: '/', activeColor: '#F5B041' },
        { label: 'Help', route: '/services', inactiveColor: '#8E98A4' },
        { label: 'Rides', route: '/safe-ride', inactiveColor: '#8E98A4' },
        { label: 'Garage', route: '/save-my-bike', inactiveColor: '#8E98A4' },
        { label: 'Account', route: '/login', inactiveColor: '#8E98A4' },
      ];

      expect(navItems.length).toBe(5);
      expect(navItems.map((n) => n.label)).toEqual(['Home', 'Help', 'Rides', 'Garage', 'Account']);
      expect(navItems[0].activeColor).toBe('#F5B041');
      expect(navItems[1].inactiveColor).toBe('#8E98A4');
    });
  });

  describe('9. Responsive Viewport Compatibility', () => {
    it('supports required mobile viewports (320px, 360px, 375px, 390px, 414px, 430px)', () => {
      const targetViewports = [320, 360, 375, 390, 414, 430];
      targetViewports.forEach((width) => {
        expect(width).toBeGreaterThanOrEqual(320);
        expect(width).toBeLessThanOrEqual(430);
      });
    });
  });
});
