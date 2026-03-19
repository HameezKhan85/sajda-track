'use client';

import { Crosshair, MapPin, Check, Loader2, X, AlertTriangle } from 'lucide-react';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  settingsLat: string;
  settingsLng: string;
  settingsFiqh: string;
  setSettingsFiqh: (v: string) => void;
  settingsHijriOffset: number;
  setSettingsHijriOffset: (v: number) => void;
  geoStatus: 'idle' | 'detecting' | 'success' | 'error';
  locationSource: string;
  detectedLocationName: string;
  detectLocation: () => void;
  saveSettings: () => void;
}

export default function SettingsModal({
  open, onClose,
  settingsLat, settingsLng,
  settingsFiqh, setSettingsFiqh,
  settingsHijriOffset, setSettingsHijriOffset,
  geoStatus, locationSource, detectedLocationName,
  detectLocation, saveSettings,
}: SettingsModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-sm shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[calc(100vh-2rem)]">
        {/* Header */}
        <div className="bg-gradient-to-br from-sage-800 via-sage-900 to-black dark:from-zinc-800 dark:to-zinc-900 p-6 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">Prayer Settings</h2>
              <p className="text-sage-200/80 text-xs font-medium">Configure location for prayer times</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors bg-white/10 p-2 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Detect Button */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Location</label>
            <button
              onClick={detectLocation}
              disabled={geoStatus === 'detecting'}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all border active:scale-[0.98] ${
                geoStatus === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  : geoStatus === 'detecting'
                  ? 'bg-sage-50 dark:bg-sage-900/20 text-sage-600 dark:text-sage-400 border-sage-200 dark:border-sage-800'
                  : geoStatus === 'error'
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                  : 'bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:bg-sage-50 dark:hover:bg-sage-900/20 hover:text-sage-600 dark:hover:text-sage-400 hover:border-sage-200 dark:hover:border-sage-700'
              }`}
            >
              {geoStatus === 'idle' && <><Crosshair className="w-4 h-4" /> Detect My Location</>}
              {geoStatus === 'detecting' && <><Loader2 className="w-4 h-4 animate-spin" /> Detecting...</>}
              {geoStatus === 'success' && <><Check className="w-4 h-4" /> Location Detected</>}
              {geoStatus === 'error' && <><AlertTriangle className="w-4 h-4" /> Detection Failed, Try Again</>}
            </button>

            {geoStatus === 'success' && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-[11px] bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 px-3 py-2 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="font-bold truncate">{detectedLocationName || `(${parseFloat(settingsLat).toFixed(4)}, ${parseFloat(settingsLng).toFixed(4)})`}</span>
                  {locationSource && <span className="text-[9px] text-emerald-500/80 ml-auto shrink-0 uppercase font-bold tracking-wider">via {locationSource}</span>}
                </div>
              </div>
            )}
          </div>

          {/* Fiqh */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Asr Calculation Method (Fiqh)</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSettingsFiqh('1')}
                className={`px-4 py-3 rounded-xl text-sm font-bold transition-all border ${
                  settingsFiqh === '1'
                    ? 'bg-sage-600 dark:bg-sage-700 text-white border-sage-600 dark:border-sage-700 shadow-md'
                    : 'bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700'
                }`}
              >Hanafi</button>
              <button
                onClick={() => setSettingsFiqh('0')}
                className={`px-4 py-3 rounded-xl text-sm font-bold transition-all border ${
                  settingsFiqh === '0'
                    ? 'bg-sage-600 dark:bg-sage-700 text-white border-sage-600 dark:border-sage-700 shadow-md'
                    : 'bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700'
                }`}
              >Shafi / Maliki</button>
            </div>
          </div>

          {/* Hijri Adjustment */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center justify-between">
              <span>Hijri Date Offset</span>
              <span className="text-[9px] text-sage-600 font-bold tracking-wider">(For Moon Sighting)</span>
            </label>
            <div className="flex items-center justify-between bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3">
              <button
                onClick={() => setSettingsHijriOffset(Math.max(-2, settingsHijriOffset - 1))}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-zinc-700 text-gray-600 dark:text-zinc-300 shadow-sm border border-gray-200 dark:border-zinc-600 active:scale-95 transition-all font-bold text-lg"
              >-</button>
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold text-gray-800 dark:text-white">
                  {settingsHijriOffset > 0 ? `+${settingsHijriOffset}` : settingsHijriOffset} Days
                </span>
              </div>
              <button
                onClick={() => setSettingsHijriOffset(Math.min(2, settingsHijriOffset + 1))}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-zinc-700 text-gray-600 dark:text-zinc-300 shadow-sm border border-gray-200 dark:border-zinc-600 active:scale-95 transition-all font-bold text-lg"
              >+</button>
            </div>
          </div>

          {/* Save */}
          <div className="pt-2">
            <button
              onClick={saveSettings}
              disabled={!settingsLat || !settingsLng}
              className="w-full bg-sage-800 hover:bg-sage-900 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold h-[46px] rounded-xl transition-all hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center border border-sage-900 dark:border-emerald-800 shadow-sm"
            >
              <Check className="w-4 h-4 mr-2" /> Save & Activate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
