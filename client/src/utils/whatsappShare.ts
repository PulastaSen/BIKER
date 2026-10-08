/**
 * MotoAssist WhatsApp Share Utilities
 * Generates direct wa.me links with calm, concise pre-filled messages and Google Maps location links.
 * Family members do NOT need to install MotoAssist.
 */

export interface ShareLocationOptions {
  latitude?: number;
  longitude?: number;
  landmark?: string;
  phone?: string;
  riderName?: string;
}

/**
 * Section 17: Calm emergency message
 */
export function buildWhatsAppEmergencyAlertUrl(options: ShareLocationOptions): string {
  const { latitude, longitude, landmark, phone, riderName = 'Rider' } = options;
  
  let mapLink = '';
  if (latitude !== undefined && longitude !== undefined) {
    mapLink = `https://maps.google.com/?q=${latitude},${longitude}`;
  } else if (landmark) {
    mapLink = landmark;
  } else {
    mapLink = 'Location pending';
  }

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const message = [
    `MotoAssist Safety Alert`,
    ``,
    `${riderName} requested emergency assistance.`,
    ``,
    `Last known/current location:`,
    `${mapLink}`,
    ``,
    `Time:`,
    `${timeStr}`,
    ``,
    `Please contact the rider or emergency services (112) if needed.`
  ].join('\n');

  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
  const baseUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : 'https://wa.me/';
  return `${baseUrl}?text=${encodeURIComponent(message)}`;
}

/**
 * Section 12-14: Feeling Unsafe alert
 */
export function buildWhatsAppFeelingUnsafeUrl(options: ShareLocationOptions & { situation?: string }): string {
  const { latitude, longitude, landmark, phone, riderName = 'Rider', situation = 'I feel unsafe' } = options;

  let mapLink = '';
  if (latitude !== undefined && longitude !== undefined) {
    mapLink = `https://maps.google.com/?q=${latitude},${longitude}`;
  } else if (landmark) {
    mapLink = landmark;
  } else {
    mapLink = 'On the road';
  }

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const message = [
    `⚠️ MotoAssist Safety Alert`,
    ``,
    `${riderName} is feeling unsafe on the road.`,
    `Situation: ${situation}`,
    ``,
    `Current location:`,
    `${mapLink}`,
    ``,
    `Time: ${timeStr}`,
    ``,
    `Please stay on call or check in.`
  ].join('\n');

  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
  const baseUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : 'https://wa.me/';
  return `${baseUrl}?text=${encodeURIComponent(message)}`;
}

/**
 * Section 17 & 18: Normal ride start message
 */
export function buildWhatsAppRideShareUrl(options: ShareLocationOptions & { destination: string; eta?: string }): string {
  const { latitude, longitude, destination, eta, phone, riderName = 'Rider' } = options;

  const lines = [
    `MotoAssist`,
    ``,
    `${riderName} started a Safe Ride.`,
    ``,
    `Destination:`,
    `${destination}`,
  ];

  if (eta) {
    lines.push(``, `Expected arrival:`, `${eta}`);
  }

  if (latitude !== undefined && longitude !== undefined) {
    lines.push(``, `View Location:`, `https://maps.google.com/?q=${latitude},${longitude}`);
  }

  const message = lines.join('\n');
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
  const baseUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : 'https://wa.me/';
  return `${baseUrl}?text=${encodeURIComponent(message)}`;
}

/**
 * Section 19: One-tap "I'm Safe" check-in message
 */
export function buildWhatsAppImSafeUrl(options: { phone?: string; riderName?: string; destination?: string }): string {
  const { phone, riderName = 'Rider', destination } = options;
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const lines = [
    `MotoAssist`,
    ``,
    `🟢 ${riderName} is safe.`,
  ];

  if (destination) {
    lines.push(`Destination: ${destination}`);
  }
  lines.push(`Time: ${timeStr}`);

  const message = lines.join('\n');
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
  const baseUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : 'https://wa.me/';
  return `${baseUrl}?text=${encodeURIComponent(message)}`;
}
