import { NextResponse } from 'next/server';
import { db } from '@/db';
import { prayersDaily } from '@/db/schema';
import { eq, sql, desc } from 'drizzle-orm';

export async function GET() {
  try {
    // Get all obligatory prayer logs ordered by date desc
    const logs = await db.select({
      date: prayersDaily.date,
      prayerName: prayersDaily.prayerName,
      status: prayersDaily.status,
    })
      .from(prayersDaily)
      .where(eq(prayersDaily.isVoluntary, false))
      .orderBy(desc(prayersDaily.date));

    // Group by date
    const days: Record<string, Record<string, string>> = {};
    for (const log of logs) {
      if (!days[log.date]) {
        days[log.date] = { Fajr: 'None', Dhuhr: 'None', Asr: 'None', Maghrib: 'None', Isha: 'None' };
      }
      days[log.date][log.prayerName] = log.status || 'None';
    }

    let streak = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    let currentDate = todayStr;

    const obligatoryPrayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

    while (true) {
      const isToday = currentDate === todayStr;
      const dayLogs = days[currentDate] || {};
      let completedCount = 0;
      let hasMissed = false;

      for (const prayer of obligatoryPrayers) {
        const status = dayLogs[prayer] || 'None';
        if (status === 'Prayed' || status === 'Qaza') {
          completedCount++;
        } else if (status === 'Missed') {
          hasMissed = true;
        }
      }

      // All 5 completed -> +1 streak
      if (completedCount === 5) {
        streak++;
        currentDate = getPrevDate(currentDate);
        continue;
      }

      // Not all completed
      if (isToday) {
        if (hasMissed) {
          streak = 0;
          break;
        } else {
          // Day ongoing, check yesterday
          currentDate = getPrevDate(currentDate);
          continue;
        }
      } else {
        // Past day incomplete -> streak breaks
        break;
      }
    }

    return NextResponse.json({ success: true, streak });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ success: false, message });
  }
}

function getPrevDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}
