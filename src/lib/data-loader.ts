import type { Receipt, Manifest } from '../types';

const cache = new Map<string, unknown>();

export async function loadManifest(): Promise<Manifest> {
  if (cache.has('manifest')) return cache.get('manifest') as Manifest;
  const res = await fetch('/data/manifest.json');
  const data = await res.json();
  cache.set('manifest', data);
  return data;
}

export async function loadYear(year: number): Promise<Receipt[]> {
  const key = `year-${year}`;
  if (cache.has(key)) return cache.get(key) as Receipt[];
  try {
    const res = await fetch(`/data/receipts/${year}.json`);
    if (!res.ok) return [];
    const data = await res.json();
    cache.set(key, data);
    return data;
  } catch {
    return [];
  }
}

export async function loadAllReceipts(): Promise<Receipt[]> {
  if (cache.has('all-receipts')) return cache.get('all-receipts') as Receipt[];
  
  const years = Array.from({ length: 2024 - 2013 + 1 }, (_, i) => 2013 + i);
  const results = await Promise.all(years.map(loadYear));
  const all = results.flat().sort((a, b) => a.ts.localeCompare(b.ts));
  
  cache.set('all-receipts', all);
  return all;
}
