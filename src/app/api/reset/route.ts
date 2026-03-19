import { NextResponse } from 'next/server';
import { db } from '@/db';
import { prayersDaily, qazaBacklog, userSettings } from '@/db/schema';

export async function POST() {
  try {
    await db.delete(prayersDaily);
    await db.delete(qazaBacklog);
    await db.delete(userSettings);

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ success: false, message: 'Failed to wipe databases: ' + message });
  }
}
