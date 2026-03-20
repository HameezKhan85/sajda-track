// Date and prayer utility functions

export function getLocalYYYYMMDD(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function getPrayerTime12h(raw: string | undefined): string {
  if (!raw) return '--:--';
  const [hStr, mStr] = raw.split(':');
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${mStr} ${ampm}`;
}

export function getIconForPrayer(prayer: string): string {
  const icons: Record<string, string> = {
    Fajr: 'sunrise',
    Dhuhr: 'sun',
    Asr: 'cloud-sun',
    Maghrib: 'sunset',
    Isha: 'moon',
    Tahajjud: 'star',
    Ishraq: 'sun-dim',
    Taraweeh: 'book-open',
  };
  return icons[prayer] || 'clock';
}

export function getHijriMonthName(calendarDate: Date): string {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();

  const d1 = new Date(year, month, 1);
  d1.setDate(d1.getDate() - 1);
  const d2 = new Date(year, month, lastDay);
  d2.setDate(d2.getDate() - 1);

  const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
    month: 'long',
    year: 'numeric',
  });
  const monthOnlyFormatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
    month: 'long',
  });

  const startStr = formatter.format(d1);
  const endStr = formatter.format(d2);

  if (startStr === endStr) return startStr;
  return monthOnlyFormatter.format(d1) + ' - ' + endStr;
}

export function getHijriDay(year: number, month: number, day: number, offsetDays: number = 0): string {
  const d = new Date(year, month, day - 1);
  d.setDate(d.getDate() + offsetDays);
  return new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', { day: 'numeric' }).format(d);
}

export function getHijriMonth(year: number, month: number, day: number, offsetDays: number = 0): string {
  const d = new Date(year, month, day - 1);
  d.setDate(d.getDate() + offsetDays);
  return new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', { month: 'long' }).format(d);
}

export function getCurrentHijriDateStr(offsetDays: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const parts = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
    day: 'numeric', month: 'long', year: 'numeric'
  }).formatToParts(d);
  const day = parts.find(p => p.type === 'day')?.value || '';
  const month = parts.find(p => p.type === 'month')?.value || '';
  const year = parts.find(p => p.type === 'year')?.value || '';
  return `${day} ${month} ${year}`;
}

export function getDefaultHijriOffset(): number {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const minusOneZones = [
      'Asia/Karachi', 'Asia/Kolkata', 'Asia/Dhaka', 'Asia/Colombo', 
      'Asia/Kabul', 'Asia/Kathmandu', 'Indian/Maldives'
    ];
    if (minusOneZones.includes(tz)) return -1;
  } catch {}
  return 0;
}

export const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;
export const VOLUNTARY = ['Tahajjud', 'Ishraq', 'Taraweeh'] as const;
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
  { id: 'calendar', label: 'Calendar', icon: 'calendar-days' },
  { id: 'qaza', label: 'Qaza Tracking', icon: 'layers' },
] as const;

export type PrayerStatus = 'Prayed' | 'Missed' | 'Qaza' | 'None';

export interface DayData {
  dayNum: number | string;
  hijriDayNum?: string;
  hijriMonthStr?: string;
  dateStr: string;
  isToday: boolean;
  isFuture: boolean;
  isPadding?: boolean;
  logs: { prayer: string; status: string }[];
  prayerStatuses: string[];
  prayedCount: number;
  missedCount: number;
  qazaCount: number;
  hasVoluntary?: boolean;
  voluntaryCount?: number;
  label?: string;
}

export interface QazaItem {
  prayer_name: string;
  count: number;
  total_completed: number;
  manualInput: string;
}

export interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

export interface AlertModalState {
  open: boolean;
  title: string;
  message: string;
  type: 'success' | 'error';
}
