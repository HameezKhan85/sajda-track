'use client';

import { Plus, HeartHandshake, CalendarCheck, TrendingUp, Minus, Sunrise, Sun, CloudSun, Sunset, Moon, Clock, Calculator, X as XIcon } from 'lucide-react';
import { PRAYERS, type QazaItem } from '@/lib/utils';

const prayerIconMap: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  Fajr: Sunrise, Dhuhr: Sun, Asr: CloudSun, Maghrib: Sunset, Isha: Moon,
};

interface QazaTrackingProps {
  qazaData: QazaItem[];
  setQazaData: (d: QazaItem[]) => void;
  totalBacklog: number;
  monthStats: { prayed: number; missed: number; qaza: number };
  getTotalQazaCompleted: () => number;
  getMostCompletedQaza: () => string;
  calculateEstimateDate: () => string;
  performQazaAction: (action: string, prayer: string, amount: number) => void;
  qazaModalOpen: boolean;
  setQazaModalOpen: (v: boolean) => void;
  qazaCalc: { fromDate: string; toDate: string; prayer: string };
  setQazaCalc: (v: { fromDate: string; toDate: string; prayer: string }) => void;
  calculateAndAddQaza: () => void;
}

export default function QazaTracking({
  qazaData, setQazaData, totalBacklog, monthStats,
  getTotalQazaCompleted, getMostCompletedQaza, calculateEstimateDate,
  performQazaAction, qazaModalOpen, setQazaModalOpen,
  qazaCalc, setQazaCalc, calculateAndAddQaza,
}: QazaTrackingProps) {
  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Qaza Tracking</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">Manage and calculate your missed prayers.</p>
        </div>
        <button onClick={() => setQazaModalOpen(true)} className="px-4 py-2.5 bg-[#3a5245] dark:bg-zinc-700 hover:bg-[#2b3d33] dark:hover:bg-zinc-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-all border border-[#25322a] dark:border-zinc-600 shadow-sm shrink-0">
          <Plus className="w-4 h-4" /> Add Bulk Qaza
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Pending */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 flex flex-col justify-between border border-gray-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#3a5245]/5 dark:to-[#3a5245]/10 pointer-events-none" />
          <div className="flex items-start justify-between mb-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">Total<br/>Pending</p>
            <div className="w-10 h-10 bg-[#f0f4f1] dark:bg-zinc-800 rounded-2xl shadow-sm border border-white dark:border-zinc-700 text-[#3a5245] flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22.54 12.43-8.58 3.91a2 2 0 0 1-1.66 0L3.46 12.43"/><path d="m22.54 16.43-8.58 3.91a2 2 0 0 1-1.66 0L3.46 16.43"/></svg>
            </div>
          </div>
          <h3 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white leading-none tracking-tight min-w-[60px] inline-block">{totalBacklog}</h3>
        </div>

        {/* Total Qaza Prayed */}
        <div className="bg-[#f0f4f1] dark:bg-emerald-900/10 rounded-3xl p-6 flex flex-col justify-between border border-[#e4ece7] dark:border-emerald-900/30 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/40 dark:to-emerald-900/10 pointer-events-none" />
          <div className="flex items-start justify-between mb-2">
            <p className="text-[10px] font-bold text-[#3a5245]/70 dark:text-emerald-500/80 uppercase tracking-widest leading-tight">Total Qaza<br/>Prayed</p>
            <div className="w-10 h-10 bg-white dark:bg-emerald-900/40 rounded-2xl shadow-sm border border-transparent text-[#3a5245] dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-4xl lg:text-5xl font-black text-[#25322a] dark:text-emerald-400 leading-none tracking-tight min-w-[40px] inline-block">{getTotalQazaCompleted()}</h3>
            {getTotalQazaCompleted() > 0 && (
              <p className="text-[10px] font-bold text-sage-600/70 dark:text-emerald-500/60 uppercase tracking-widest mt-2">Most Prayed: {getMostCompletedQaza()}</p>
            )}
          </div>
        </div>

        {/* Daily Motivation */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm p-6 flex flex-col items-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 dark:from-indigo-900/10 to-transparent pointer-events-none" />
          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-2">Daily Motivation</h4>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 italic font-medium leading-relaxed mb-1 flex-1 flex items-center">&quot;Say, &apos;O My servants who have transgressed against themselves... do not despair of the mercy of Allah...&apos;&quot;</p>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">— Quran 39:53</span>
        </div>

        {/* Completion Estimate */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm p-6 flex flex-col items-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 dark:from-emerald-900/10 to-transparent pointer-events-none" />
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-2">Completion Estimate</h4>
          {totalBacklog === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">All Caught Up!</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Mashallah, you have no backlog.</p>
            </div>
          ) : totalBacklog > 0 && (!monthStats.qaza || monthStats.qaza == 0) ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Log some Qaza prayers this month to generate an estimate.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center w-full">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1.5">At your pace of <span className="font-bold text-gray-700 dark:text-zinc-200">{monthStats.qaza} / month</span>:</p>
              <div className="bg-[#f0f4f1] dark:bg-zinc-800 text-[#3a5245] dark:text-emerald-400 py-2 w-full rounded-xl font-black text-sm border border-[#e4ece7] dark:border-zinc-700">
                {calculateEstimateDate()}
              </div>
              <p className="text-[9px] text-gray-400 mt-1.5 uppercase tracking-wide">Estimated Clearance</p>
            </div>
          )}
        </div>
      </div>

      {/* Prayer Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {qazaData.map(q => {
          const PIcon = prayerIconMap[q.prayer_name] || Clock;
          return (
            <div key={q.prayer_name} className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col p-5 group hover:border-[#d6e4db] dark:hover:border-zinc-700 transition-colors">
              <div className="flex flex-col items-center text-center flex-1 mb-5 relative">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center text-gray-400 dark:text-zinc-400 group-hover:text-[#3a5245] dark:group-hover:text-zinc-200 group-hover:bg-[#e8f0eb] dark:group-hover:bg-zinc-700 transition-colors mb-3">
                  <PIcon className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{q.prayer_name}</h3>
                <h4 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-none min-w-[32px] inline-block text-center">{q.count}</h4>
              </div>

              <div className="flex items-center gap-1.5 mt-auto w-full">
                <button
                  onClick={() => performQazaAction('subtract', q.prayer_name, 1)}
                  disabled={q.count <= 0}
                  className="w-11 h-11 bg-emerald-100 dark:bg-emerald-900/40 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400 transition-colors rounded-2xl font-black flex items-center justify-center text-sm shrink-0 shadow-sm border border-emerald-200 dark:border-emerald-800/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-zinc-800 disabled:text-gray-400 dark:disabled:text-zinc-500 disabled:border-transparent dark:disabled:border-transparent active:scale-95"
                  title="Quick log 1 prayed"
                >-1</button>

                <div className="flex-1 flex items-center bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 p-1 rounded-2xl w-full relative focus-within:ring-2 focus-within:ring-[#3a5245]/20 focus-within:border-[#3a5245]/30 transition-shadow">
                  <button
                    onClick={() => {
                      const amt = parseInt(q.manualInput);
                      if (amt > 0) { performQazaAction('subtract', q.prayer_name, amt); updateManualInput(q.prayer_name, ''); }
                    }}
                    disabled={q.count <= 0}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-zinc-900 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border border-gray-100 dark:border-zinc-800 shrink-0 group/btn"
                    title="Subtract Qty"
                  >
                    <Minus className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                  </button>
                  <input
                    type="number"
                    className="flex-1 w-full min-w-0 bg-transparent text-center text-sm focus:outline-none font-bold text-gray-700 dark:text-gray-200 placeholder-gray-300 dark:placeholder-zinc-600 appearance-none px-1"
                    placeholder="Qty"
                    value={q.manualInput}
                    onChange={e => updateManualInput(q.prayer_name, e.target.value)}
                    min={1}
                  />
                  <button
                    onClick={() => {
                      const amt = parseInt(q.manualInput);
                      if (amt > 0) { performQazaAction('add', q.prayer_name, amt); updateManualInput(q.prayer_name, ''); }
                    }}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-zinc-900 hover:bg-[#e8f0eb] dark:hover:bg-zinc-700/50 text-[#3a5245] dark:text-[#d6e4db] transition-colors shadow-sm border border-gray-100 dark:border-zinc-800 shrink-0 group/btn"
                    title="Add Qty"
                  >
                    <Plus className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                  </button>
                </div>

                <button
                  onClick={() => performQazaAction('add', q.prayer_name, 1)}
                  className="w-11 h-11 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 text-red-700 dark:text-red-400 transition-colors rounded-2xl font-black flex items-center justify-center text-sm shrink-0 shadow-sm border border-red-200 dark:border-red-800/50 active:scale-95"
                  title="Quick log 1 missed"
                >+1</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Qaza Bulk Modal */}
      {qazaModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setQazaModalOpen(false)} />
          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-sm shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[calc(100vh-2rem)]">
            <div className="bg-gradient-to-br from-[#3a5245] to-[#25322a] dark:from-zinc-800 dark:to-zinc-900 p-6 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold leading-tight">Bulk Qaza Calculator</h2>
                  <p className="text-emerald-200/80 text-xs font-medium">Add missed prayers quickly</p>
                </div>
              </div>
              <button onClick={() => setQazaModalOpen(false)} className="text-white/70 hover:text-white transition-colors bg-white/10 p-2 rounded-xl">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 ml-1">From Date</label>
                <input type="date" value={qazaCalc.fromDate} onChange={e => setQazaCalc({ ...qazaCalc, fromDate: e.target.value })} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 text-sm font-medium text-gray-900 dark:text-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#3a5245] dark:focus:ring-emerald-500 outline-none transition-all dark:[color-scheme:dark]" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 ml-1">To Date (Inclusive)</label>
                <input type="date" value={qazaCalc.toDate} onChange={e => setQazaCalc({ ...qazaCalc, toDate: e.target.value })} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 text-sm font-medium text-gray-900 dark:text-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#3a5245] dark:focus:ring-emerald-500 outline-none transition-all dark:[color-scheme:dark]" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 ml-1">Prayer Target</label>
                <select value={qazaCalc.prayer} onChange={e => setQazaCalc({ ...qazaCalc, prayer: e.target.value })} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 text-sm font-medium text-gray-900 dark:text-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#3a5245] dark:focus:ring-emerald-500 outline-none transition-all appearance-none cursor-pointer">
                  <option value="All">All 5</option>
                  {PRAYERS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="pt-2">
                <button onClick={() => { calculateAndAddQaza(); setQazaModalOpen(false); }} className="w-full bg-[#3a5245] dark:bg-emerald-600 hover:bg-[#2b3d33] dark:hover:bg-emerald-700 text-white font-bold h-[46px] rounded-xl transition-all hover:shadow-md active:scale-95 flex items-center justify-center border border-[#25322a] dark:border-emerald-800 shadow-sm">
                  <Calculator className="w-4 h-4 mr-2" /> Calculate & Add to Pending
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function updateManualInput(prayerName: string, value: string) {
    setQazaData(qazaData.map(q => q.prayer_name === prayerName ? { ...q, manualInput: value } : q));
  }
}
