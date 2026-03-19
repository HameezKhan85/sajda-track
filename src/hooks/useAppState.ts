'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getLocalYYYYMMDD,
  PRAYERS,
  VOLUNTARY,
  type DayData,
  type QazaItem,
  type ToastState,
  type AlertModalState,
} from '@/lib/utils';
import * as localDB from '@/lib/localDB';
import * as drive from '@/lib/googleDrive';

export function useAppState() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Time
  const [currentTime, setCurrentTime] = useState('');
  const [currentDateStr, setCurrentDateStr] = useState('');

  // Prayer data
  const [todayLogs, setTodayLogs] = useState<Record<string, string>>({});
  const [prayerTimes, setPrayerTimes] = useState<Record<string, string>>({});
  const [nextPrayer, setNextPrayer] = useState({ name: 'Fajr', time: '--:--', countdown: '...' });
  const [hijriDate, setHijriDate] = useState('-- ------- ----');
  const [currentStreak, setCurrentStreak] = useState(0);
  const [todayStats, setTodayStats] = useState({ prayed: 0, missed: 0 });
  const [monthStats, setMonthStats] = useState({ prayed: 0, missed: 0, qaza: 0 });
  const [statCards, setStatCards] = useState<Array<{
    title: string; value: string | number; icon: string;
    colorBg: string; colorText: string;
  }>>([]);

  // Calendar
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<DayData[]>([]);
  const [showHijri, setShowHijri] = useState(false);
  const [last7Days, setLast7Days] = useState<DayData[]>([]);

  // Qaza
  const [qazaData, setQazaData] = useState<QazaItem[]>([]);
  const [totalBacklog, setTotalBacklog] = useState(0);
  const [qazaCalc, setQazaCalc] = useState({ fromDate: '', toDate: '', prayer: 'All' });
  const [qazaModalOpen, setQazaModalOpen] = useState(false);

  // Settings
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [settingsConfigured, setSettingsConfigured] = useState(false);
  const [settingsLat, setSettingsLat] = useState('');
  const [settingsLng, setSettingsLng] = useState('');
  const [settingsFiqh, setSettingsFiqh] = useState('1');
  const [geoStatus, setGeoStatus] = useState<'idle' | 'detecting' | 'success' | 'error'>('idle');
  const [locationSource, setLocationSource] = useState('');
  const [detectedLocationName, setDetectedLocationName] = useState('');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDateLogs, setSelectedDateLogs] = useState<Record<string, string>>({});

  // Processing & alerts
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTitle, setProcessingTitle] = useState('Processing...');
  const [processingMessage, setProcessingMessage] = useState('Please wait...');
  const [alertModal, setAlertModal] = useState<AlertModalState>({
    open: false, title: '', message: '', type: 'success',
  });
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });

  // PWA
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  // Google Drive
  const [driveConnected, setDriveConnected] = useState(false);
  const [driveSyncing, setDriveSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Refs for prayer times to use in interval
  const prayerTimesRef = useRef(prayerTimes);
  prayerTimesRef.current = prayerTimes;

  const monthStatsRef = useRef(monthStats);
  monthStatsRef.current = monthStats;

  // ─── Time ───
  const updateTime = useCallback(() => {
    const d = new Date();
    setCurrentTime(d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setCurrentDateStr(d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }));
  }, []);

  // ─── Prayer times calculation ───
  const calculateNextPrayer = useCallback(() => {
    const now = new Date();
    const times = prayerTimesRef.current;
    let next = 'Fajr';
    let minDiff = Infinity;

    for (const p of PRAYERS) {
      const raw = times[p];
      if (!raw) continue;
      const [hh, mm] = raw.split(':').map(Number);
      const pDate = new Date(now);
      pDate.setHours(hh, mm, 0, 0);
      let diff = pDate.getTime() - now.getTime();
      if (diff < 0) diff += 86400000;
      if (diff < minDiff) { minDiff = diff; next = p; }
    }

    const totalMins = Math.round(minDiff / 60000);
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;

    const raw = times[next];
    let timeStr = '--:--';
    if (raw) {
      const [hStr, mStr] = raw.split(':');
      let h = parseInt(hStr, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      timeStr = `${String(h).padStart(2, '0')}:${mStr} ${ampm}`;
    }

    setNextPrayer({
      name: next,
      time: timeStr,
      countdown: Object.keys(times).length ? `${hours}h ${mins}m` : '...',
    });
  }, []);

  // ─── Check if prayer time is in the future ───
  const isPrayerFuture = useCallback((prayerName: string): boolean => {
    if (!prayerTimes || Object.keys(prayerTimes).length === 0) return false;
    const timeStr = prayerTimes[prayerName];
    if (!timeStr) return false;
    const [pHours, pMins] = timeStr.split(':').map(Number);
    const now = new Date();
    const pTime = new Date();
    pTime.setHours(pHours, pMins, 0, 0);
    pTime.setMinutes(pTime.getMinutes() - 5);
    return now < pTime;
  }, [prayerTimes]);

  // ─── Fetch functions (all from localStorage now) ───
  const fetchData = useCallback(() => {
    const today = getLocalYYYYMMDD();
    const data = localDB.getPrayersByDate(today);
    const logs: Record<string, string> = {};
    let prayed = 0, missed = 0;
    data.forEach(l => {
      logs[l.prayer_name] = l.status;
      if (l.status === 'Prayed' && l.is_voluntary === 0) prayed++;
      if (l.status === 'Missed' && l.is_voluntary === 0) missed++;
    });
    setTodayLogs(logs);
    setTodayStats({ prayed, missed });
  }, []);

  const fetchStreak = useCallback(() => {
    setCurrentStreak(localDB.calculateStreak());
  }, []);

  const fetchQaza = useCallback(() => {
    const data = localDB.getQaza();
    const qd = PRAYERS.map(p => {
      const found = data.find(x => x.prayer_name === p);
      return {
        prayer_name: p,
        count: found ? found.count : 0,
        total_completed: found ? found.total_completed : 0,
        manualInput: '',
      };
    });
    setQazaData(qd);
    const tb = qd.reduce((acc, curr) => acc + (curr.count || 0), 0);
    setTotalBacklog(tb);
    fetchStreak();
  }, [fetchStreak]);

  const fetchPrayerTimings = useCallback(async () => {
    const settings = localDB.getSettings();
    const lat = settings.lat;
    const lng = settings.lng;
    const fiqh = settings.fiqh || '1';

    if (!lat || !lng) return;

    const result = await localDB.fetchPrayerTimings(lat, lng, fiqh);
    if (!result) return;

    const timings = result.timings;
    const newTimes = {
      Fajr: timings.Fajr,
      Dhuhr: timings.Dhuhr,
      Asr: timings.Asr,
      Maghrib: timings.Maghrib,
      Isha: timings.Isha,
    };
    setPrayerTimes(newTimes);
    prayerTimesRef.current = newTimes;

    const h = result.date?.hijri;
    if (h) setHijriDate(`${h.day} ${h.month.en} ${h.year}`);

    setTimeout(() => calculateNextPrayer(), 0);
  }, [calculateNextPrayer]);

  const loadSettings = useCallback(async () => {
    const s = localDB.getSettings();
    if (s.lat && s.lng) {
      setSettingsLat(s.lat);
      setSettingsLng(s.lng);
      setSettingsFiqh(s.fiqh ?? '1');
      setSettingsConfigured(true);
      setGeoStatus('success');
      setDetectedLocationName(s.locationName || '');
      setLocationSource(s.locationSource || '');
      await fetchPrayerTimings();
      return;
    }
    setSettingsModalOpen(true);
  }, [fetchPrayerTimings]);

  // ─── Generate calendar data ───
  const generateCalendar = useCallback((dateArg?: Date) => {
    const d = dateArg || calendarDate;
    const year = d.getFullYear();
    const month = d.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthLogData = localDB.getPrayersByMonth(month + 1, year);
    const monthLogs: Record<string, { prayer: string; status: string }[]> = {};
    const ms = { prayed: 0, missed: 0, qaza: 0 };

    monthLogData.forEach(l => {
      if (l.is_voluntary === 0) {
        if (!monthLogs[l.date]) monthLogs[l.date] = [];
        monthLogs[l.date].push({ prayer: l.prayer_name, status: l.status });
        if (l.status === 'Prayed') ms.prayed++;
        else if (l.status === 'Missed') ms.missed++;
        else if (l.status === 'Qaza') ms.qaza++;
      }
    });

    setMonthStats(ms);
    monthStatsRef.current = ms;

    const days: DayData[] = [];
    const todayStr = getLocalYYYYMMDD();

    for (let i = 0; i < firstDay; i++) {
      days.push({ dayNum: '', isPadding: true, dateStr: `pad-${i}`, isToday: false, isFuture: false, logs: [], prayerStatuses: [], prayedCount: 0, missedCount: 0, qazaCount: 0 });
    }

    const prayerOrder = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isFuture = dateStr > todayStr;
      const dayLogs = monthLogs[dateStr] || [];
      const prayerStatuses = prayerOrder.map(p => {
        const found = dayLogs.find(l => l.prayer === p);
        return found ? found.status : 'None';
      });

      let hijriDayNum: string | undefined;
      let hijriMonthStr: string | undefined;
      try {
        hijriDayNum = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', { day: 'numeric' }).format(new Date(year, month, i - 1));
        hijriMonthStr = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', { month: 'long' }).format(new Date(year, month, i - 1));
      } catch {}

      days.push({
        dayNum: i,
        hijriDayNum,
        hijriMonthStr,
        dateStr,
        isToday: dateStr === todayStr,
        isFuture,
        logs: dayLogs,
        prayerStatuses,
        prayedCount: dayLogs.filter(l => l.status === 'Prayed').length,
        missedCount: dayLogs.filter(l => l.status === 'Missed').length,
        qazaCount: dayLogs.filter(l => l.status === 'Qaza').length,
      });
    }

    setCalendarDays(days);
  }, [calendarDate]);

  // ─── Generate last 7 days ───
  const generateLast7Days = useCallback(() => {
    const today = new Date();
    const to = getLocalYYYYMMDD(today);
    const fromDate = new Date();
    fromDate.setDate(today.getDate() - 6);
    const from = getLocalYYYYMMDD(fromDate);

    const historyData = localDB.getHistory(from, to);

    const days: DayData[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = getLocalYYYYMMDD(d);
      const dayStats = historyData[dateStr] || { prayed: 0, missed: 0, qaza: 0, prayers: {} };
      const prayerOrder = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      const prayerStatuses = prayerOrder.map(p => dayStats.prayers?.[p] || 'None');

      days.push({
        dayNum: d.getDate(),
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        prayedCount: dayStats.prayed || 0,
        missedCount: dayStats.missed || 0,
        qazaCount: dayStats.qaza || 0,
        prayerStatuses,
        dateStr,
        isToday: d.toDateString() === today.toDateString(),
        isFuture: false,
        logs: [],
      });
    }
    setLast7Days(days);
  }, []);

  // ─── Update stat cards ───
  const updateStatCards = useCallback((ts: { prayed: number; missed: number }, tb: number) => {
    const adherence = Math.round((ts.prayed / 5) * 100) || 0;
    setStatCards([
      { title: 'Prayed Today', value: ts.prayed + '/5', icon: 'check-circle-2', colorBg: 'bg-emerald-100 dark:bg-emerald-900/40', colorText: 'text-emerald-600 dark:text-emerald-400' },
      { title: 'Missed Today', value: ts.missed, icon: 'x-circle', colorBg: 'bg-red-100 dark:bg-red-900/40', colorText: 'text-red-600 dark:text-red-400' },
      { title: 'Pending Qaza', value: tb, icon: 'layers', colorBg: 'bg-amber-100 dark:bg-amber-900/40', colorText: 'text-amber-600 dark:text-amber-400' },
      { title: 'Adherence', value: adherence + '%', icon: 'activity', colorBg: 'bg-blue-100 dark:bg-blue-900/40', colorText: 'text-blue-600 dark:text-blue-400' },
    ]);
  }, []);

  useEffect(() => {
    updateStatCards(todayStats, totalBacklog);
  }, [todayStats, totalBacklog, updateStatCards]);

  // ─── Actions ───
  const updateStatus = useCallback((prayer: string, status: string, isVoluntary = 0) => {
    const date = getLocalYYYYMMDD();
    setTodayLogs(prev => ({ ...prev, [prayer]: status }));
    localDB.upsertPrayer(date, prayer, status, !!isVoluntary);
    fetchData();
    generateLast7Days();
    generateCalendar();
    fetchStreak();
  }, [fetchData, generateLast7Days, generateCalendar, fetchStreak]);

  const updateStatusDate = useCallback((date: string, prayer: string, status: string, isVoluntary = 0) => {
    const today = getLocalYYYYMMDD();
    if (date === today) {
      setTodayLogs(prev => ({ ...prev, [prayer]: status }));
    }
    if (date === selectedDate) {
      setSelectedDateLogs(prev => ({ ...prev, [prayer]: status }));
    }
    localDB.upsertPrayer(date, prayer, status, !!isVoluntary);
    generateLast7Days();
    if (date === today) fetchData();
    generateCalendar();
    fetchStreak();
  }, [selectedDate, fetchData, generateLast7Days, generateCalendar, fetchStreak]);

  const performQazaAction = useCallback((action: string, prayer: string, amount: number) => {
    if (!amount || amount <= 0) return;
    localDB.qazaAction(action, prayer, amount);

    if (action === 'subtract') {
      setMonthStats(prev => ({ ...prev, qaza: (prev.qaza || 0) + amount }));
    } else if (action === 'add') {
      setMonthStats(prev => ({ ...prev, qaza: Math.max(0, (prev.qaza || 0) - amount) }));
    }

    fetchQaza();
    showToast(`Successfully ${action === 'add' ? 'added' : 'subtracted'} ${amount} ${prayer}.`);
  }, [fetchQaza]);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3500);
  }, []);

  const calculateAndAddQaza = useCallback(() => {
    const { fromDate, toDate, prayer: target } = qazaCalc;
    if (!fromDate || !toDate) {
      showToast('Please select both from and to dates.', 'error');
      return;
    }
    const d1 = new Date(fromDate);
    const d2 = new Date(toDate);
    if (d2 < d1) {
      showToast('To Date must be at or after From Date.', 'error');
      return;
    }
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (d2 > today) {
      showToast('You cannot calculate Qaza for future dates.', 'error');
      return;
    }
    const diffDays = Math.ceil(Math.abs(d2.getTime() - d1.getTime()) / 86400000) + 1;
    if (diffDays > 0) {
      const toUpdate = target === 'All'
        ? PRAYERS.map(p => ({ prayer: p, amount: diffDays }))
        : [{ prayer: target, amount: diffDays }];

      for (const req of toUpdate) {
        localDB.qazaAction('add', req.prayer, req.amount);
      }
      setQazaCalc({ fromDate: '', toDate: '', prayer: 'All' });
      fetchQaza();
      showToast('Successfully computed and added missed prayers.', 'success');
    }
  }, [qazaCalc, fetchQaza, showToast]);

  const calculateEstimateDate = useCallback((): string => {
    if (totalBacklog <= 0 || !monthStats.qaza || monthStats.qaza <= 0) return 'N/A';
    const qazaPerDay = monthStats.qaza / 30;
    const daysRemaining = Math.ceil(totalBacklog / qazaPerDay);
    if (daysRemaining > 365 * 50) return '50+ Years';
    const estimated = new Date();
    estimated.setDate(estimated.getDate() + daysRemaining);
    return estimated.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }, [totalBacklog, monthStats.qaza]);

  const getTotalQazaCompleted = useCallback((): number => {
    return qazaData.reduce((acc, curr) => acc + (curr.total_completed || 0), 0);
  }, [qazaData]);

  const getMostCompletedQaza = useCallback((): string => {
    if (!qazaData.length) return 'None';
    let max = 0, most = 'None';
    qazaData.forEach(q => {
      if ((q.total_completed || 0) > max) { max = q.total_completed || 0; most = q.prayer_name; }
    });
    return max === 0 ? 'None' : most;
  }, [qazaData]);

  // ─── Settings actions ───
  const detectLocation = useCallback(() => {
    setGeoStatus('detecting');
    setLocationSource('');
    setDetectedLocationName('');

    const geoFallback = async () => {
      try {
        const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
        const data = await res.json();
        if (data.latitude && data.longitude) {
          setSettingsLat(String(data.latitude));
          setSettingsLng(String(data.longitude));
          const city = data.city || '';
          const country = data.country || '';
          if (city && country) setDetectedLocationName(`${city}, ${country}`);
          setLocationSource('ip');
          setGeoStatus('success');
          return;
        }
      } catch (e) {
        console.warn('GeoJS failed, trying ipwho.is...', e);
      }

      try {
        const res = await fetch('https://ipwho.is/');
        const data = await res.json();
        if (data.success && data.latitude && data.longitude) {
          setSettingsLat(String(data.latitude));
          setSettingsLng(String(data.longitude));
          const city = data.city || '';
          const country = data.country || '';
          if (city && country) setDetectedLocationName(`${city}, ${country}`);
          setLocationSource('ip');
          setGeoStatus('success');
          return;
        }
      } catch (e) {
        console.warn('IPWho failed, no fallbacks left.', e);
      }

      setGeoStatus('error');
    };

    if (!navigator.geolocation) {
      geoFallback();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setSettingsLat(String(lat));
        setSettingsLng(String(lng));
        setLocationSource('browser');

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=10`);
          const data = await res.json();
          if (data.address) {
            const city = data.address.city || data.address.town || data.address.municipality || data.address.county || data.name || '';
            const country = data.address.country || '';
            if (city && country) setDetectedLocationName(`${city}, ${country}`);
            else if (city || country) setDetectedLocationName(city || country);
          }
        } catch {}

        setGeoStatus('success');
      },
      () => geoFallback(),
      { timeout: 15000, enableHighAccuracy: false, maximumAge: 300000 }
    );
  }, []);

  const saveSettings = useCallback(async () => {
    if (!settingsLat || !settingsLng) return;
    localDB.saveSettings({
      lat: settingsLat,
      lng: settingsLng,
      fiqh: settingsFiqh,
      locationName: detectedLocationName,
      locationSource,
    });
    setSettingsConfigured(true);
    setSettingsModalOpen(false);
    await fetchPrayerTimings();
  }, [settingsLat, settingsLng, settingsFiqh, detectedLocationName, locationSource, fetchPrayerTimings]);

  const openDayModal = useCallback((day: DayData) => {
    if (day.isPadding) return;
    setSelectedDate(day.dateStr);
    setModalOpen(true);
    const data = localDB.getPrayersByDate(day.dateStr);
    const logs: Record<string, string> = {};
    data.forEach(l => { logs[l.prayer_name] = l.status; });
    setSelectedDateLogs(logs);
  }, []);

  const installPWA = useCallback(async () => {
    if (deferredPrompt) {
      (deferredPrompt as any).prompt();
      const { outcome } = await (deferredPrompt as any).userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsStandalone(true);
        localStorage.setItem('pwa_installed', 'true');
      }
    }
  }, [deferredPrompt]);

  const importData = useCallback((file: File) => {
    setProcessingTitle('Importing Data...');
    setProcessingMessage('Please wait while we merge your records.');
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const count = localDB.importCSV(text);
      setIsProcessing(false);
      if (count === -1) {
        setAlertModal({ open: true, title: 'Import Failed', message: 'Unrecognized CSV format.', type: 'error' });
        return;
      }
      setAlertModal({ open: true, title: 'Import Successful', message: `Successfully imported and merged ${count} records.`, type: 'success' });
      fetchData();
      fetchQaza();
      generateLast7Days();
      generateCalendar();
    };
    reader.onerror = () => {
      setIsProcessing(false);
      setAlertModal({ open: true, title: 'Import Error', message: 'Failed to read the file.', type: 'error' });
    };
    reader.readAsText(file);
  }, [fetchData, fetchQaza, generateLast7Days, generateCalendar]);

  const exportData = useCallback(() => {
    localDB.downloadCSV();
  }, []);

  const resetData = useCallback(async () => {
    setResetModalOpen(false);
    setProcessingTitle('Resetting Data...');
    setProcessingMessage('Please wait while we wipe your records.');
    setIsProcessing(true);

    // Delete from Drive if connected
    if (driveConnected) {
      try { await drive.deleteCloudData(); } catch {}
    }

    localDB.resetAll();
    // Brief delay for UI to show processing overlay
    setTimeout(() => window.location.reload(), 300);
  }, [driveConnected]);

  // ─── Google Drive Actions ───
  const connectDrive = useCallback(async () => {
    const token = await drive.signIn();
    if (token) {
      setDriveConnected(true);
      showToast('Google Drive connected! Syncing...');
      // Auto-sync on first connect
      setDriveSyncing(true);
      const result = await drive.syncToCloud();
      setDriveSyncing(false);
      if (result.success) {
        setLastSyncTime(drive.getLastSyncTime());
        showToast('Synced successfully!');
        fetchData();
        fetchQaza();
        generateLast7Days();
        generateCalendar();
      } else {
        showToast(result.error || 'Sync failed after connect.', 'error');
      }
    } else {
      showToast('Failed to connect Google Drive.', 'error');
    }
  }, [showToast, fetchData, fetchQaza, generateLast7Days, generateCalendar]);

  const disconnectDrive = useCallback(() => {
    drive.signOut();
    setDriveConnected(false);
    setLastSyncTime(null);
    showToast('Google Drive disconnected.');
  }, [showToast]);

  const syncDrive = useCallback(async () => {
    setDriveSyncing(true);
    const result = await drive.syncToCloud();
    setDriveSyncing(false);

    if (result.success) {
      setLastSyncTime(drive.getLastSyncTime());
      showToast('Synced to Google Drive!');
      // Refresh all views with merged data
      fetchData();
      fetchQaza();
      generateLast7Days();
      generateCalendar();
    } else {
      showToast(result.error || 'Sync failed.', 'error');
      // If auth issue, mark disconnect
      if (result.error?.includes('reconnect')) {
        setDriveConnected(false);
      }
    }
  }, [showToast, fetchData, fetchQaza, generateLast7Days, generateCalendar]);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const newVal = !prev;
      localStorage.setItem('theme', newVal ? 'dark' : 'light');
      if (newVal) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      return newVal;
    });
  }, []);

  const changeMonth = useCallback((delta: number) => {
    setCalendarDate(prev => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + delta);
      return next;
    });
  }, []);

  const changeYear = useCallback((delta: number) => {
    setCalendarDate(prev => {
      const next = new Date(prev);
      next.setFullYear(next.getFullYear() + delta);
      return next;
    });
  }, []);

  // Re-generate calendar when calendarDate changes
  useEffect(() => {
    generateCalendar(calendarDate);
  }, [calendarDate, generateCalendar]);

  // ─── Initialization ───
  useEffect(() => {
    // Theme
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }

    // Hijri toggle
    setShowHijri(localStorage.getItem('showHijri') === 'true');

    // PWA standalone check
    const checkStandalone = () => {
      if (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: window-controls-overlay)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches ||
        (window.navigator as any).standalone ||
        localStorage.getItem('pwa_installed') === 'true'
      ) {
        setIsStandalone(true);
      }
    };
    checkStandalone();

    // Time
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);
    const prayerInterval = setInterval(calculateNextPrayer, 60000);

    // Data (from localStorage — synchronous!)
    fetchData();
    fetchStreak();
    fetchQaza();
    generateCalendar();
    generateLast7Days();
    loadSettings();

    // Google Drive status
    setDriveConnected(drive.isDriveConnected());
    setLastSyncTime(drive.getLastSyncTime());

    // Load GIS script (non-blocking)
    drive.loadGISScript().catch(() => {});

    // PWA install prompt
    const handleInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    return () => {
      clearInterval(timeInterval);
      clearInterval(prayerInterval);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save Hijri toggle
  useEffect(() => {
    localStorage.setItem('showHijri', String(showHijri));
  }, [showHijri]);

  const getPrayerTime = useCallback((prayer: string): string => {
    const raw = prayerTimes[prayer];
    if (!raw) return '--:--';
    const [hStr, mStr] = raw.split(':');
    let h = parseInt(hStr, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${String(h).padStart(2, '0')}:${mStr} ${ampm}`;
  }, [prayerTimes]);

  return {
    currentView, setCurrentView,
    isDark, toggleTheme,
    mobileMenuOpen, setMobileMenuOpen,
    currentTime, currentDateStr,
    todayLogs, prayerTimes,
    nextPrayer, hijriDate, currentStreak,
    todayStats, monthStats, statCards,
    calendarDate, calendarDays, showHijri, setShowHijri,
    last7Days,
    qazaData, setQazaData, totalBacklog,
    qazaCalc, setQazaCalc, qazaModalOpen, setQazaModalOpen,
    settingsModalOpen, setSettingsModalOpen,
    settingsConfigured, settingsLat, settingsLng,
    settingsFiqh, setSettingsFiqh,
    geoStatus, locationSource, detectedLocationName,
    modalOpen, setModalOpen,
    selectedDate, selectedDateLogs,
    isProcessing, processingTitle, processingMessage,
    alertModal, setAlertModal,
    resetModalOpen, setResetModalOpen,
    toast, setToast,
    deferredPrompt, isStandalone,
    isPrayerFuture, updateStatus, updateStatusDate,
    performQazaAction, calculateAndAddQaza,
    calculateEstimateDate, getTotalQazaCompleted, getMostCompletedQaza,
    detectLocation, saveSettings,
    openDayModal, changeMonth, changeYear,
    installPWA, importData, exportData, resetData,
    getPrayerTime,
    // Google Drive
    driveConnected, driveSyncing, lastSyncTime,
    connectDrive, disconnectDrive, syncDrive,
  };
}
