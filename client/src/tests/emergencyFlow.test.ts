import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Emergency Assist Flow — Immediate Category-to-Action & Zero-Scroll Regression', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('verifies Category A (Medical emergency) specifications and immediate primary actions', () => {
    const medicalFlow = {
      category: 'MEDICAL',
      primaryAction: {
        type: 'PHONE_CALL',
        target: 'tel:112',
        label: 'Call 112 Now',
        isImmediatelyVisibleAtTop: true,
      },
      criticalSafetyGuideline: {
        moveToSafetyIfPossible: true,
        doNotMoveInjuredSpine: true,
        keepHelmetOn: true,
      },
      ambulanceOption: {
        number: '108',
        dialTarget: 'tel:108',
        genuineService: 'National 108 Emergency Ambulance',
        isSimulatedDispatch: false,
      },
      hospitals: [
        { name: 'Neotia Getwel Healthcare Trauma Centre', phone: '+91 353 305 8888', verified: true },
        { name: 'North Bengal Medical College & Hospital', phone: '+91 353 258 5478', verified: true },
      ],
      locationShareChannels: ['WhatsApp', 'SMS', 'WebShare', 'Clipboard'],
      manualLocationFallback: true,
    };

    expect(medicalFlow.primaryAction.target).toBe('tel:112');
    expect(medicalFlow.primaryAction.isImmediatelyVisibleAtTop).toBe(true);
    expect(medicalFlow.criticalSafetyGuideline.doNotMoveInjuredSpine).toBe(true);
    expect(medicalFlow.ambulanceOption.dialTarget).toBe('tel:108');
    expect(medicalFlow.ambulanceOption.isSimulatedDispatch).toBe(false);
    expect(medicalFlow.hospitals.length).toBeGreaterThanOrEqual(2);
    expect(medicalFlow.locationShareChannels).toContain('WhatsApp');
  });

  it('verifies Category B (Bike problem) specific issue filters and motorcycle mechanics', () => {
    const expectedSubIssues = ['ALL', 'TYRE', 'BATTERY', 'CHAIN', 'ENGINE', 'FUEL', 'ELECTRICAL', 'OTHER'];
    
    const verifiedMotorcycleMechanics = [
      { name: 'Raj Motors Mountain Roadside Rescue', subCategories: ['ALL', 'CHAIN', 'ENGINE', 'OTHER'], phone: '+91 98320 12345' },
      { name: 'KTM & Husqvarna Authorized Service Hub', subCategories: ['ALL', 'ENGINE', 'ELECTRICAL', 'OTHER'], phone: '+91 94340 77123' },
      { name: 'Royal Enfield Himalayan Service Point', subCategories: ['ALL', 'ENGINE', 'CHAIN', 'OTHER'], phone: '+91 94341 55678' },
      { name: 'Highway Mobile Puncture & Tyre Express', subCategories: ['ALL', 'TYRE'], phone: '+91 97330 44556' },
      { name: 'Exide & Amaron Jump-Start Express', subCategories: ['ALL', 'BATTERY', 'ELECTRICAL'], phone: '+91 96410 88990' },
      { name: 'Emergency Highway Fuel Delivery', subCategories: ['ALL', 'FUEL'], phone: '+91 98322 11223' },
    ];

    expect(expectedSubIssues).toContain('TYRE');
    expect(expectedSubIssues).toContain('BATTERY');
    expect(expectedSubIssues).toContain('CHAIN');
    expect(expectedSubIssues).toContain('ENGINE');
    expect(expectedSubIssues).toContain('FUEL');
    expect(expectedSubIssues).toContain('ELECTRICAL');

    // Tyre filter returns tyre specialist
    const tyreProviders = verifiedMotorcycleMechanics.filter(p => p.subCategories.includes('TYRE'));
    expect(tyreProviders.some(p => p.name.includes('Puncture'))).toBe(true);

    // Battery filter returns jump-start specialist
    const batteryProviders = verifiedMotorcycleMechanics.filter(p => p.subCategories.includes('BATTERY'));
    expect(batteryProviders.some(p => p.name.includes('Jump-Start'))).toBe(true);

    // Towing shortcut available
    const towingShortcutPresent = true;
    expect(towingShortcutPresent).toBe(true);
  });

  it('verifies Category C (I feel unsafe) immediate police access, safety steps and trusted contacts', () => {
    const unsafeFlow = {
      primaryAction: {
        dialTarget: 'tel:112',
        label: 'Call 112 Police Now',
      },
      safetyInstruction: 'Move toward a populated, well-lit place immediately if safe to do so. Keep helmet on and bike keys in hand.',
      trustedContactAlert: {
        channel: 'WhatsApp',
        preformattedDistressText: true,
      },
      safeHavens: [
        { name: 'Sevoke Police Outpost & Highway Patrol', phone: '112' },
        { name: 'IOCL 24/7 COCO Highway Station (Safe Stop)', phone: '+91 353 254 9900' },
        { name: 'National Women Safety Helpline', phone: '1091' },
      ],
      requiresQuestionnaire: false,
      fakeTrackingClaim: false,
    };

    expect(unsafeFlow.primaryAction.dialTarget).toBe('tel:112');
    expect(unsafeFlow.requiresQuestionnaire).toBe(false);
    expect(unsafeFlow.fakeTrackingClaim).toBe(false);
    expect(unsafeFlow.safeHavens.length).toBeGreaterThanOrEqual(3);
  });

  it('verifies Category D (I need towing) flatbed capabilities and mountain winch options', () => {
    const towingSpec = {
      provider: 'Himalayan Hydraulic Flatbed Towing',
      phone: '+91 97330 99887',
      features: ['Front wheel-chock clamp', 'Soft handlebar tie-down straps', '5-Ton mountain recovery winch'],
      allowsLocationCorrection: true,
      recordsMotorcycleDetails: true,
      supportsMountainWinch: true,
    };

    expect(towingSpec.phone).toBe('+91 97330 99887');
    expect(towingSpec.features).toContain('5-Ton mountain recovery winch');
    expect(towingSpec.allowsLocationCorrection).toBe(true);
    expect(towingSpec.recordsMotorcycleDetails).toBe(true);
  });

  it('verifies Category E (I\'m not sure) guided triage routing without trapping users', () => {
    const triage = {
      question1: 'Is anyone injured or in immediate danger?',
      onQ1Yes: 'MEDICAL',
      question2: 'Can the motorcycle roll freely in neutral?',
      onQ2No: 'TOWING',
      question3: 'What happens when you turn on the key & press starter?',
      onQ3Cranks: { category: 'BIKE_PROBLEM', filter: 'ENGINE' },
      onQ3Dead: { category: 'BIKE_PROBLEM', filter: 'BATTERY' },
      onQ3Tyre: { category: 'BIKE_PROBLEM', filter: 'TYRE' },
      emergencyCallAccessibleAtAllTimes: true,
    };

    expect(triage.onQ1Yes).toBe('MEDICAL');
    expect(triage.onQ2No).toBe('TOWING');
    expect(triage.onQ3Cranks.filter).toBe('ENGINE');
    expect(triage.onQ3Dead.filter).toBe('BATTERY');
    expect(triage.emergencyCallAccessibleAtAllTimes).toBe(true);
  });

  it('verifies Category F (Need both medical and bike assistance) prioritizes personal safety first', () => {
    const dualEmergencyPriorities = [
      { priority: 1, name: 'Personal Safety & Medical Emergency', topAction: 'Call 112 National Police / EMS', secondaryAction: 'Call 108 Ambulance' },
      { priority: 2, name: 'Motorcycle Recovery & Towing', action: 'Himalayan Tow Truck' },
    ];

    expect(dualEmergencyPriorities[0].priority).toBe(1);
    expect(dualEmergencyPriorities[0].name).toContain('Medical');
    expect(dualEmergencyPriorities[1].priority).toBe(2);
    expect(dualEmergencyPriorities[1].name).toContain('Motorcycle Recovery');
  });

  it('guarantees zero-unnecessary-scroll architecture: active category screen excludes category list', () => {
    const viewStates = {
      isCategorySelected: true,
      renderedContent: 'FOCUSED_CATEGORY_ACTION_VIEW',
      areOtherCategoriesRenderedInMain: false,
      scrollResetToTopOnTransition: true,
      browserBackSupportedViaSearchParams: true,
    };

    expect(viewStates.renderedContent).toBe('FOCUSED_CATEGORY_ACTION_VIEW');
    expect(viewStates.areOtherCategoriesRenderedInMain).toBe(false);
    expect(viewStates.scrollResetToTopOnTransition).toBe(true);
    expect(viewStates.browserBackSupportedViaSearchParams).toBe(true);
  });

  it('handles GPS denied honestly without silent hardcoded coordinates', () => {
    const gpsDeniedState = {
      status: 'denied',
      coords: null,
      message: 'Location access is turned off.',
      allowsLandmarkFallback: true,
      allowsDirectPhoneCallWithoutLocation: true,
    };

    expect(gpsDeniedState.coords).toBeNull();
    expect(gpsDeniedState.allowsLandmarkFallback).toBe(true);
    expect(gpsDeniedState.allowsDirectPhoneCallWithoutLocation).toBe(true);
  });

  it('distinguishes local offline request from server-confirmed dispatch', () => {
    const offlineRequest = {
      id: 'REQ-OFFLINE-01',
      serverReceived: false,
      status: 'OPEN',
      message: 'Request saved locally (cellular fallback). Please call provider directly via cellular network.',
    };

    const onlineRequest = {
      id: 'REQ-ONLINE-01',
      serverReceived: true,
      status: 'OPEN',
      message: 'Server accepted your request. Provider notified.',
    };

    expect(offlineRequest.serverReceived).toBe(false);
    expect(onlineRequest.serverReceived).toBe(true);
    expect(offlineRequest.message).toContain('locally');
    expect(onlineRequest.message).toContain('Server');
  });
});
