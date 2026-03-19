'use client';

import { useState } from 'react';

import {
  MoonStar, Check, X, History, Sparkles, CalendarDays,
  CheckCircle2, XCircle, Activity,
  Sunrise, Sun, CloudSun, Sunset, Moon,
  Star, SunDim, BookOpen, Clock,
} from 'lucide-react';
import { PRAYERS, VOLUNTARY, type DayData } from '@/lib/utils';

const prayerIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'sunrise': Sunrise, 'sun': Sun, 'cloud-sun': CloudSun, 'sunset': Sunset, 'moon': Moon,
  'star': Star, 'sun-dim': SunDim, 'book-open': BookOpen, 'clock': Clock,
};
const statIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'check-circle-2': CheckCircle2, 'x-circle': XCircle, 'layers': () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22.54 12.43-8.58 3.91a2 2 0 0 1-1.66 0L3.46 12.43"/><path d="m22.54 16.43-8.58 3.91a2 2 0 0 1-1.66 0L3.46 16.43"/></svg>,
  'activity': Activity,
};

function getPrayerIcon(prayer: string) {
  const icons: Record<string, string> = { 'Fajr': 'sunrise', 'Dhuhr': 'sun', 'Asr': 'cloud-sun', 'Maghrib': 'sunset', 'Isha': 'moon', 'Tahajjud': 'star', 'Ishraq': 'sun-dim', 'Taraweeh': 'book-open' };
  const icon = icons[prayer] || 'clock';
  const Icon = prayerIconMap[icon] || Clock;
  return Icon;
}

interface DashboardProps {
  hijriDate: string;
  currentStreak: number;
  nextPrayer: { name: string; time: string; countdown: string };
  statCards: Array<{ title: string; value: string | number; icon: string; colorBg: string; colorText: string }>;
  last7Days: DayData[];
  todayLogs: Record<string, string>;
  prayerTimes: Record<string, string>;
  isPrayerFuture: (prayer: string) => boolean;
  updateStatus: (prayer: string, status: string, isVoluntary?: number) => void;
  getPrayerTime: (prayer: string) => string;
  openDayModal: (day: DayData) => void;
}

export default function Dashboard({
  hijriDate, currentStreak, nextPrayer, statCards, last7Days,
  todayLogs, prayerTimes, isPrayerFuture, updateStatus, getPrayerTime, openDayModal,
}: DashboardProps) {
  const NextIcon = getPrayerIcon(nextPrayer.name);

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Left Column */}
        <div className="xl:col-span-2 space-y-6 lg:space-y-8">
          {/* Hero Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Greeting Card */}
            <div className="bg-gradient-to-br from-sage-800 via-sage-900 to-black rounded-3xl p-6 text-white relative overflow-hidden flex flex-col justify-center shadow-xl shadow-sage-900/20 min-h-[160px] transform transition-all hover:scale-[1.02] border border-sage-700/50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mt-8 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-sage-500/20 rounded-full -ml-8 -mb-8 blur-xl" />
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-1.5 text-sage-200 mb-1.5">
                    <MoonStar className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{hijriDate}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-white/90 tracking-tight leading-tight">As-salamu alaykum</h2>
                </div>
                <div className="text-right bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 shadow-inner">
                  <span className="text-[10px] text-sage-200 font-bold uppercase tracking-widest block mb-0.5">Streak</span>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-black text-white leading-none min-w-[28px] inline-block text-center">{currentStreak}</span>
                    <span className="text-xs font-semibold text-sage-200">d</span>
                  </div>
                </div>
              </div>
              <p className="relative z-10 text-sage-200/90 text-[13px] md:text-sm mt-4 italic font-medium leading-relaxed border-t border-white/10 pt-3">&quot;Indeed, prayer has been decreed upon the believers...&quot;</p>
            </div>

            {/* Next Prayer Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col justify-center relative overflow-hidden min-h-[160px] transform transition-all hover:border-sage-300 dark:hover:border-sage-700 group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-sage-50 dark:bg-sage-900/20 rounded-full -mr-6 -mt-6 blur-xl group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10 flex items-center justify-between w-full mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-sage-500 animate-pulse" />
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest">Next Prayer</p>
                </div>
                <div className="w-10 h-10 bg-sage-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-sage-600 dark:text-sage-400">
                  <NextIcon className="w-5 h-5" />
                </div>
              </div>
              <div className="relative z-10 flex items-end justify-between w-full">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{nextPrayer.name}</h2>
                  <p className="text-sm text-sage-600 dark:text-sage-400 font-bold mt-1 tracking-wide">{nextPrayer.time}</p>
                </div>
                <div className="bg-gray-50 dark:bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-zinc-800">
                  <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400">in {nextPrayer.countdown}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stat Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card, index) => {
              const SIcon = statIconMap[card.icon] || Activity;
              return (
                <div key={index} className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center text-center gap-2.5 hover:border-sage-300 dark:hover:border-sage-700 transition-all hover:-translate-y-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${card.colorBg}`}>
                    <SIcon className={`w-6 h-6 ${card.colorText}`} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-none mb-1.5">{card.value}</h3>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">{card.title}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Weekly Progress Strip */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm p-6 overflow-hidden relative">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">Last 7 Days</h3>
              <CalendarDays className="w-5 h-5 text-gray-400" />
            </div>
            {/* Day Labels (Desktop) */}
            <div className="hidden md:grid grid-cols-7 gap-2 md:gap-3 mb-3 text-center font-bold text-gray-400 text-xs uppercase tracking-wider px-1">
              {last7Days.map(day => (
                <div key={'l-' + day.dateStr}>{day.label}</div>
              ))}
            </div>
            {/* Calendar Blocks */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3 md:gap-3">
              {last7Days.map((day, index) => (
                <div
                  key={index}
                  onClick={() => openDayModal(day)}
                  className={`flex items-center justify-between gap-2 md:gap-0 md:flex-col md:items-stretch md:justify-between p-3.5 sm:p-3.5 md:p-3 md:h-24 border rounded-2xl cursor-pointer transition-all duration-200 relative group ${
                    day.isToday
                      ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-400 shadow-sm shadow-emerald-500/5 hover:-translate-y-1 hover:shadow-md hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                      : 'bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800 hover:-translate-y-1 hover:shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-[11px] uppercase font-bold text-gray-400 md:hidden mb-1 leading-none tracking-wider">{day.label}</span>
                      <span className={`text-[22px] md:text-sm font-bold z-10 leading-none ${day.isToday ? 'text-emerald-700 dark:text-emerald-500' : 'text-slate-700 dark:text-slate-300'}`}>{day.dayNum}</span>
                    </div>
                    <div className={`hidden md:block w-2 h-2 rounded-full mt-0.5 transition-colors absolute top-2.5 right-2.5 ${
                      day.isToday ? 'bg-emerald-500' : day.prayedCount > 0 ? 'bg-emerald-400' : day.missedCount > 0 ? 'bg-red-400' : 'bg-transparent'
                    }`} />
                  </div>
                  <div className="flex items-center flex-wrap gap-2 md:gap-1 lg:gap-1.5 mt-auto">
                    {day.prayerStatuses.map((status, i) => (
                      <div
                        key={i}
                        className={`w-3.5 h-3.5 md:w-2.5 md:h-2.5 lg:w-3 lg:h-3 rounded-full transition-colors shrink-0 ${
                          status === 'Prayed' ? 'bg-emerald-500'
                            : status === 'Qaza' ? 'bg-amber-400'
                            : status === 'Missed' ? 'bg-rose-500'
                            : day.isToday ? 'bg-emerald-600/10 dark:bg-emerald-800/40'
                            : 'bg-slate-100 dark:bg-zinc-800'
                        }`}
                      />
                    ))}
                  </div>
                  {/* Hover tooltip */}
                  <div className="absolute inset-x-0 bottom-full mb-3 mx-auto w-max max-w-xs opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:-translate-y-1 z-[60] bg-gray-900 dark:bg-black text-white px-3 py-2.5 rounded-xl shadow-xl border border-white/10 pointer-events-none hidden md:flex flex-col gap-1.5 text-[10px] md:text-xs font-bold leading-tight">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400" /><span className="text-white/90">{day.prayedCount} Prayed</span></div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-400" /><span className="text-white/90">{day.missedCount} Missed</span></div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-400" /><span className="text-white/90">{day.qazaCount} Qaza</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center pb-2 pt-2">
            <p className="text-[13px] md:text-sm text-gray-400 font-medium">Consistency is key to success.</p>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6 lg:space-y-8 lg:sticky lg:top-24">
          {/* Prayer Timeline */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">Today&apos;s Journey</h2>
            <div className="space-y-3">
              {PRAYERS.map(prayer => {
                const PIcon = getPrayerIcon(prayer);
                const status = todayLogs[prayer] || 'None';
                const isFuture = isPrayerFuture(prayer);
                const isNext = prayer === nextPrayer.name;
                return (
                  <div
                    key={prayer}
                    className={`group bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-3 md:p-4 flex items-center gap-4 transition-all hover:shadow-md hover:border-sage-200 dark:hover:border-sage-800 ${
                      isNext ? 'ring-2 ring-sage-500 ring-offset-2 dark:ring-offset-zinc-950' : ''
                    }`}
                  >
                    <div className="w-14 text-center flex-shrink-0">
                      <span className="block text-sm md:text-base font-bold text-gray-900 dark:text-white">{getPrayerTime(prayer)}</span>
                    </div>
                    <div className={`w-1 h-12 rounded-full flex-shrink-0 relative overflow-hidden bg-gray-100 dark:bg-zinc-800`}>
                      <div className={`absolute bottom-0 left-0 w-full rounded-full transition-all duration-500 ${
                        status === 'Prayed' ? 'h-full bg-emerald-500'
                          : status === 'Qaza' ? 'h-full bg-amber-500'
                          : status === 'Missed' ? 'h-full bg-red-500'
                          : 'h-0'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm md:text-base tracking-tight">{prayer}</h3>
                      <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">{isNext ? 'Next Prayer' : 'Obligatory'}</p>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2">
                      <div title={isFuture ? 'Future prayer — time has not started yet' : ''} className="flex gap-1 md:gap-2">
                        {(['Prayed', 'Missed', 'Qaza'] as const).map(s => {
                          const icons = { Prayed: Check, Missed: X, Qaza: History };
                          const BIcon = icons[s];
                          const colors = {
                            Prayed: { active: '!bg-emerald-500 !text-white !shadow-lg !shadow-emerald-500/30 ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-zinc-900', hover: 'hover:bg-emerald-500 hover:text-white' },
                            Missed: { active: '!bg-red-500 !text-white !shadow-lg !shadow-red-500/30 ring-2 ring-red-500 ring-offset-2 dark:ring-offset-zinc-900', hover: 'hover:bg-red-500 hover:text-white' },
                            Qaza: { active: '!bg-amber-500 !text-white !shadow-lg !shadow-amber-500/30 ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-zinc-900', hover: 'hover:bg-amber-500 hover:text-white' },
                          };
                          return (
                            <button
                              key={s}
                              disabled={isFuture}
                              onClick={() => { if (!isFuture) updateStatus(prayer, status === s ? 'None' : s); }}
                              className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all duration-200 bg-gray-50 dark:bg-zinc-800 text-gray-400 ${colors[s].hover} ${
                                status === s ? colors[s].active : ''
                              } ${isFuture ? 'opacity-30 grayscale cursor-not-allowed' : 'active:scale-95'}`}
                            >
                              <BIcon className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Voluntary Prayers */}
          <NaflSection todayLogs={todayLogs} updateStatus={updateStatus} />
        </div>
      </div>
    </div>
  );
}

function NaflSection({ todayLogs, updateStatus }: { todayLogs: Record<string, string>; updateStatus: (prayer: string, status: string, isVoluntary?: number) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/50 dark:hover:bg-zinc-800/50 transition-colors">
        <span className="text-sm font-bold tracking-wide flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Voluntary Prayers (Nafl)
        </span>
        <svg className={`w-4 h-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="border-t border-gray-100 dark:border-zinc-800 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {VOLUNTARY.map(prayer => (
            <button
              key={prayer}
              onClick={() => updateStatus(prayer, todayLogs[prayer] === 'Prayed' ? 'None' : 'Prayed', 1)}
              className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-200 group active:scale-95 ${
                todayLogs[prayer] === 'Prayed'
                  ? 'bg-sage-600 border-sage-600 text-white shadow-md'
                  : 'bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800 text-gray-600 dark:text-gray-400 hover:border-sage-200'
              }`}
            >
              <span className="text-xs font-bold">{prayer}</span>
              <div className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center transition-colors">
                <div className={`w-2 h-2 rounded-full bg-current text-white transition-all duration-300 ${todayLogs[prayer] === 'Prayed' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
