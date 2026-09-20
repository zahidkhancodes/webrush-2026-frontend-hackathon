import { parse } from 'csv-parse/sync';
import fs from 'fs';
import crypto from 'crypto';
import type { Receipt, ReceiptType } from '../../src/types';

// Date,Mode,Category,Subcategory,Note,Amount,Income/Expense,Currency
// 20/09/2018 12:04:08,Cash,Transportation,Train,2 Place 5 to Place 0,30,Expense,INR

export function parseHousehold(csvPath: string): Receipt[] {
  const content = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(content, { columns: true, skip_empty_lines: true });

  return records.map((record: any, index: number) => {
    // Parse Date: "DD/MM/YYYY HH:mm:ss" -> ISO 8601
    const [datePart, timePart] = record.Date.split(' ');
    const [dd, mm, yyyy] = datePart.split('/');
    // Assume local time, or treat as UTC for simplicity. Let's treat as UTC to avoid local timezone quirks in Node
    const ts = `${yyyy}-${mm}-${dd}T${timePart}Z`;
    
    let type: ReceiptType = 'purchase';
    if (record['Income/Expense'] === 'Income') type = 'income';
    else if (record.Category === 'Transportation') type = 'place';
    else if (record.Category === 'Entertainment') type = 'movie';
    else if (record.Category === 'Subscriptions') type = 'subscription';

    return {
      id: crypto.createHash('md5').update(`house-${record.Date}-${index}`).digest('hex').substring(0, 12),
      type,
      ts,
      title: record.Note || record.Subcategory || record.Category,
      subtitle: `${record.Category} · ${record.Subcategory}`,
      amount: parseFloat(record.Amount),
      entities: [
        `category:${record.Category}`, 
        ...(record.Subcategory ? [`subcategory:${record.Subcategory}`] : [])
      ],
      meta: {
        mode: record.Mode,
        note: record.Note
      },
      source: 'household',
      weight: 1.0, // Transactions are rare and valuable, always keep them
    } as Receipt;
  });
}
