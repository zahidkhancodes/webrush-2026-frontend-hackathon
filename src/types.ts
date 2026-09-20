export type ReceiptType =
  | 'music' | 'purchase' | 'movie' | 'place'
  | 'event' | 'note' | 'subscription' | 'income' | 'health';

export interface Receipt {
  id: string;          // stable hash
  type: ReceiptType;
  ts: string;          // ISO 8601
  title: string;       // "Ode To The Mets" | "Idli medu vada"
  subtitle?: string;   // "The Strokes" | "Food · snacks"
  amount?: number;     // INR
  durationMs?: number;
  entities: string[];  // entity ids this receipt touches
  meta: Record<string, string | number | boolean>;
  source: 'spotify' | 'household' | 'transact';
  weight: number;      // 0–1 salience, used for sampling
}

export interface Manifest {
  schemaVersion: string;
  totalPlays: number;
  totalTransactions: number;
  dateBounds: {
    start: string;
    end: string;
  };
}

export interface DailyRollup {
  date: string; // YYYY-MM-DD
  plays: number;
  minutes: number;
  spend: number;
  income: number;
  types: ReceiptType[];
}

export interface Entity {
  id: string;
  type: 'artist' | 'merchant' | 'category' | 'place';
  label: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
}

export interface Edge {
  source: string; // Entity ID
  target: string; // Entity ID
  weight: number;
}
