'use client';

// ─── Types ───
export interface DailyPrayerLog {
  status: string;       // 'Prayed' | 'Missed' | 'Qaza' | 'None'
  isVoluntary: boolean;
}

export interface QazaEntry {
  count: number;
  totalCompleted: number;
}

export interface UserSettingsData {
  lat: string;
  lng: string;
  fiqh: string;
  locationName: string;
  locationSource: string;
  timingsCacheDate: string;
  timingsCacheData: string;
  hijriOffset?: number;
}

// ─── Constants ───
const DAILY_KEY = 'sajda_daily';
const QAZA_KEY = 'sajda_qaza';
const SETTINGS_KEY = 'sajda_settings';
const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

// ─── Helpers ───
function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  return fallback;
}

function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// ─── Daily Prayers ───

type DailyStore = Record<string, Record<string, DailyPrayerLog>>;

export function getAllDaily(): DailyStore {
  return readJSON<DailyStore>(DAILY_KEY, {});
}

export function getPrayersByDate(date: string): { prayer_name: string; status: string; is_voluntary: number }[] {
  const store = getAllDaily();
  const dayLogs = store[date] || {};
  return Object.entries(dayLogs).map(([prayer, log]) => ({
    prayer_name: prayer,
    status: log.status,
    is_voluntary: log.isVoluntary ? 1 : 0,
  }));
}

export function getPrayersByMonth(month: number, year: number): { date: string; prayer_name: string; status: string; is_voluntary: number }[] {
  const store = getAllDaily();
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  const results: { date: string; prayer_name: string; status: string; is_voluntary: number }[] = [];
  for (const [date, prayers] of Object.entries(store)) {
    if (date.startsWith(prefix)) {
      for (const [prayer, log] of Object.entries(prayers)) {
        results.push({
          date,
          prayer_name: prayer,
          status: log.status,
          is_voluntary: log.isVoluntary ? 1 : 0,
        });
      }
    }
  }
  return results;
}

export function upsertPrayer(date: string, prayerName: string, status: string, isVoluntary = false): void {
  const store = getAllDaily();
  if (!store[date]) store[date] = {};
  store[date][prayerName] = { status, isVoluntary };
  writeJSON(DAILY_KEY, store);
}

// ─── History ───
export function getHistory(from: string, to: string): Record<string, {
  prayed: number; missed: number; qaza: number; total: number;
  prayers: Record<string, string>;
}> {
  const store = getAllDaily();
  const result: Record<string, { prayed: number; missed: number; qaza: number; total: number; prayers: Record<string, string> }> = {};

  for (const [date, prayers] of Object.entries(store)) {
    if (date >= from && date <= to) {
      const entry = { prayed: 0, missed: 0, qaza: 0, total: 0, prayers: {} as Record<string, string> };
      for (const [prayer, log] of Object.entries(prayers)) {
        if (log.isVoluntary) continue;
        entry.total++;
        entry.prayers[prayer] = log.status;
        if (log.status === 'Prayed') entry.prayed++;
        else if (log.status === 'Missed') entry.missed++;
        else if (log.status === 'Qaza') entry.qaza++;
      }
      result[date] = entry;
    }
  }
  return result;
}

// ─── Streak ───
export function calculateStreak(): number {
  const store = getAllDaily();
  const todayStr = getLocalYYYYMMDD();
  let streak = 0;
  let currentDate = todayStr;

  while (true) {
    const isToday = currentDate === todayStr;
    const dayLogs = store[currentDate] || {};
    let completedCount = 0;
    let hasMissed = false;

    for (const prayer of PRAYERS) {
      const log = dayLogs[prayer];
      const status = log ? log.status : 'None';
      if (log?.isVoluntary) continue;
      if (status === 'Prayed' || status === 'Qaza') completedCount++;
      else if (status === 'Missed') hasMissed = true;
    }

    if (completedCount === 5) {
      streak++;
      currentDate = getPrevDate(currentDate);
      continue;
    }

    if (isToday) {
      if (hasMissed) { streak = 0; break; }
      else { currentDate = getPrevDate(currentDate); continue; }
    } else {
      break;
    }
  }

  return streak;
}

function getPrevDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function getLocalYYYYMMDD(d?: Date): string {
  const date = d || new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// ─── Qaza ───

type QazaStore = Record<string, QazaEntry>;

export function getQaza(): { prayer_name: string; count: number; total_completed: number }[] {
  const store = readJSON<QazaStore>(QAZA_KEY, {});
  return PRAYERS.map(p => ({
    prayer_name: p,
    count: store[p]?.count || 0,
    total_completed: store[p]?.totalCompleted || 0,
  }));
}

export function qazaAction(action: string, prayerName: string, amount: number): void {
  const store = readJSON<QazaStore>(QAZA_KEY, {});
  if (!store[prayerName]) store[prayerName] = { count: 0, totalCompleted: 0 };

  if (action === 'set') {
    store[prayerName].count = amount;
  } else if (action === 'add') {
    store[prayerName].count += amount;
  } else if (action === 'subtract') {
    const actual = Math.min(store[prayerName].count, amount);
    store[prayerName].count = Math.max(0, store[prayerName].count - amount);
    store[prayerName].totalCompleted += actual;
  } else if (action === 'decrement') {
    if (store[prayerName].count > 0) {
      store[prayerName].count--;
      store[prayerName].totalCompleted++;
    }
  }
  writeJSON(QAZA_KEY, store);
}

// ─── Settings ───
export function getSettings(): Partial<UserSettingsData> {
  return readJSON<Partial<UserSettingsData>>(SETTINGS_KEY, {});
}

export function saveSettings(data: Partial<UserSettingsData>): void {
  const existing = getSettings();
  writeJSON(SETTINGS_KEY, { ...existing, ...data });
}

// ─── Prayer Timings (Aladhan API – called from client) ───
export async function fetchPrayerTimings(lat: string, lng: string, fiqh: string): Promise<{
  timings: Record<string, string>;
  date?: { hijri: { day: string; month: { en: string }; year: string } };
} | null> {
  const settings = getSettings();
  const today = getLocalYYYYMMDD();

  // Return cache if from today
  if (settings.timingsCacheDate === today && settings.timingsCacheData) {
    try { return JSON.parse(settings.timingsCacheData); } catch {}
  }

  const timestamp = Math.floor(new Date(today + 'T00:00:00').getTime() / 1000);
  const apiUrl = `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lng}&school=${fiqh}&method=1`;

  try {
    const res = await fetch(apiUrl, { headers: { 'User-Agent': 'SajdaPrayerTracker/2.0' } });
    if (!res.ok) return null;
    const decoded = await res.json();
    if (!decoded.data) return null;

    // Cache
    saveSettings({ timingsCacheDate: today, timingsCacheData: JSON.stringify(decoded.data) });
    return decoded.data;
  } catch {
    return null;
  }
}

// ─── Export CSV ───
export function exportCSV(): string {
  const daily = getAllDaily();
  const qazaStore = readJSON<QazaStore>(QAZA_KEY, {});

  const lines: string[] = [];
  lines.push('Type,Date/Prayer,Name,Status/Count,Is Voluntary/Total Completed,Timestamp/NULL');

  // Daily entries
  for (const [date, prayers] of Object.entries(daily)) {
    for (const [prayer, log] of Object.entries(prayers)) {
      lines.push([
        'Daily', date, prayer, log.status, log.isVoluntary ? '1' : '0', '',
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    }
  }

  // Qaza entries
  for (const [prayer, entry] of Object.entries(qazaStore)) {
    lines.push([
      'Qaza', '', prayer, String(entry.count || 0), String(entry.totalCompleted || 0), '',
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
  }

  return lines.join('\n');
}

export function downloadCSV(): void {
  const csv = exportCSV();
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'prayer_tracker_backup.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Import CSV ───
export function importCSV(csvText: string): number {
  const lines = csvText.split(/\r?\n/);
  if (lines.length < 1) return 0;

  const header = parseCSVLine(lines[0]);
  if (header[0] !== 'Type' || header[1] !== 'Date/Prayer') return -1; // Invalid format

  let count = 0;
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const row = parseCSVLine(line);
    if (row.length < 5) continue;

    const type = row[0];
    if (type === 'Daily') {
      const date = row[1], name = row[2], status = row[3], isVol = row[4] === '1';
      if (date && name && status) {
        upsertPrayer(date, name, status, isVol);
        count++;
      }
    } else if (type === 'Qaza') {
      const name = row[2], countVal = parseInt(row[3]) || 0, completed = parseInt(row[4]) || 0;
      if (name) {
        const store = readJSON<QazaStore>(QAZA_KEY, {});
        store[name] = { count: countVal, totalCompleted: completed };
        writeJSON(QAZA_KEY, store);
        count++;
      }
    }
  }
  return count;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && i + 1 < line.length && line[i + 1] === '"') { current += '"'; i++; }
      else if (char === '"') { inQuotes = false; }
      else { current += char; }
    } else {
      if (char === '"') { inQuotes = true; }
      else if (char === ',') { result.push(current); current = ''; }
      else { current += char; }
    }
  }
  result.push(current);
  return result;
}

// ─── Reset ───
export function resetAll(): void {
  localStorage.removeItem(DAILY_KEY);
  localStorage.removeItem(QAZA_KEY);
  localStorage.removeItem(SETTINGS_KEY);
}

// ─── Full data snapshot (for Google Drive sync) ───
export function getFullSnapshot(): { daily: DailyStore; qaza: QazaStore; settings: Partial<UserSettingsData> } {
  return {
    daily: getAllDaily(),
    qaza: readJSON<QazaStore>(QAZA_KEY, {}),
    settings: getSettings(),
  };
}

export function mergeSnapshot(remote: { daily?: DailyStore; qaza?: QazaStore; settings?: Partial<UserSettingsData> }): void {
  // Merge daily: remote entries win only if local doesn't have that date+prayer
  if (remote.daily) {
    const local = getAllDaily();
    for (const [date, prayers] of Object.entries(remote.daily)) {
      if (!local[date]) local[date] = {};
      for (const [prayer, log] of Object.entries(prayers)) {
        // If local doesn't have this entry, use remote
        if (!local[date][prayer]) {
          local[date][prayer] = log;
        }
        // If both exist, local wins (user's device is source of truth)
      }
    }
    writeJSON(DAILY_KEY, local);
  }

  // Merge qaza: take the higher count / higher totalCompleted
  if (remote.qaza) {
    const local = readJSON<QazaStore>(QAZA_KEY, {});
    for (const [prayer, entry] of Object.entries(remote.qaza)) {
      if (!local[prayer]) {
        local[prayer] = entry;
      } else {
        local[prayer].count = Math.max(local[prayer].count, entry.count);
        local[prayer].totalCompleted = Math.max(local[prayer].totalCompleted, entry.totalCompleted);
      }
    }
    writeJSON(QAZA_KEY, local);
  }

  // Merge settings: local wins
  if (remote.settings) {
    const local = getSettings();
    const merged = { ...remote.settings, ...local };
    writeJSON(SETTINGS_KEY, merged);
  }
}
