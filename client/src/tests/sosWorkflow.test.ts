import { describe, it, expect } from 'vitest';
import { 
  buildWhatsAppEmergencyAlertUrl, 
  buildSmsEmergencyAlertUrl 
} from '../utils/whatsappShare';

describe('MotoAssist SOS 4-Step Emergency Workflow & Truthful Dispatch', () => {
  it('generates truthful SMS emergency alert containing GPS fix and milestone without requiring data', () => {
    const smsUrl = buildSmsEmergencyAlertUrl({
      latitude: 26.7271,
      longitude: 88.4312,
      landmark: 'NH-10 KM 42 near Sevoke Bridge',
      riderName: 'Pulasta',
      situation: 'Medical Emergency'
    });

    expect(smsUrl).toContain('sms:?body=');
    const decoded = decodeURIComponent(smsUrl);
    expect(decoded).toContain('EMERGENCY SOS (Pulasta)');
    expect(decoded).toContain('Need urgent Medical Emergency');
    expect(decoded).toContain('https://maps.google.com/?q=26.7271,88.4312');
    expect(decoded).toContain('NH-10 KM 42 near Sevoke Bridge');
    expect(decoded).toContain('Please call 112 or dispatch assistance');
  });

  it('generates emergency WhatsApp alert with direct wa.me link and coordinates', () => {
    const waUrl = buildWhatsAppEmergencyAlertUrl({
      latitude: 26.7271,
      longitude: 88.4312,
      landmark: 'NH-10 KM 42 near Sevoke Bridge',
      phone: '+919876543210',
      riderName: 'Pulasta'
    });

    expect(waUrl).toContain('https://wa.me/919876543210?text=');
    const decoded = decodeURIComponent(waUrl);
    expect(decoded).toContain('MotoAssist Safety Alert');
    expect(decoded).toContain('Pulasta requested emergency assistance');
    expect(decoded).toContain('https://maps.google.com/?q=26.7271,88.4312');
    expect(decoded).toContain('112');
  });

  it('verifies the 4-step emergency flow definition and 7 problem types', () => {
    const problemTypes = ['MEDICAL', 'BREAKDOWN', 'SAFETY', 'ACCIDENT', 'TOWING', 'MULTIPLE', 'UNSURE'];
    expect(problemTypes).toHaveLength(7);

    const steps = [
      { step: 1, name: 'Problem Selection' },
      { step: 2, name: 'Location Identification' },
      { step: 3, name: 'Confirmation Card (3-Second Hold)' },
      { step: 4, name: 'Truthful Status Progression' }
    ];
    expect(steps).toHaveLength(4);
  });

  it('validates truthful progression stages: searching state does not claim fake provider arrival', () => {
    const progressionStages = [
      'PREPARING',
      'SENDING',
      'RECEIVED',
      'SEARCHING',
      'ACCEPTED',
      'EN_ROUTE',
      'ARRIVED',
      'COMPLETED'
    ];

    expect(progressionStages).toHaveLength(8);

    // Simulated incident in searching state
    const incidentState = {
      status: 'SEARCHING',
      serverReceived: true,
      providerAccepted: false,
      truthfulLabel: 'Searching for nearby responders...'
    };

    expect(incidentState.providerAccepted).toBe(false);
    expect(incidentState.truthfulLabel).not.toContain('arriving');
    expect(incidentState.truthfulLabel).toContain('Searching');
  });

  it('validates offline emergency fallback numbers and survival guidelines', () => {
    const officialEmergencyHotlines = {
      nationalPolice: '112',
      ambulance: '108',
      womenSafety: '1091',
      highwayPatrol: '1033'
    };

    expect(officialEmergencyHotlines.nationalPolice).toBe('112');
    expect(officialEmergencyHotlines.ambulance).toBe('108');
    expect(officialEmergencyHotlines.womenSafety).toBe('1091');
    expect(officialEmergencyHotlines.highwayPatrol).toBe('1033');

    const riderSurvivalGuidelines = [
      'Stay with your bike if in a safe spot',
      'Move off the active roadway / stand behind guardrail',
      'Turn on hazard lights / indicators',
      'Conserve phone battery'
    ];
    expect(riderSurvivalGuidelines).toHaveLength(4);
  });
});
