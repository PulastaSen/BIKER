/**
 * Utility to resolve asset URLs correctly across all deployment environments:
 * - GitHub Pages under repository subpath (e.g. https://pulastasen.github.io/BIKER/)
 * - Custom domain or root deployments (https://motoassist.in/)
 * - Vite local development (http://localhost:5173/)
 */
export function getAssetUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const baseUrl = import.meta.env.BASE_URL || './';
  const prefix = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${prefix}${cleanPath}`;
}
