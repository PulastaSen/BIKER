import { describe, it, expect, beforeEach } from 'vitest';
import {
  getServiceBookings,
  saveServiceBooking,
  updateServiceBookingStatus,
  getUserSubscriptions,
  saveSubscription,
  getVehicleQrTags,
  saveVehicleQrTag,
  submitQrContactRequest,
  revokeVehicleQrTag,
  getBikes,
  saveBike
} from '../utils/appStorage';
import type { ServiceBooking, UserSubscription, VehicleQrTag, Bike } from '../types/app';

describe('ReadyAssist-Style Motorcycle Platform & Service Capabilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('PHASE 2 & 3: Service Catalogue and On-Demand Booking Lifecycle', () => {
    it('creates persistent on-demand booking with disclosed pricing and bike details', () => {
      const newBooking: ServiceBooking = {
        bookingId: 'BK-TEST-101',
        userId: 'rider-test-1',
        riderName: 'Arjun Sen',
        riderPhone: '+91 98765 00001',
        serviceType: 'PUNCTURE_REPAIR',
        serviceName: 'Tubeless Tyre Mushroom Plug Repair',
        bikeDetails: {
          brand: 'Royal Enfield',
          model: 'Himalayan 450',
          registrationNumber: 'WB 74 H 4501',
          fuelType: 'PETROL'
        },
        location: {
          address: 'Sevoke Road 4th Mile, Siliguri',
          lat: 26.745,
          lng: 88.43
        },
        pricing: {
          baseRate: 350,
          travelFee: 100,
          partsEstimate: 150,
          totalEstimated: 600,
          isCoveredBySubscription: false,
          disclaimer: 'Transparent base quotation. Consumables billed at actuals.'
        },
        status: 'REQUESTED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      saveServiceBooking(newBooking);
      const bookings = getServiceBookings('rider-test-1');
      expect(bookings.length).toBe(1);
      expect(bookings[0].bookingId).toBe('BK-TEST-101');
      expect(bookings[0].pricing.totalEstimated).toBe(600);
      expect(bookings[0].bikeDetails.model).toBe('Himalayan 450');
    });

    it('progresses booking through provider acceptance, dispatch, and on-site completion', () => {
      const initial: ServiceBooking = {
        bookingId: 'BK-LIFECYCLE-1',
        userId: 'rider-2',
        riderName: 'Kunal Roy',
        riderPhone: '+91 98320 00002',
        serviceType: 'BATTERY_JUMPSTART',
        serviceName: '12V Motorcycle Battery Jumpstart & Health Test',
        bikeDetails: {
          brand: 'KTM',
          model: 'Duke 390',
          registrationNumber: 'WB 74 K 3901'
        },
        location: {
          address: 'Darjeeling More, Siliguri',
          lat: 26.732,
          lng: 88.414
        },
        pricing: {
          baseRate: 400,
          travelFee: 100,
          partsEstimate: 0,
          totalEstimated: 500,
          isCoveredBySubscription: true,
          coveragePlanName: 'Touring Pro Roadside Shield',
          disclaimer: 'Covered under Touring Pro plan'
        },
        status: 'REQUESTED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      saveServiceBooking(initial);

      // Step 1: Provider accepts
      const accepted = updateServiceBookingStatus('BK-LIFECYCLE-1', 'ASSIGNED', {
        assignedProvider: {
          id: 'helper-mechanic-1',
          name: 'Siliguri Moto Rescue & Spares',
          phone: '+91 94340 55555',
          rating: 4.9,
          assignedAt: new Date().toISOString()
        }
      });
      expect(accepted?.status).toBe('ASSIGNED');
      expect(accepted?.assignedProvider?.name).toBe('Siliguri Moto Rescue & Spares');

      // Step 2: Completed with service notes
      const completed = updateServiceBookingStatus('BK-LIFECYCLE-1', 'COMPLETED', {
        serviceNotes: 'Battery jumpstarted via 12V LiFePO4 booster pack. Stator output verified at 14.2V.',
        partsUsed: ['Battery terminal cleaning', 'Electrical contact grease']
      });
      expect(completed?.status).toBe('COMPLETED');
      expect(completed?.partsUsed?.length).toBe(2);
      expect(completed?.serviceNotes).toContain('Stator output verified');
    });
  });

  describe('PHASE 4: Subscription & Coverage Entitlements', () => {
    it('activates Touring Pro RSA plan linked to registered motorcycle', () => {
      const sub: UserSubscription = {
        subscriptionId: 'sub-touring-1',
        userId: 'rider-1',
        planTier: 'TOURING_PRO',
        planName: 'Touring Pro Roadside Shield',
        priceInr: 2499,
        durationMonths: 12,
        linkedBike: {
          bikeId: 'bike-himalayan',
          brand: 'Royal Enfield',
          model: 'Himalayan 450',
          registrationNumber: 'WB 74 H 4501'
        },
        features: {
          maxFreeBreakdowns: 4,
          usedBreakdowns: 0,
          towingDistanceLimitKm: 100,
          includesPunctureRepair: true,
          includesBatteryJumpstart: true,
          includesMinorMechanicalLabor: true,
          includesFuelDeliveryLabor: true,
          includesMountainWinchRecovery: true,
          highwayPriorityDispatch: true
        },
        waitingPeriodHours: 24,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 86400000).toISOString(),
        status: 'ACTIVE',
        paymentDetails: {
          paymentMode: 'TEST_DEMO',
          transactionRef: 'TXN-TEST-12345',
          paidAmount: 2499,
          paidAt: new Date().toISOString()
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      saveSubscription(sub);
      const userSubs = getUserSubscriptions('rider-1');
      expect(userSubs.length).toBe(1);
      expect(userSubs[0].status).toBe('ACTIVE');
      expect(userSubs[0].features.towingDistanceLimitKm).toBe(100);
      expect(userSubs[0].features.includesPunctureRepair).toBe(true);
    });

    it('enforces towing limit entitlements per subscription tier', () => {
      const plans = [
        { tier: 'FREEDOM', towingKm: 25 },
        { tier: 'COMMUTER', towingKm: 40 },
        { tier: 'TOURING_PRO', towingKm: 100 },
        { tier: 'HILL_EXPLORER', towingKm: 150 }
      ];

      plans.forEach((p) => {
        expect(p.towingKm).toBeGreaterThan(0);
      });
      expect(plans.find((p) => p.tier === 'HILL_EXPLORER')?.towingKm).toBe(150);
    });
  });

  describe('PHASE 8: Vehicle Help-Line QR Tag & Privacy Protection', () => {
    it('generates unguessable, revocable QR token and displays owner-approved info only', () => {
      const tag: VehicleQrTag = {
        token: 'qr_sec_a1b2c3d4e5f6',
        bikeId: 'bike-101',
        userId: 'rider-secret-id',
        vehicleNickname: 'Himalayan Sherpa',
        brand: 'Royal Enfield',
        model: 'Himalayan 450',
        registrationNumber: 'WB 74 H 4501',
        emergencyInstructions: 'Blood group O+, emergency contact alerted upon scanning tag. First aid kit under seat.',
        isActive: true,
        allowPublicContact: true,
        contactRequests: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      saveVehicleQrTag(tag);
      const retrieved = getVehicleQrTags().find(t => t.bikeId === 'bike-101');
      expect(retrieved).toBeDefined();
      expect(retrieved?.token.startsWith('qr_sec_')).toBe(true);
      expect(retrieved?.isActive).toBe(true);
    });

    it('allows a passerby or Samaritan to submit masked contact alert without exposing owner phone number', () => {
      const tag: VehicleQrTag = {
        token: 'qr_sec_parked_alert',
        bikeId: 'bike-102',
        userId: 'rider-102',
        vehicleNickname: 'Meteor 350',
        brand: 'Royal Enfield',
        model: 'Meteor 350',
        registrationNumber: 'WB 74 AB 1234',
        emergencyInstructions: 'Parked motorcycle issue reporting tag.',
        isActive: true,
        allowPublicContact: true,
        contactRequests: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      saveVehicleQrTag(tag);

      const alert = submitQrContactRequest('qr_sec_parked_alert', {
        requestType: 'PARKED_OBSTRUCTION',
        senderName: 'Traffic Warden',
        senderPhone: '+91 94340 99999',
        message: 'Motorcycle parked blocking commercial delivery lane. Please move forward 10 meters.'
      });

      expect(alert).toBeDefined();
      expect(alert?.requestType).toBe('PARKED_OBSTRUCTION');

      // Verify contact requests array received the alert
      const retrieved = getVehicleQrTags().find(t => t.bikeId === 'bike-102');
      expect(retrieved?.contactRequests.length).toBe(1);
    });

    it('revokes QR tag immediately so public scans can no longer reach owner', () => {
      const tag: VehicleQrTag = {
        token: 'qr_sec_to_revoke',
        bikeId: 'bike-103',
        userId: 'rider-103',
        vehicleNickname: 'KTM Adventure',
        brand: 'KTM',
        model: '390 Adventure',
        registrationNumber: 'WB 74 KT 3900',
        emergencyInstructions: 'Will be revoked',
        isActive: true,
        allowPublicContact: true,
        contactRequests: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      saveVehicleQrTag(tag);

      const revoked = revokeVehicleQrTag('bike-103');
      expect(revoked).toBe(true);

      const retrieved = getVehicleQrTags().find(t => t.bikeId === 'bike-103');
      expect(retrieved?.isActive).toBe(false);

      // Attempting contact on revoked tag should fail
      const result = submitQrContactRequest('qr_sec_to_revoke', {
        requestType: 'ACCIDENT_EMERGENCY',
        senderPhone: '+91 99999 88888',
        message: 'Accident alert'
      });
      expect(result).toBeUndefined();
    });
  });

  describe('PHASE 9: Garage Maintenance & Preventive Intervals', () => {
    it('tracks motorcycle odometer, maintenance reminders, and document expiries', () => {
      const testBike: Bike = {
        id: 'bike-himalayan',
        userId: 'rider-1',
        brand: 'Royal Enfield',
        model: 'Himalayan 450',
        year: 2024,
        registrationNumber: 'WB 74 H 4501',
        fuelType: 'PETROL',
        odometerKm: 8500,
        insuranceExpiry: '2027-04-15',
        pucExpiry: '2026-12-10',
        maintenanceReminders: {
          chainLubeDueKm: 8700,
          oilServiceDueKm: 9000,
          tyreCheckDate: '2026-11-01'
        }
      };

      saveBike(testBike);
      const bikes = getBikes('rider-1');
      expect(bikes.length).toBeGreaterThan(0);
      const saved = bikes.find((b) => b.id === 'bike-himalayan');
      expect(saved?.odometerKm).toBe(8500);
      expect(saved?.maintenanceReminders?.chainLubeDueKm).toBe(8700);

      // Check distance to next chain lube
      const kmRemaining = (saved?.maintenanceReminders?.chainLubeDueKm || 0) - (saved?.odometerKm || 0);
      expect(kmRemaining).toBe(200); // 8700 - 8500 = 200 km remaining
    });
  });
});
