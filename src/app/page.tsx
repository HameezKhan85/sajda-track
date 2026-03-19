'use client';

import { useApp } from '@/context/AppContext';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const state = useApp();

  return (
    <Dashboard
      hijriDate={state.hijriDate}
      currentStreak={state.currentStreak}
      nextPrayer={state.nextPrayer}
      statCards={state.statCards}
      last7Days={state.last7Days}
      todayLogs={state.todayLogs}
      prayerTimes={state.prayerTimes}
      isPrayerFuture={state.isPrayerFuture}
      updateStatus={state.updateStatus}
      getPrayerTime={state.getPrayerTime}
      openDayModal={state.openDayModal}
    />
  );
}
