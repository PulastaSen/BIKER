import { describe, it, expect, beforeEach } from 'vitest';
import { 
  saveRequest, 
  cancelRequest, 
  escalateRequest, 
  disputeRequest, 
  getRequestById 
} from '../utils/appStorage';
import type { HelpRequest } from '../types/app';

describe('Manufacturer-Grade RSA Lifecycle & State Machine Test Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const testRequest: HelpRequest = {
    id: 'REQ-TEST-RSA-01',
    requestId: 'REQ-TEST-RSA-01',
    riderId: 'rider-test-01',
    riderName: 'Pulasta Sen',
    riderPhone: '+91 98765 43210',
    bike: {
      id: 'bike-re-himalayan-450',
      userId: 'rider-test-01',
      brand: 'Royal Enfield',
      model: 'Himalayan 450',
      registrationNumber: 'WB 74 H 4500',
      year: 2024,
      fuelType: 'PETROL'
    },
    bikeDetails: {
      brand: 'Royal Enfield',
      model: 'Himalayan 450',
      registrationNumber: 'WB 74 H 4500',
      vin: 'ME3H450XXXX123456',
      year: 2024,
      fuelType: 'PETROL'
    },
    coverageType: 'COMPLIMENTARY_YEAR_1',
    helpCategory: 'MECHANICAL',
    subcategory: 'TYRE',
    issue: 'PUNCTURE',
    urgency: 'HIGH',
    description: 'Rear tubeless tyre puncture on NH-10 ascent. Tyre completely flat.',
    approximateLocation: 'Sevoke Coronation Bridge (KM 18.4)',
    locationShared: true,
    latitude: 26.8834,
    longitude: 88.4712,
    accuracyMeters: 8,
    locationProvenance: 'GPS_FRESH',
    status: 'SUBMITTED',
    estimatedPrice: {
      calloutFee: 150,
      travelFee: 100,
      serviceFee: 100,
      estimatedTotal: 350,
      isAvailable: true,
      disclaimer: 'Labor & towing up to 50km covered under RSA scope. Consumables, fuel, and spare parts payable at actuals.'
    },
    createdAt: new Date().toISOString()
  };

  it('1. correctly captures motorcycle identification (VRN, VIN, Brand, Model)', () => {
    saveRequest(testRequest);
    const loaded = getRequestById('REQ-TEST-RSA-01');

    expect(loaded).toBeDefined();
    expect(loaded?.bikeDetails?.brand).toBe('Royal Enfield');
    expect(loaded?.bikeDetails?.model).toBe('Himalayan 450');
    expect(loaded?.bikeDetails?.registrationNumber).toBe('WB 74 H 4500');
    expect(loaded?.bikeDetails?.vin).toBe('ME3H450XXXX123456');
    expect(loaded?.coverageType).toBe('COMPLIMENTARY_YEAR_1');
    expect(loaded?.locationProvenance).toBe('GPS_FRESH');
  });

  it('2. provides pricing transparency with 50km RSA disclaimer', () => {
    saveRequest(testRequest);
    const loaded = getRequestById('REQ-TEST-RSA-01');

    expect(loaded?.estimatedPrice?.isAvailable).toBe(true);
    expect(loaded?.estimatedPrice?.disclaimer).toContain('50km');
    expect(loaded?.estimatedPrice?.disclaimer).toContain('actuals');
  });

  it('3. cancels an active request and records truthful cancellation reason', () => {
    saveRequest(testRequest);
    const cancelReason = 'Bike restarted / Problem self-resolved';
    const updated = cancelRequest('REQ-TEST-RSA-01', cancelReason);

    expect(updated).toBeDefined();
    expect(updated?.status).toBe('CANCELLED');
    expect(updated?.cancellationReason).toBe(cancelReason);

    const reloaded = getRequestById('REQ-TEST-RSA-01');
    expect(reloaded?.status).toBe('CANCELLED');
    expect(reloaded?.cancellationReason).toBe(cancelReason);
  });

  it('4. escalates to 24/7 Helpline 1800 2100 007 when no local provider responds', () => {
    saveRequest(testRequest);
    const notes = 'Rider escalated to 24/7 Helpline desk due to local provider unavailability.';
    const updated = escalateRequest('REQ-TEST-RSA-01', notes);

    expect(updated).toBeDefined();
    expect(updated?.status).toBe('UNFULFILLED_NO_PROVIDER');
    expect(updated?.escalationDetails?.escalatedToHelpline).toBe(true);
    expect(updated?.escalationDetails?.helplinePhone).toBe('1800 2100 007');
    expect(updated?.escalationDetails?.notes).toBe(notes);

    const reloaded = getRequestById('REQ-TEST-RSA-01');
    expect(reloaded?.status).toBe('UNFULFILLED_NO_PROVIDER');
    expect(reloaded?.escalationDetails?.escalatedToHelpline).toBe(true);
  });

  it('5. files official billing / overcharge dispute with tariff audit', () => {
    saveRequest(testRequest);
    const reason = 'Excess charges above ₹45/km towing tariff — billed ₹75/km for 18km excess';
    const amount = 540;

    const updated = disputeRequest('REQ-TEST-RSA-01', reason, amount);

    expect(updated).toBeDefined();
    expect(updated?.disputeDetails?.disputed).toBe(true);
    expect(updated?.disputeDetails?.reason).toBe(reason);
    expect(updated?.disputeDetails?.disputedAmount).toBe(540);
    expect(updated?.disputeDetails?.status).toBe('REVIEW_PENDING');

    const reloaded = getRequestById('REQ-TEST-RSA-01');
    expect(reloaded?.disputeDetails?.disputed).toBe(true);
    expect(reloaded?.disputeDetails?.disputedAmount).toBe(540);
  });
});
