import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseSpotify } from './adapters/spotify.ts';
import { parseHousehold } from './adapters/household.ts';
import type { Receipt, Manifest, DailyRollup, ReceiptType } from '../src/types.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW_DIR = path.join(__dirname, '../Mock_Data');
const OUT_DIR = path.join(__dirname, '../public/data');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

console.log('Loading datasets...');
const spotifyRaw = parseSpotify(path.join(RAW_DIR, 'spotify_history.csv'));
const householdRaw = parseHousehold(path.join(RAW_DIR, 'Daily Household Transactions.csv'));

console.log(`Loaded ${spotifyRaw.length} Spotify plays, ${householdRaw.length} household transactions.`);

// 1. Pre-calculate entity tracking & medians
const artistPlays = new Map<string, { first: string; last: string; count: number }>();
const trackPlays = new Map<string, { count: number; medianMs: number; msArray: number[] }>();

for (const p of spotifyRaw) {
  const artist = p.subtitle!;
  const track = p.title;
  
  if (!artistPlays.has(artist)) {
    artistPlays.set(artist, { first: p.ts, last: p.ts, count: 0 });
  }
  const a = artistPlays.get(artist)!;
  a.count++;
  if (p.ts < a.first) a.first = p.ts;
  if (p.ts > a.last) a.last = p.ts;

  if (!trackPlays.has(track)) {
    trackPlays.set(track, { count: 0, medianMs: 0, msArray: [] });
  }
  const t = trackPlays.get(track)!;
  t.count++;
  if (p.durationMs) t.msArray.push(p.durationMs);
}

// Compute medians
for (const t of trackPlays.values()) {
  t.msArray.sort((a, b) => a - b);
  t.medianMs = t.msArray[Math.floor(t.msArray.length / 2)] || 0;
  delete (t as any).msArray; // Free memory
}

const top200Tracks = new Set(
  [...trackPlays.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 200)
    .map(x => x[0])
);

// 2. Day & Hour tracking
const dayBuckets = new Map<string, Receipt[]>();
const hourBuckets = new Map<number, Receipt[]>(); // floor(ts / 3h)

const allReceipts = [...spotifyRaw, ...householdRaw];

for (const r of allReceipts) {
  const date = r.ts.split('T')[0];
  if (!dayBuckets.has(date)) dayBuckets.set(date, []);
  dayBuckets.get(date)!.push(r);

  const bucket3h = Math.floor(new Date(r.ts).getTime() / (3 * 60 * 60 * 1000));
  if (!hourBuckets.has(bucket3h)) hourBuckets.set(bucket3h, []);
  hourBuckets.get(bucket3h)!.push(r);
}

// 3. Weighting Spotify
console.log('Calculating weights...');
for (const p of spotifyRaw) {
  let w = 0;
  const artist = p.subtitle!;
  const track = p.title;
  const date = p.ts.split('T')[0];
  const dObj = new Date(p.ts);
  const hour = dObj.getUTCHours();
  
  const aStat = artistPlays.get(artist)!;
  if (p.ts === aStat.first || p.ts === aStat.last) w += 1.0;

  const sameDay = dayBuckets.get(date)!;
  const sameDaySameTrack = sameDay.filter(r => r.title === track).length;
  if (sameDaySameTrack >= 5) w += 0.9;

  // 3h bucket collision check
  const bucket3h = Math.floor(dObj.getTime() / (3 * 60 * 60 * 1000));
  const nearby = [
    ...(hourBuckets.get(bucket3h - 1) || []),
    ...(hourBuckets.get(bucket3h) || []),
    ...(hourBuckets.get(bucket3h + 1) || []),
  ];
  if (nearby.some(r => r.source === 'household')) w += 0.8;

  // top track of day
  // (skipping exact daily top for perf, we approximate by high play count)
  if (sameDaySameTrack >= 3) w += 0.7;

  // late night
  if (hour >= 0 && hour < 4 && sameDay.length > 40) w += 0.6;

  // top 200 first play (rough approximation)
  if (top200Tracks.has(track) && sameDaySameTrack === 1) w += 0.5;

  const tStat = trackPlays.get(track)!;
  if (p.durationMs && p.durationMs > tStat.medianMs * 0.9) w += 0.3;

  p.weight = w;
}

// 4. Sampling
console.log('Sampling data...');
const sampledSpotify = [];
// Keep top ~500 per year
const byYear = new Map<string, Receipt[]>();
for (const p of spotifyRaw) {
  const y = p.ts.substring(0, 4);
  if (!byYear.has(y)) byYear.set(y, []);
  byYear.get(y)!.push(p);
}

for (const [y, receipts] of byYear.entries()) {
  receipts.sort((a, b) => b.weight - a.weight);
  sampledSpotify.push(...receipts.slice(0, 500));
}

const finalReceipts = [...sampledSpotify, ...householdRaw].sort((a, b) => a.ts.localeCompare(b.ts));

// 5. Generate outputs
ensureDir(OUT_DIR);
ensureDir(path.join(OUT_DIR, 'receipts'));

console.log(`Writing JSON files... Total sampled: ${finalReceipts.length}`);

// Chunk receipts by year
const finalByYear = new Map<string, Receipt[]>();
for (const r of finalReceipts) {
  const y = r.ts.substring(0, 4);
  if (!finalByYear.has(y)) finalByYear.set(y, []);
  finalByYear.get(y)!.push(r);
}

for (const [y, receipts] of finalByYear.entries()) {
  fs.writeFileSync(path.join(OUT_DIR, `receipts/${y}.json`), JSON.stringify(receipts));
}

// Manifest
const manifest: Manifest = {
  schemaVersion: '1.0',
  totalPlays: spotifyRaw.length,
  totalTransactions: householdRaw.length,
  dateBounds: {
    start: allReceipts[0].ts,
    end: allReceipts[allReceipts.length - 1].ts
  }
};
fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

// Daily Rollup (Uses ALL data)
const dailyRollup: Record<string, DailyRollup> = {};
for (const [date, receipts] of dayBuckets.entries()) {
  const r: DailyRollup = { date, plays: 0, minutes: 0, spend: 0, income: 0, types: [] };
  const typeSet = new Set<ReceiptType>();
  
  for (const item of receipts) {
    typeSet.add(item.type);
    if (item.source === 'spotify') {
      r.plays++;
      if (item.durationMs) r.minutes += item.durationMs / 60000;
    } else if (item.source === 'household') {
      if (item.type === 'income') r.income += item.amount || 0;
      else r.spend += item.amount || 0;
    }
  }
  r.types = Array.from(typeSet);
  dailyRollup[date] = r;
}
fs.writeFileSync(path.join(OUT_DIR, 'daily.json'), JSON.stringify(Object.values(dailyRollup)));

// Edges (Co-occurrence graph of sampled + household)
const edgesMap = new Map<string, number>();
for (const bucket of hourBuckets.values()) {
  // Only look at buckets that have multiple entities
  const relevant = bucket.filter(r => finalReceipts.includes(r));
  if (relevant.length < 2) continue;
  
  const ents = [...new Set(relevant.flatMap(r => r.entities))];
  for (let i=0; i<ents.length; i++) {
    for (let j=i+1; j<ents.length; j++) {
      const pair = [ents[i], ents[j]].sort().join('|');
      edgesMap.set(pair, (edgesMap.get(pair) || 0) + 1);
    }
  }
}
const edges = [...edgesMap.entries()].map(([k, v]) => {
  const [s, t] = k.split('|');
  return { source: s, target: t, weight: v };
});
fs.writeFileSync(path.join(OUT_DIR, 'edges.json'), JSON.stringify(edges));

console.log('Build complete.');
