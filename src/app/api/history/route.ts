import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { prayersDaily } from '@/db/schema';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from') || new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const to = searchParams.get('to') || new Date().toISOString().split('T')[0];

  try {
    const logs = await db.select({
      date: prayersDaily.date,
      prayerName: prayersDaily.prayerName,
      status: prayersDaily.status,
      isVoluntary: prayersDaily.isVoluntary,
    })
      .from(prayersDaily)
      .where(sql`${prayersDaily.date} BETWEEN ${from} AND ${to}`)
      .orderBy(prayersDaily.date);

    // Group by date
    const history: Record<string, {
      prayed: number;
      missed: number;
      qaza: number;
      total: number;
      prayers: Record<string, string>;
    }> = {};

    for (const log of logs) {
      if (log.isVoluntary) continue;
      const date = log.date;
      if (!history[date]) {
        history[date] = { prayed: 0, missed: 0, qaza: 0, total: 0, prayers: {} };
      }
      history[date].total++;
      history[date].prayers[log.prayerName] = log.status || 'None';
      if (log.status === 'Prayed') history[date].prayed++;
      if (log.status === 'Missed') history[date].missed++;
      if (log.status === 'Qaza') history[date].qaza++;
    }

    return NextResponse.json({ success: true, data: history });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
