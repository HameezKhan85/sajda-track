import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function getSetting(key: string): Promise<string | null> {
  const rows = await db.select({ value: userSettings.settingValue })
    .from(userSettings)
    .where(eq(userSettings.settingKey, key));
  return rows.length > 0 ? rows[0].value : null;
}

async function setSetting(key: string, value: string): Promise<void> {
  await db.insert(userSettings)
    .values({ settingKey: key, settingValue: value, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: userSettings.settingKey,
      set: { settingValue: value, updatedAt: new Date() },
    });
}

// GET: return all settings
export async function GET() {
  try {
    const keys = ['lat', 'lng', 'fiqh', 'locationName', 'locationSource', 'timings_cache_date', 'timings_cache_data'];
    const out: Record<string, string> = {};
    for (const k of keys) {
      const v = await getSetting(k);
      if (v !== null) out[k] = v;
    }
    return NextResponse.json({ success: true, data: out });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ success: false, message });
  }
}

// POST: save settings or fetch prayer timings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action || '';

    // Save settings
    if (action === 'save') {
      const allowed = ['lat', 'lng', 'fiqh', 'locationName', 'locationSource'];
      for (const k of allowed) {
        if (body[k] !== undefined && body[k] !== '') {
          await setSetting(k, String(body[k]));
        }
      }
      // Invalidate cache
      await setSetting('timings_cache_date', '');
      return NextResponse.json({ success: true });
    }

    // Fetch prayer timings (proxy to Aladhan API)
    if (action === 'fetch_timings') {
      const today = new Date().toISOString().split('T')[0];
      const cacheDate = await getSetting('timings_cache_date');
      const cacheData = await getSetting('timings_cache_data');

      // Return cached if from today
      if (cacheDate === today && cacheData) {
        return NextResponse.json({ success: true, data: JSON.parse(cacheData), source: 'cache' });
      }

      const lat = await getSetting('lat');
      const lng = await getSetting('lng');
      const fiqh = (await getSetting('fiqh')) || '0';

      if (!lat || !lng) {
        return NextResponse.json({ success: false, message: 'Location not configured.' });
      }

      const timestamp = Math.floor(new Date(today).getTime() / 1000);
      const apiUrl = `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lng}&school=${fiqh}&method=1`;

      const res = await fetch(apiUrl, {
        headers: { 'User-Agent': 'SajdaPrayerTracker/2.0' },
      });

      if (!res.ok) {
        return NextResponse.json({ success: false, message: `API error: ${res.status}` });
      }

      const decoded = await res.json();
      if (!decoded.data) {
        return NextResponse.json({ success: false, message: 'Invalid response from Aladhan API.' });
      }

      // Cache
      await setSetting('timings_cache_date', today);
      await setSetting('timings_cache_data', JSON.stringify(decoded.data));

      return NextResponse.json({ success: true, data: decoded.data, source: 'api' });
    }

    return NextResponse.json({ success: false, message: 'Unknown action.' });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ success: false, message });
  }
}
