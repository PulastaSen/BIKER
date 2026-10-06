import type { HelpRequest } from '../types/request';

const key = 'motoassist-requests';

export function saveRequest(request: HelpRequest): void {
  const saved = getRequests();
  localStorage.setItem(key, JSON.stringify([request, ...saved]));
}

export function getRequests(): HelpRequest[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]') as HelpRequest[];
  } catch {
    return [];
  }
}

export function getRequest(id: string): HelpRequest | undefined {
  return getRequests().find((request) => request.id === id);
}

export function clearRequests(): void {
  localStorage.removeItem(key);
}
