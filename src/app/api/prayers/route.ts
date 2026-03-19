import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { prayersDaily } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

// GET: retrieve prayers by date or by month+year
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const month = searchParams.get('month');
  const year = searchParams.get('year');

  try {
    let results;
    if (month && year) {
      results = await db.select().from(prayersDaily)
        .where(and(
          sql`EXTRACT(MONTH FROM ${prayersDaily.date}) = ${parseInt(month)}`,
          sql`EXTRACT(YEAR FROM ${prayersDaily.date}) = ${parseInt(year)}`
        ));
    } else {
      const targetDate = date || new Date().toISOString().split('T')[0];
      results = await db.select().from(prayersDaily)
        .where(eq(prayersDaily.date, targetDate));
    }

    // Map column names to match frontend expectations
    const data = results.map(r => ({
      id: r.id,
      date: r.date,
      prayer_name: r.prayerName,
      status: r.status,
      is_voluntary: r.isVoluntary ? 1 : 0,
      created_at: r.createdAt,
    }));

    return NextResponse.json({ success: true, data });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ success: false, message });
  }
}

// POST: upsert a prayer log
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, prayer_name, status, is_voluntary } = body;

    if (!date || !prayer_name || !status) {
      return NextResponse.json({ success: false, message: 'Invalid input' });
    }

    const isVol = is_voluntary ? true : false;

    await db.insert(prayersDaily)
      .values({
        date,
        prayerName: prayer_name,
        status,
        isVoluntary: isVol,
      })
      .onConflictDoUpdate({
        target: [prayersDaily.date, prayersDaily.prayerName],
        set: { status },
      });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ success: false, message });
  }
}
