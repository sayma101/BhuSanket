import type { Claim, CompareResult, Location, TrendRequest, TrendResult, Variable } from './types';

async function request<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`/api/v1${path}`, { method: body === undefined ? 'GET' : 'POST', headers: body === undefined ? undefined : { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body), cache: 'no-store' });
  if (!response.ok) {
    let message = `Evidence service returned ${response.status}.`;
    try { const data = await response.json(); message = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail ?? data); } catch { /* Keep the HTTP status if upstream is unavailable. */ }
    throw new Error(message);
  }
  const data = await response.json(); return data as T;
}
export const api = { get: <T>(path: string) => request<T>(path), post: <T>(path: string, body: unknown) => request<T>(path, body) };
export const runTrend = (body: TrendRequest) => request<TrendResult>('/trend', body);
export const compareRegions = (left: TrendRequest, right: TrendRequest) => request<CompareResult>('/compare', { left, right });
export const getClaims = () => request<Claim[]>('/claims');
export const getLocations = () => request<Location[]>('/locations');
export const getVariables = () => request<Variable[]>('/variables');
export function downloadFile(name: string, value: string, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([value], { type })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
