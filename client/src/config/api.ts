/**
 * MotoAssist API & WebSocket Configuration
 * Dynamically switches between local development and production environments.
 */

export const API_BASE_URL: string =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? '' : 'http://localhost:5000');

export const SOCKET_URL: string =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? window.location.origin : 'http://localhost:5000');
