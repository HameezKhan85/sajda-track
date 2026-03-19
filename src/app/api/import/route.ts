import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { prayersDaily, qazaBacklog } from '@/db/schema';
import { sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('csv_file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: 'File upload error.' });
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'csv') {
      return NextResponse.json({ success: false, message: 'Invalid file format. Please upload a .csv file.' });
    }

    const text = await file.text();
    const lines = text.split(/\r?\n/);

    if (lines.length < 1) {
      return NextResponse.json({ success: false, message: 'File is empty.' });
    }

    // Parse header
    const header = parseCSVLine(lines[0]);
    if (header[0] !== 'Type' || header[1] !== 'Date/Prayer') {
      return NextResponse.json({ success: false, message: 'Unrecognized CSV format.' });
    }

    let count = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const row = parseCSVLine(line);
      if (row.length < 5) continue;

      const type = row[0];

      if (type === 'Daily') {
        const date = row[1];
        const name = row[2];
        const status = row[3];
        const isVoluntary = row[4] === '1';

        if (date && name && status) {
          await db.insert(prayersDaily)
            .values({
              date,
              prayerName: name,
              status,
              isVoluntary,
            })
            .onConflictDoUpdate({
              target: [prayersDaily.date, prayersDaily.prayerName],
              set: { status },
            });
          count++;
        }
      } else if (type === 'Qaza') {
        const name = row[2];
        const countVal = parseInt(row[3]) || 0;
        const completed = parseInt(row[4]) || 0;

        if (name) {
          await db.insert(qazaBacklog)
            .values({ prayerName: name, count: countVal, totalCompleted: completed })
            .onConflictDoUpdate({
              target: qazaBacklog.prayerName,
              set: { count: countVal, totalCompleted: completed },
            });
          count++;
        }
      }
    }

    return NextResponse.json({ success: true, count });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ success: false, message: 'Database import failed: ' + message });
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}
