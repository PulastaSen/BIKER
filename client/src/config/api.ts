/**
 * MotoAssist API & WebSocket Configuration
 * Dynamically switches between local development, remote backend, and standalone offline/demo environments.
 */

const isGitHubPages = typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');
const configuredApiUrl = import.meta.env.VITE_API_URL;

// When running on GitHub Pages (or static hosts) without a configured backend URL,
// enable standalone client mode to prevent 404/405 network requests against static hosts.
export const IS_STANDALONE_MODE: boolean =
  !configuredApiUrl && (isGitHubPages || (import.meta.env.PROD && !configuredApiUrl));

export const API_BASE_URL: string =
  configuredApiUrl || (import.meta.env.PROD ? '' : 'http://localhost:5000');

export const SOCKET_URL: string =
  import.meta.env.VITE_SOCKET_URL ||
  configuredApiUrl ||
  (import.meta.env.PROD ? (isGitHubPages ? '' : window.location.origin) : 'http://localhost:5000');

/**
 * Returns true ONLY if there is an active backend API endpoint available to query.
 * On static hosting (like GitHub Pages) without VITE_API_URL configured,
 * this returns false to prevent 404/405 network errors against static hosts.
 */
export function hasBackendApi(): boolean {
  if (configuredApiUrl) return true;
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('github.io')) return false;
  return !import.meta.env.PROD && Boolean(API_BASE_URL);
}
