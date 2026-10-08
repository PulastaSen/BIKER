/**
 * MotoAssist WhatsApp Share Utilities
 * Generates direct wa.me links with concise pre-filled messages and Google Maps location links.
 * Does not require family members to install MotoAssist.
 */

export interface ShareLocationOptions {
  latitude?: number;
  longitude?: number;
  landmark?: string;
  phone?: string;
  riderName?: string;
}

export function buildWhatsAppEmergencyAlertUrl(options: ShareLocationOptions): string {
  const { latitude, longitude, landmark, phone, riderName = 'I' } = options;
  
  let locationText = '';
  if (latitude !== undefined && longitude !== undefined) {
    locationText = `https://maps.google.com/?q=${latitude},${longitude}`;
  } else if (landmark) {
    locationText = landmark;
  } else {
    locationText = 'Highway Corridor';
  }

  const message = `🚨 EMERGENCY ALERT from MotoAssist: ${riderName} needs assistance.\n\nCurrent Location: ${locationText}\nTime: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n\nPlease check in or contact emergency services (112) if unreachable.`;

  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
  const baseUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : 'https://wa.me/';
  return `${baseUrl}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppFeelingUnsafeUrl(options: ShareLocationOptions & { situation?: string }): string {
  const { latitude, longitude, landmark, phone, riderName = 'I', situation = 'I feel unsafe' } = options;

  let locationText = '';
  if (latitude !== undefined && longitude !== undefined) {
    locationText = `https://maps.google.com/?q=${latitude},${longitude}`;
  } else if (landmark) {
    locationText = landmark;
  } else {
    locationText = 'On the road';
  }

  const message = `⚠️ MOTOASSIST SAFETY ALERT: ${riderName} is feeling unsafe on the road.\nSituation: ${situation}\n\nLive Location: ${locationText}\nTime: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n\nPlease stay on call or track my route.`;

  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
  const baseUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : 'https://wa.me/';
  return `${baseUrl}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppRideShareUrl(options: ShareLocationOptions & { destination: string; eta?: string }): string {
  const { latitude, longitude, destination, eta, phone, riderName = 'I' } = options;

  let locationText = '';
  if (latitude !== undefined && longitude !== undefined) {
    locationText = `\nCurrent Location: https://maps.google.com/?q=${latitude},${longitude}`;
  }

  const etaText = eta ? `\nExpected Arrival (ETA): ${eta}` : '';

  const message = `🏍️ MotoAssist Safe Ride: ${riderName} started a ride to ${destination}.${etaText}${locationText}\n\nTracking with MotoAssist Safety Circle.`;

  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
  const baseUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : 'https://wa.me/';
  return `${baseUrl}?text=${encodeURIComponent(message)}`;
}
