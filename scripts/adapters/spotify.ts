import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import type { Receipt } from '../../src/types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function parseSpotify(csvPath: string): Receipt[] {
  const content = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(content, { columns: true, skip_empty_lines: true });

  return records.map((record: any) => {
    const ts = new Date(record.ts).toISOString();
    return {
      id: crypto.createHash('md5').update(`spotify-${record.spotify_track_uri}-${record.ts}`).digest('hex').substring(0, 12),
      type: 'music',
      ts,
      title: record.track_name,
      subtitle: record.artist_name,
      durationMs: parseInt(record.ms_played, 10),
      entities: [`artist:${record.artist_name}`],
      meta: {
        platform: record.platform,
        album: record.album_name,
        reason_start: record.reason_start,
        reason_end: record.reason_end,
        shuffle: record.shuffle === 'TRUE',
        skipped: record.skipped === 'TRUE',
        track_uri: record.spotify_track_uri
      },
      source: 'spotify',
      weight: 0, // Will be computed in build-data.ts
    } as Receipt;
  });
}
