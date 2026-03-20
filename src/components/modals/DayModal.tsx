'use client';

import { useState } from 'react';
import { X, Check, History, ChevronDown } from 'lucide-react';
import { PRAYERS, VOLUNTARY } from '@/lib/utils';

interface DayModalProps {
  open: boolean;
  onClose: () => void;
  selectedDate: string | null;
  selectedDateLogs: Record<string, string>;
  updateStatusDate: (date: string, prayer: string, status: string, isVoluntary?: number) => void;
}

export default function DayModal({ open, onClose, selectedDate, selectedDateLogs, updateStatusDate }: DayModalProps) {
  const [isNaflOpen, setIsNaflOpen] = useState(false);

  if (!open || !selectedDate) return null;

  const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-sm shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[calc(100vh-2rem)]">
        {/* Header */}
        <div className="bg-gradient-to-br from-sage-800 via-sage-900 to-black dark:from-zinc-800 dark:to-zinc-900 p-6 text-white flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-bold">{formattedDate}</h2>
            <p className="text-sage-200/80 text-xs font-medium">Toggle prayer status</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors bg-white/10 p-2 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-2 overflow-y-auto">
          {PRAYERS.map(prayer => {
            const status = selectedDateLogs[prayer] || 'None';
            return (
              <div key={prayer} className="flex items-center justify-between bg-gray-50 dark:bg-zinc-800 p-3 rounded-2xl border border-gray-100 dark:border-zinc-700 gap-2">
                <span className="font-bold text-sm text-gray-800 dark:text-gray-200">{prayer}</span>
                <div className="flex gap-2">
                  {(['Prayed', 'Missed', 'Qaza'] as const).map(s => {
                    const icons = { Prayed: Check, Missed: X, Qaza: History };
                    const BIcon = icons[s];
                    const colors = {
                      Prayed: { active: '!bg-emerald-500 !text-white !shadow-lg ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-zinc-900', hover: 'hover:bg-emerald-500 hover:text-white' },
                      Missed: { active: '!bg-red-500 !text-white !shadow-lg ring-2 ring-red-500 ring-offset-2 dark:ring-offset-zinc-900', hover: 'hover:bg-red-500 hover:text-white' },
                      Qaza: { active: '!bg-amber-500 !text-white !shadow-lg ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-zinc-900', hover: 'hover:bg-amber-500 hover:text-white' },
                    };
                    return (
                      <button
                        key={s}
                        onClick={() => updateStatusDate(selectedDate, prayer, status === s ? 'None' : s)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 bg-white dark:bg-zinc-900 text-gray-400 ${colors[s].hover} ${status === s ? colors[s].active : ''} active:scale-95`}
                      >
                        <BIcon className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
            <button onClick={() => setIsNaflOpen(!isNaflOpen)} className="flex items-center justify-between w-full group py-1">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">Voluntary (Nafl)</h3>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isNaflOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`space-y-2 overflow-hidden transition-all duration-300 ${isNaflOpen ? 'mt-3 max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
              {VOLUNTARY.map(prayer => {
                const isPrayed = selectedDateLogs[prayer] === 'Prayed';
                return (
                  <button
                    key={prayer}
                    onClick={() => updateStatusDate(selectedDate, prayer, isPrayed ? 'None' : 'Prayed', 1)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 group active:scale-95 ${
                      isPrayed
                        ? 'bg-sage-600 border-sage-600 text-white shadow-md'
                        : 'bg-gray-50 dark:bg-zinc-800 border-gray-100 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:border-sage-200 dark:hover:border-zinc-600'
                    }`}
                  >
                    <span className="font-bold text-sm">{prayer}</span>
                    <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center transition-colors">
                      <div className={`w-2.5 h-2.5 rounded-full bg-current text-white transition-all duration-300 ${isPrayed ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
