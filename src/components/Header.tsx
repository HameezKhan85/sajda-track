'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, CalendarDays, Layers, Moon, Sun, DownloadCloud, MapPin,
  User, Upload, Download, Trash2, Menu, ChevronDown, Bell,
  Sunrise, CloudSun, Sunset, Sparkles, X, Check, CheckCheck,
  Cloud, CloudOff, RefreshCw, Loader2,
} from 'lucide-react';
import type { AppNotification } from '@/hooks/useNotifications';

const NAV_ITEMS = [
  { id: '/', label: 'Dashboard', icon: 'layout-dashboard' },
  { id: '/calendar', label: 'Calendar', icon: 'calendar-days' },
  { id: '/qaza', label: 'Qaza Tracking', icon: 'layers' },
] as const;

interface HeaderProps {
  currentView: string;
  setCurrentView: (v: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
  currentTime: string;
  currentDateStr: string;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (v: boolean) => void;
  deferredPrompt: Event | null;
  isStandalone: boolean;
  installPWA: () => void;
  setSettingsModalOpen: (v: boolean) => void;
  setResetModalOpen: (v: boolean) => void;
  importData: (file: File) => void;
  exportData: () => void;
  notifications: AppNotification[];
  unreadCount: number;
  markAllRead: () => void;
  clearNotifications: () => void;
  dismissNotification: (id: string) => void;
  // Google Drive
  driveConnected: boolean;
  driveSyncing: boolean;
  lastSyncTime: string | null;
  connectDrive: () => Promise<void>;
  disconnectDrive: () => void;
  syncDrive: () => Promise<void>;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'layout-dashboard': LayoutDashboard,
  'calendar-days': CalendarDays,
  'layers': Layers,
};

const notifPrayericons: Record<string, React.ComponentType<{ className?: string }>> = {
  Fajr: Sunrise, Dhuhr: Sun, Asr: CloudSun, Maghrib: Sunset, Isha: Moon, system: Sparkles,
};

export default function Header({
  isDark, toggleTheme,
  currentTime, currentDateStr,
  mobileMenuOpen, setMobileMenuOpen,
  deferredPrompt, isStandalone, installPWA,
  setSettingsModalOpen, setResetModalOpen, importData, exportData,
  notifications, unreadCount,
  markAllRead, clearNotifications, dismissNotification,
  driveConnected, driveSyncing, lastSyncTime,
  connectDrive, disconnectDrive, syncDrive,
}: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  return (
    <header className="flex-shrink-0 flex items-center justify-between h-16 px-4 sm:px-6 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-40">
      {/* Left & Center */}
      <div className="flex items-center gap-4 sm:gap-6 flex-1">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 flex-shrink-0 bg-sage-50 dark:bg-sage-900/30 rounded-xl flex items-center justify-center text-sage-600 dark:text-sage-400">
            <Moon className="w-6 h-6 fill-current" />
          </div>
          <span className="font-bold text-xl text-sage-900 dark:text-sage-100">Sajda</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 sm:gap-2 mx-2 border-l border-gray-200 dark:border-zinc-700 pl-4 sm:pl-6">
          {NAV_ITEMS.map(item => {
            const Icon = iconMap[item.icon] || LayoutDashboard;
            const isActive = pathname === item.id;
            return (
              <Link
                key={item.id}
                href={item.id}
                className={`flex items-center px-3 py-2 rounded-xl transition-all duration-200 font-medium text-sm gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-sage-50 text-sage-700 dark:bg-sage-900/20 dark:text-sage-300'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4 hidden sm:block" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right */}
      <div className="flex items-center flex-shrink-0">
        <div className="flex flex-col items-end border-r border-gray-200 dark:border-zinc-700 pr-3 sm:pr-4 mr-1 sm:mr-3 space-y-0.5">
          <p suppressHydrationWarning className="text-sm sm:text-lg font-bold tracking-tight text-gray-900 dark:text-white leading-none">{currentTime}</p>
          <p suppressHydrationWarning className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 leading-none mt-0.5">{currentDateStr}</p>
        </div>

        <div className="hidden lg:flex items-center gap-1 sm:gap-3">
          <button onClick={toggleTheme} className="p-2 text-gray-400 hover:text-sage-600 transition-colors relative" title="Toggle Theme">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {deferredPrompt && !isStandalone && (
            <button onClick={installPWA} className="hide-in-pwa p-2 text-sage-500 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300 transition-colors relative" title="Install App">
              <DownloadCloud className="w-5 h-5" />
            </button>
          )}

          <button onClick={() => setSettingsModalOpen(true)} className="p-2 text-gray-400 hover:text-sage-600 transition-colors relative" title="Prayer Settings">
            <MapPin className="w-5 h-5" />
          </button>

          {/* Notifications Dropdown */}
          <NotificationDropdown
            notifications={notifications}
            unreadCount={unreadCount}
            markAllRead={markAllRead}
            clearNotifications={clearNotifications}
            dismissNotification={dismissNotification}
          />

          {/* Profile Dropdown */}
          <ProfileDropdown
            fileInputRef={fileInputRef}
            exportData={exportData}
            setResetModalOpen={setResetModalOpen}
            driveConnected={driveConnected}
            driveSyncing={driveSyncing}
            lastSyncTime={lastSyncTime}
            connectDrive={connectDrive}
            disconnectDrive={disconnectDrive}
            syncDrive={syncDrive}
          />
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden ml-2 p-1.5 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-500 bg-gray-50 dark:bg-zinc-800 hover:text-sage-600 transition-colors">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) importData(file);
          e.target.value = '';
        }}
      />

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-black/20 dark:bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 shadow-xl z-50 lg:hidden flex flex-col p-4 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto overscroll-contain">
          <nav className="flex flex-col gap-2">
            {NAV_ITEMS.map(item => {
              const Icon = iconMap[item.icon] || LayoutDashboard;
              const isActive = pathname === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.id}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm gap-3 ${
                    isActive
                      ? 'bg-sage-50 text-sage-700 dark:bg-sage-900/20 dark:text-sage-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-gray-100 dark:border-zinc-800 pt-2 mt-2 flex flex-col gap-2">
            <button onClick={() => { toggleTheme(); setMobileMenuOpen(false); }} className="flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm gap-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span>Toggle Theme</span>
            </button>
            <button onClick={() => { setSettingsModalOpen(true); setMobileMenuOpen(false); }} className="flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm gap-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800">
              <MapPin className="w-5 h-5" />
              <span>Location Settings</span>
            </button>

            {/* Mobile Notifications */}
            <MobileNotificationSection
              notifications={notifications}
              unreadCount={unreadCount}
              markAllRead={markAllRead}
              clearNotifications={clearNotifications}
              setMobileMenuOpen={setMobileMenuOpen}
            />

            <MobileProfileSection
              fileInputRef={fileInputRef}
              setMobileMenuOpen={setMobileMenuOpen}
              setResetModalOpen={setResetModalOpen}
              exportData={exportData}
              driveConnected={driveConnected}
              driveSyncing={driveSyncing}
              lastSyncTime={lastSyncTime}
              connectDrive={connectDrive}
              disconnectDrive={disconnectDrive}
              syncDrive={syncDrive}
            />
          </div>
        </div>
      )}
    </header>
  );
}

// ─── Notification Dropdown (Desktop) ───
function NotificationDropdown({
  notifications, unreadCount,
  markAllRead, clearNotifications, dismissNotification,
}: {
  notifications: AppNotification[];
  unreadCount: number;
  markAllRead: () => void;
  clearNotifications: () => void;
  dismissNotification: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-gray-400 hover:text-sage-600 transition-colors relative"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-zinc-900 animate-pulse" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-zinc-700 z-50 overflow-hidden flex flex-col max-h-[420px]">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-700 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                )}
              </div>
              <div className="flex items-center gap-1">

                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="p-1.5 text-gray-400 hover:text-sage-600 transition-colors rounded-lg hover:bg-sage-50 dark:hover:bg-sage-900/20" title="Mark all read">
                    <CheckCheck className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Notification List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-zinc-700 flex items-center justify-center text-gray-300 dark:text-zinc-500 mb-3">
                    <Bell className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-medium text-gray-400 dark:text-zinc-500">No notifications yet</p>
                  <p className="text-[10px] text-gray-300 dark:text-zinc-600 mt-1">Prayer reminders will appear here</p>
                </div>
              ) : (
                notifications.map(n => {
                  const NIcon = notifPrayericons[n.icon] || Bell;
                  return (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 dark:border-zinc-700/50 hover:bg-gray-50 dark:hover:bg-zinc-700/30 transition-colors ${
                        !n.read ? 'bg-sage-50/50 dark:bg-sage-900/10' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        !n.read
                          ? 'bg-[#f0f4f1] dark:bg-emerald-900/30 text-[#3a5245] dark:text-emerald-400'
                          : 'bg-gray-100 dark:bg-zinc-700 text-gray-400 dark:text-zinc-500'
                      }`}>
                        <NIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold leading-tight ${!n.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{n.title}</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
                        <p className="text-[9px] text-gray-400 dark:text-zinc-500 mt-1 uppercase tracking-wide font-medium">{timeAgo(n.timestamp)}</p>
                      </div>
                      <button onClick={() => dismissNotification(n.id)} className="p-1 text-gray-300 dark:text-zinc-600 hover:text-red-400 transition-colors shrink-0 mt-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-3 py-2 border-t border-gray-100 dark:border-zinc-700 flex items-center gap-2 shrink-0">

              {notifications.length > 0 && (
                <button
                  onClick={clearNotifications}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-bold text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Profile Dropdown (Desktop) ───
function ProfileDropdown({ fileInputRef, exportData, setResetModalOpen, driveConnected, driveSyncing, lastSyncTime, connectDrive, disconnectDrive, syncDrive }: {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  exportData: () => void;
  setResetModalOpen: (v: boolean) => void;
  driveConnected: boolean;
  driveSyncing: boolean;
  lastSyncTime: string | null;
  connectDrive: () => Promise<void>;
  disconnectDrive: () => void;
  syncDrive: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  function formatSyncTime(iso: string | null): string {
    if (!iso) return 'Never';
    try {
      const d = new Date(iso);
      return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return 'Unknown'; }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full bg-sage-100 dark:bg-sage-900 border border-sage-200 dark:border-sage-800 text-sage-600 dark:text-sage-300 flex items-center justify-center font-bold text-xs ring-2 ring-transparent hover:ring-sage-200 focus:outline-none transition-all cursor-pointer"
      >
        HK
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-zinc-800 py-1 z-50 overflow-hidden text-sm">
            
            <div className="px-5 py-3 border-b border-gray-100 dark:border-zinc-800">
              <p className="font-bold text-gray-900 dark:text-white leading-none">Profile</p>
              <p className="text-xs text-sage-600 dark:text-sage-500 font-medium mt-1">Sajda Local User</p>
            </div>

            <div className="py-2">
              <p className="px-5 text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Data & Sync</p>
              
              {/* Drive Card */}
              <div className="px-3 mb-2">
                <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-3 border border-gray-100 dark:border-zinc-700/50">
                  {driveConnected ? (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <Cloud className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Google Drive</span>
                        </div>
                        <button
                          onClick={() => { disconnectDrive(); setOpen(false); }}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Disconnect"
                        >
                          <CloudOff className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2.5">
                        Last sync: <span className="font-medium text-gray-700 dark:text-gray-300">{formatSyncTime(lastSyncTime)}</span>
                      </p>
                      <button
                        onClick={() => { syncDrive(); }}
                        disabled={driveSyncing}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-sage-600 hover:bg-sage-700 dark:bg-sage-500 dark:hover:bg-sage-600 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {driveSyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                        {driveSyncing ? 'Syncing...' : 'Sync Now'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => { connectDrive(); }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-600 border border-gray-200 dark:border-zinc-600 rounded-lg transition-colors shadow-sm"
                    >
                      <Cloud className="w-4 h-4 text-blue-500" /> Connect Drive
                    </button>
                  )}
                </div>
              </div>

              {/* Import/Export */}
              <button
                onClick={() => { fileInputRef.current?.click(); setOpen(false); }}
                className="w-full text-left px-5 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800/50 text-gray-700 dark:text-gray-300 transition-colors flex items-center gap-3"
              >
                <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-gray-200 dark:border-zinc-700">
                  <Upload className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-xs leading-tight">Import CSV</p>
                  <p className="text-[10px] text-gray-400 dark:text-zinc-500">Restore from local file</p>
                </div>
              </button>
              
              <button
                onClick={() => { exportData(); setOpen(false); }}
                className="w-full text-left px-5 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800/50 text-gray-700 dark:text-gray-300 transition-colors flex items-center gap-3"
              >
                <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-gray-200 dark:border-zinc-700">
                  <Download className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-xs leading-tight">Export CSV</p>
                  <p className="text-[10px] text-gray-400 dark:text-zinc-500">Save backup to device</p>
                </div>
              </button>
            </div>

            <div className="border-t border-gray-100 dark:border-zinc-800" />
            
            <div className="py-1">
              <button
                onClick={() => { setResetModalOpen(true); setOpen(false); }}
                className="w-full text-left px-5 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center gap-3"
              >
                <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0 border border-red-100 dark:border-red-900/30">
                  <Trash2 className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium text-xs">Reset All Data</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Mobile Notification Section ───
function MobileNotificationSection({
  notifications, unreadCount,
  markAllRead, clearNotifications, setMobileMenuOpen,
}: {
  notifications: AppNotification[];
  unreadCount: number;
  markAllRead: () => void;
  clearNotifications: () => void;
  setMobileMenuOpen: (v: boolean) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 w-full">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5" />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-full">{unreadCount}</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="flex flex-col gap-1 pl-4">


          {/* Mark read */}
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm gap-3 text-gray-500 dark:text-gray-400 hover:bg-sage-50 hover:text-sage-600 dark:hover:bg-zinc-800"
            >
              <Check className="w-4 h-4" /> <span>Mark All Read</span>
            </button>
          )}

          {/* Clear */}
          {notifications.length > 0 && (
            <button
              onClick={() => { clearNotifications(); }}
              className="flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm gap-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 dark:text-red-400"
            >
              <Trash2 className="w-4 h-4" /> <span>Clear All</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Mobile Profile Section ───
function MobileProfileSection({ fileInputRef, setMobileMenuOpen, setResetModalOpen, exportData, driveConnected, driveSyncing, lastSyncTime, connectDrive, disconnectDrive, syncDrive }: {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  setMobileMenuOpen: (v: boolean) => void;
  setResetModalOpen: (v: boolean) => void;
  exportData: () => void;
  driveConnected: boolean;
  driveSyncing: boolean;
  lastSyncTime: string | null;
  connectDrive: () => Promise<void>;
  disconnectDrive: () => void;
  syncDrive: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 w-full">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5" />
          <span>Profile (Sajda)</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="flex flex-col gap-3 pl-4 py-1 pr-2">
          
          <div className="bg-gray-50 dark:bg-zinc-800/40 rounded-2xl p-3 border border-gray-100 dark:border-zinc-700/50 flex flex-col gap-3">
            <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider text-center">Data & Sync</p>
            
            {/* Drive */}
            {driveConnected ? (
              <div className="bg-white dark:bg-zinc-800 rounded-xl p-3 border border-gray-200 dark:border-zinc-700/80 shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <Cloud className="w-4 h-4 text-emerald-500" />
                     <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Google Drive</span>
                   </div>
                   <button onClick={() => { disconnectDrive(); setMobileMenuOpen(false); }} className="text-gray-400 hover:text-red-500 p-1.5 bg-gray-50 dark:bg-zinc-700 rounded-full transition-colors">
                     <CloudOff className="w-3.5 h-3.5" />
                   </button>
                </div>
                <button
                  onClick={() => { syncDrive(); }}
                  disabled={driveSyncing}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-bold text-white bg-sage-600 hover:bg-sage-700 rounded-xl transition-colors disabled:opacity-50"
                >
                  {driveSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  <span>{driveSyncing ? 'Syncing...' : 'Sync Now'}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => { connectDrive(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-600 border border-gray-200 dark:border-zinc-600 rounded-xl transition-colors shadow-sm"
              >
                <Cloud className="w-5 h-5 text-blue-500" /> <span>Connect Drive</span>
              </button>
            )}

            <div className="grid grid-cols-2 gap-2 mt-1">
              <button onClick={() => { fileInputRef.current?.click(); setMobileMenuOpen(false); }} className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-white dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700 transition-colors shadow-sm">
                <div className="bg-gray-50 dark:bg-zinc-700 p-2 rounded-lg">
                  <Upload className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Import CSV</span>
              </button>
              <button onClick={() => { exportData(); setMobileMenuOpen(false); }} className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-white dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700 transition-colors shadow-sm">
                <div className="bg-gray-50 dark:bg-zinc-700 p-2 rounded-lg">
                  <Download className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Export CSV</span>
              </button>
            </div>
            
          </div>

          <button onClick={() => { setResetModalOpen(true); setMobileMenuOpen(false); }} className="flex items-center justify-center px-4 py-3 rounded-xl transition-all duration-200 text-sm font-bold gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 w-full mb-2 border border-red-100 dark:border-red-900/30">
            <Trash2 className="w-4 h-4" /> <span>Reset All Data</span>
          </button>
        </div>
      )}
    </div>
  );
}
