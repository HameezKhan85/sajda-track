'use client';

import { useApp } from '@/context/AppContext';
import CalendarView from '@/components/Calendar';

export default function CalendarPage() {
  const state = useApp();

  return (
    <CalendarView
      calendarDate={state.calendarDate}
      calendarDays={state.calendarDays}
      monthStats={state.monthStats}
      showHijri={state.showHijri}
      setShowHijri={state.setShowHijri}
      changeMonth={state.changeMonth}
      changeYear={state.changeYear}
      openDayModal={state.openDayModal}
    />
  );
}
