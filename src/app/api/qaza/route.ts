import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { qazaBacklog } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

// GET: return all qaza backlog
export async function GET() {
  try {
    const data = await db.select().from(qazaBacklog);
    const mapped = data.map(r => ({
      prayer_name: r.prayerName,
      count: r.count,
      total_completed: r.totalCompleted,
    }));
    return NextResponse.json({ success: true, data: mapped });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ success: false, message });
  }
}

// POST: handle qaza actions (get, set, add, subtract, decrement)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, prayer_name, amount: rawAmount } = body;
    const amount = parseInt(rawAmount) || 1;

    if (!action) {
      return NextResponse.json({ success: false, message: 'Action required' });
    }

    if (action === 'get') {
      const data = await db.select().from(qazaBacklog);
      const mapped = data.map(r => ({
        prayer_name: r.prayerName,
        count: r.count,
        total_completed: r.totalCompleted,
      }));
      return NextResponse.json({ success: true, data: mapped });
    }

    if (action === 'set' && prayer_name) {
      await db.insert(qazaBacklog)
        .values({ prayerName: prayer_name, count: amount, totalCompleted: 0 })
        .onConflictDoUpdate({
          target: qazaBacklog.prayerName,
          set: { count: amount },
        });
      return NextResponse.json({ success: true });
    }

    if (action === 'add' && prayer_name) {
      await db.insert(qazaBacklog)
        .values({ prayerName: prayer_name, count: amount, totalCompleted: 0 })
        .onConflictDoUpdate({
          target: qazaBacklog.prayerName,
          set: { count: sql`${qazaBacklog.count} + ${amount}` },
        });
      return NextResponse.json({ success: true });
    }

    if (action === 'subtract' && prayer_name) {
      // Get current count
      const rows = await db.select({ count: qazaBacklog.count })
        .from(qazaBacklog)
        .where(eq(qazaBacklog.prayerName, prayer_name));

      const current = rows.length > 0 ? (rows[0].count || 0) : 0;
      const actualSubtracted = Math.min(current, amount);

      await db.update(qazaBacklog)
        .set({
          count: sql`GREATEST(0, ${qazaBacklog.count} - ${amount})`,
          totalCompleted: sql`${qazaBacklog.totalCompleted} + ${actualSubtracted}`,
        })
        .where(eq(qazaBacklog.prayerName, prayer_name));

      return NextResponse.json({ success: true });
    }

    if (action === 'decrement' && prayer_name) {
      await db.update(qazaBacklog)
        .set({
          count: sql`GREATEST(0, ${qazaBacklog.count} - 1)`,
          totalCompleted: sql`${qazaBacklog.totalCompleted} + 1`,
        })
        .where(eq(qazaBacklog.prayerName, prayer_name));

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, message: 'Invalid action or missing parameters' });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
