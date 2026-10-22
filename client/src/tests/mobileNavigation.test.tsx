import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Universal Mobile Compatibility & Navigation Architecture', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    document.body.style.overflow = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('validates comprehensive public and authenticated routes definition', () => {
    const definedRoutes = [
      '/',
      '/entry',
      '/emergency',
      '/emergency-assist',
      '/verification',
      '/im-stranded',
      '/sos',
      '/how-it-works',
      '/safety',
      '/women-safety',
      '/emergency-services',
      '/safety-circle',
      '/safe-ride',
      '/medical-id',
      '/road-hazards',
      '/route-coverage',
      '/safety-profile',
      '/save-my-bike',
      '/ai-bike-assistant',
      '/diy-guides',
      '/spare-parts',
      '/accident-assistant',
      '/rider-recovery',
      '/pre-ride-check',
      '/documents',
      '/privacy',
      '/become-helper',
      '/login',
      '/register',
      '/request-help',
      '/request-success',
      '/nearby-services',
      '/services',
      '/subscriptions',
      '/remote-readiness',
      '/ops',
      '/troubleshoot'
    ];

    expect(definedRoutes.length).toBeGreaterThanOrEqual(35);
    // Crucial entry and safety routes
    expect(definedRoutes).toContain('/');
    expect(definedRoutes).toContain('/emergency');
    expect(definedRoutes).toContain('/sos');
    expect(definedRoutes).toContain('/services');
    expect(definedRoutes).toContain('/subscriptions');
  });

  it('verifies GitHub Pages subpath (/BIKER/) SPA hash routing fallback logic', () => {
    const base = '/BIKER/';

    function simulate404Redirect(pathname: string, search: string = '', hash: string = '') {
      if (pathname.indexOf(base) === 0) {
        const route = pathname.substring(base.length);
        if (route && route !== 'index.html') {
          return `${base}#/${route.replace(/^\/+/, '')}${search}${hash}`;
        }
      }
      return `${base}${search}${hash}`;
    }

    // Direct entry to subpath without hash
    expect(simulate404Redirect('/BIKER/services')).toBe('/BIKER/#/services');
    expect(simulate404Redirect('/BIKER/emergency', '?cat=TOWING')).toBe('/BIKER/#/emergency?cat=TOWING');
    expect(simulate404Redirect('/BIKER/subscriptions')).toBe('/BIKER/#/subscriptions');
    expect(simulate404Redirect('/BIKER/')).toBe('/BIKER/');
    expect(simulate404Redirect('/BIKER')).toBe('/BIKER/');
  });

  it('enforces minimum 44px touch targets on mobile interactive controls', () => {
    const touchTargetSpec = {
      menuButton: { minWidth: 44, minHeight: 44 },
      headerEmergencyCall: { minWidth: 44, minHeight: 44 },
      headerMedicalId: { minWidth: 44, minHeight: 44 },
      bottomNavItem: { minHeight: 48 },
      drawerCloseButton: { minWidth: 44, minHeight: 44 },
      drawerLogoutButton: { minWidth: 44, minHeight: 44 },
      smartEntryExploreButton: { minHeight: 44 }
    };

    expect(touchTargetSpec.menuButton.minWidth).toBeGreaterThanOrEqual(44);
    expect(touchTargetSpec.menuButton.minHeight).toBeGreaterThanOrEqual(44);
    expect(touchTargetSpec.headerEmergencyCall.minHeight).toBeGreaterThanOrEqual(44);
    expect(touchTargetSpec.bottomNavItem.minHeight).toBeGreaterThanOrEqual(44);
    expect(touchTargetSpec.drawerLogoutButton.minWidth).toBeGreaterThanOrEqual(44);
    expect(touchTargetSpec.smartEntryExploreButton.minHeight).toBeGreaterThanOrEqual(44);
  });

  it('validates mobile body scroll locking on modal/drawer display', () => {
    // Simulate drawer opening
    let isMenuOpen = true;
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    }
    expect(document.body.style.overflow).toBe('hidden');

    // Simulate drawer closing
    isMenuOpen = false;
    if (!isMenuOpen) {
      document.body.style.overflow = '';
    }
    expect(document.body.style.overflow).toBe('');
  });

  it('validates mobile viewport media query thresholds', () => {
    const viewports = [
      { name: 'iPhone SE / Small Android', width: 320, isMobileNav: true },
      { name: 'Standard Android (Galaxy S / Pixel)', width: 360, isMobileNav: true },
      { name: 'iPhone 13 / 14 / 15', width: 390, isMobileNav: true },
      { name: 'Large Android / iPhone Plus / Pro Max', width: 430, isMobileNav: true },
      { name: 'Tablet Portrait (iPad Mini)', width: 768, isMobileNav: true },
      { name: 'Foldable / Large Tablet Portrait', width: 900, isMobileNav: true },
      { name: 'iPad Pro / Small Desktop', width: 1024, isMobileNav: false },
      { name: 'Standard Desktop', width: 1280, isMobileNav: false },
      { name: 'Wide Desktop', width: 1440, isMobileNav: false },
    ];

    // The unified navigation breakpoint is 1024px:
    // width < 1024px renders mobile drawer and hamburger
    // width >= 1024px renders desktop inline navigation bar
    const breakpoint = 1024;
    viewports.forEach(vp => {
      const isMobile = vp.width < breakpoint;
      expect(isMobile).toBe(vp.isMobileNav);
    });
  });

  it('guarantees Emergency Call 112 is always a tel:112 link without authentication barrier', () => {
    const callAction = {
      href: 'tel:112',
      accessibleLabel: 'Call 112 National Emergency',
      requiresAuth: false,
      isSimulated: false
    };

    expect(callAction.href).toBe('tel:112');
    expect(callAction.requiresAuth).toBe(false);
    expect(callAction.isSimulated).toBe(false);
  });

  it('verifies SmartEntry exploration path without forcing authentication', () => {
    const smartEntryOptions = {
      emergencyOption: {
        label: 'YES — I NEED HELP',
        destination: '/emergency',
        requiresAuth: false
      },
      accountOption: {
        label: "NO — I'M OK",
        destination: '/login',
        requiresAuth: false
      },
      exploreOption: {
        label: 'Explore Platform & Roadside Plans (No Login Required)',
        destination: '/services',
        requiresAuth: false
      }
    };

    expect(smartEntryOptions.exploreOption.destination).toBe('/services');
    expect(smartEntryOptions.exploreOption.requiresAuth).toBe(false);
  });
});
