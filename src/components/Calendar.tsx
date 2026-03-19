'use client';

import { CheckCircle2, XCircle, History, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { MONTH_NAMES, type DayData } from '@/lib/utils';
import { getHijriMonthName } from '@/lib/utils';

interface CalendarProps {
  calendarDate: Date;
  calendarDays: DayData[];
  monthStats: { prayed: number; missed: number; qaza: number };
  showHijri: boolean;
  setShowHijri: (v: boolean) => void;
  changeMonth: (d: number) => void;
  changeYear: (d: number) => void;
  openDayModal: (day: DayData) => void;
}

export default function Calendar({
  calendarDate, calendarDays, monthStats,
  showHijri, setShowHijri,
  changeMonth, changeYear, openDayModal,
}: CalendarProps) {
  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Month Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-2xl p-4 flex items-center justify-between transition-all hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Prayed</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Completed on time</p>
            </div>
          </div>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 min-w-[28px] inline-block text-right">{monthStats.prayed}</span>
        </div>

        <div className="bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30 rounded-2xl p-4 flex items-center justify-between transition-all hover:bg-red-50 dark:hover:bg-red-900/20 hover:shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Missed</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Requires Qaza</p>
            </div>
          </div>
          <span className="text-2xl font-black text-red-600 dark:text-red-400 min-w-[28px] inline-block text-right">{monthStats.missed}</span>
        </div>

        <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-2xl p-4 flex items-center justify-between transition-all hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
              <History className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Qaza</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Made up prayers</p>
            </div>
          </div>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400 min-w-[28px] inline-block text-right">{monthStats.qaza}</span>
        </div>
      </div>

      {/* Title & Hijri toggle */}
      <div className="flex items-end justify-between mb-4 md:mb-6 px-1 mt-6">
        <div className="flex flex-col">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none px-1">Calendar</h2>
          {showHijri && (
            <h3 className="text-sm md:text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1.5 px-1">{getHijriMonthName(calendarDate)}</h3>
          )}
        </div>
        <label className="flex items-center cursor-pointer select-none group bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 py-1.5 px-3 md:py-2 md:px-4 rounded-full border border-gray-200 dark:border-zinc-700 shadow-sm transition-colors mb-1 md:mb-0" title="Toggle Islamic Calendar">
          <div className={`mr-2.5 text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors ${showHijri ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>Hijri Date</div>
          <div className="relative shrink-0 flex items-center">
            <input type="checkbox" className="sr-only" checked={showHijri} onChange={() => setShowHijri(!showHijri)} />
            <div className={`block w-10 h-6 rounded-full transition-colors duration-200 ${showHijri ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-zinc-900'}`} />
            <div className={`absolute left-[3px] bg-white rounded-full transition-transform duration-200 shadow-sm ${showHijri ? 'translate-x-4' : ''}`} style={{ width: 18, height: 18 }} />
          </div>
        </label>
      </div>

      {/* Calendar Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm p-4 sm:p-6 relative">
        {/* Month Nav */}
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <div className="flex items-center gap-0.5 md:gap-1">
            <button onClick={() => changeYear(-1)} className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-gray-400 hover:text-gray-700 dark:hover:text-zinc-300" title="Previous Year">
              <ChevronsLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button onClick={() => changeMonth(-1)} className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors" title="Previous Month">
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
          <div className="flex flex-col items-center flex-1 max-w-full px-2 text-center text-ellipsis overflow-hidden">
            <h2 className="text-xl md:text-2xl font-bold font-sans tracking-tight whitespace-nowrap text-gray-700 dark:text-gray-300">
              {MONTH_NAMES[calendarDate.getMonth()]} {calendarDate.getFullYear()}
            </h2>
          </div>
          <div className="flex items-center gap-0.5 md:gap-1">
            <button onClick={() => changeMonth(1)} className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors" title="Next Month">
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button onClick={() => changeYear(1)} className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-gray-400 hover:text-gray-700 dark:hover:text-zinc-300" title="Next Year">
              <ChevronsRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>

        {/* Day Labels */}
        <div className="hidden md:grid grid-cols-7 gap-4 mb-4 text-center font-bold text-gray-400 text-sm uppercase tracking-wider">
          <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3 md:gap-4">
          {calendarDays.map(day => {
            if (day.isPadding) return <div key={day.dateStr} className="invisible" />;

            return (
              <div
                key={day.dateStr}
                onClick={() => !day.isFuture && openDayModal(day)}
                className={`transition-all duration-200 relative group hover:z-[70] flex flex-col justify-between p-4 md:p-3 rounded-2xl border min-h-[110px] md:min-h-0 ${
                  day.isFuture
                    ? 'opacity-40 cursor-not-allowed border-dashed border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50'
                    : 'cursor-pointer hover:-translate-y-1 hover:shadow-sm border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                } ${day.isToday && !day.isFuture ? '!bg-emerald-50/50 dark:!bg-emerald-900/10 !border-emerald-400 shadow-sm shadow-emerald-500/5 hover:!bg-emerald-50 dark:hover:!bg-emerald-900/20' : ''}`}
              >
                {/* Top */}
                <div className="flex justify-between items-start z-10 w-full mb-2 md:mb-0">
                  <div className="flex flex-col min-w-0 pr-1 w-full gap-1 md:gap-0">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span className="md:hidden text-gray-400 dark:text-zinc-500 text-[12px] font-black uppercase tracking-widest">
                          {new Date(day.dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                        <span className={`text-[22px] md:text-lg font-black md:font-bold leading-none ${
                          day.isToday && !day.isFuture ? 'text-emerald-700 dark:text-emerald-500' : 'text-slate-700 dark:text-slate-300'
                        }`}>{day.dayNum}</span>
                      </div>
                    </div>
                    {showHijri && (
                      <div className={`mt-1 md:my-1 truncate max-w-full inline-flex self-start ${
                        day.hijriDayNum == '1' ? 'bg-emerald-500 px-2 py-1 md:px-1.5 md:py-1.5 rounded-md md:rounded shadow-sm flex items-center' : ''
                      }`}>
                        <span className={`text-sm md:text-base font-bold leading-[1.15] md:leading-none tracking-tight truncate w-full ${
                          day.hijriDayNum == '1' ? 'text-white md:text-xs' : 'text-emerald-600 dark:text-emerald-400'
                        }`}>{day.hijriDayNum == '1' ? `1st ${day.hijriMonthStr}` : day.hijriDayNum}</span>
                      </div>
                    )}
                  </div>
                  {!day.isFuture && (
                    <div className={`hidden md:block w-2 h-2 rounded-full mt-0.5 shrink-0 transition-colors ${
                      day.isToday ? 'bg-emerald-500' : day.prayedCount > 0 ? 'bg-emerald-400' : day.missedCount > 0 ? 'bg-red-400' : 'bg-transparent'
                    }`} />
                  )}
                </div>

                {/* Bottom Dots */}
                <div className="flex items-center flex-wrap gap-2 mt-auto pt-2 z-10 w-full md:w-auto">
                  {day.prayerStatuses.map((status, i) => (
                    <div key={i} className={`w-3.5 h-3.5 rounded-full transition-colors shrink-0 flex items-center justify-center ${
                      status === 'Prayed' ? 'bg-emerald-500 shadow-sm'
                        : status === 'Qaza' ? 'bg-amber-400 shadow-sm'
                        : status === 'Missed' ? 'bg-rose-500 shadow-sm'
                        : status === 'None' && !day.isToday ? 'bg-slate-100 dark:bg-zinc-800'
                        : status === 'None' && day.isToday && !day.isFuture ? 'bg-emerald-600/10 dark:bg-emerald-800/40'
                        : 'bg-slate-100 dark:bg-zinc-800'
                    }`} />
                  ))}
                </div>

                {/* Hover tooltip */}
                {!day.isFuture && (
                  <div className="hidden md:flex absolute inset-x-0 left-auto right-0 bottom-full mb-3 mx-auto w-max max-w-xs opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:-translate-y-1 z-[60] bg-gray-900 dark:bg-black text-white px-3 py-2.5 rounded-xl shadow-xl border border-white/10 pointer-events-none flex-col gap-1.5 text-xs font-bold leading-tight">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400" /><span className="text-white/90">{day.prayedCount} Prayed</span></div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-400" /><span className="text-white/90">{day.missedCount} Missed</span></div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-400" /><span className="text-white/90">{day.qazaCount} Qaza</span></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
