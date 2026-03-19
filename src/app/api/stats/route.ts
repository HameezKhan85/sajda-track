import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { prayersDaily } from '@/db/schema';
import { sql, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'all';
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  try {
    let whereClause = sql`${prayersDaily.isVoluntary} = false`;

    if (period === 'week') {
      whereClause = and(whereClause, sql`${prayersDaily.date} >= CURRENT_DATE - INTERVAL '7 days'`)!;
    } else if (period === 'month') {
      whereClause = and(whereClause, sql`${prayersDaily.date} >= CURRENT_DATE - INTERVAL '1 month'`)!;
    } else if (period === 'custom' && from && to) {
      whereClause = and(whereClause, sql`${prayersDaily.date} BETWEEN ${from} AND ${to}`)!;
    }

    const result = await db.select({
      prayed: sql<number>`COALESCE(SUM(CASE WHEN ${prayersDaily.status} = 'Prayed' THEN 1 ELSE 0 END), 0)`,
      missed: sql<number>`COALESCE(SUM(CASE WHEN ${prayersDaily.status} = 'Missed' THEN 1 ELSE 0 END), 0)`,
      qaza: sql<number>`COALESCE(SUM(CASE WHEN ${prayersDaily.status} = 'Qaza' THEN 1 ELSE 0 END), 0)`,
    }).from(prayersDaily).where(whereClause);

    return NextResponse.json({ success: true, data: result[0] });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ success: false, message });
  }
}
