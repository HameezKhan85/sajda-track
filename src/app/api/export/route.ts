import { NextResponse } from 'next/server';
import { db } from '@/db';
import { prayersDaily, qazaBacklog } from '@/db/schema';

export async function GET() {
  try {
    const dailyRows = await db.select().from(prayersDaily);
    const qazaRows = await db.select().from(qazaBacklog);

    // Build CSV content
    const lines: string[] = [];
    lines.push('Type,Date/Prayer,Name,Status/Count,Is Voluntary/Total Completed,Timestamp/NULL');

    for (const row of dailyRows) {
      lines.push([
        'Daily',
        row.date,
        row.prayerName,
        row.status || 'None',
        row.isVoluntary ? '1' : '0',
        row.createdAt ? row.createdAt.toISOString() : '',
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    }

    for (const row of qazaRows) {
      lines.push([
        'Qaza',
        '',
        row.prayerName,
        String(row.count || 0),
        String(row.totalCompleted || 0),
        '',
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    }

    const csv = lines.join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="prayer_tracker_backup.csv"',
      },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
