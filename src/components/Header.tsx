'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, CalendarDays, Layers, Moon, Sun, DownloadCloud, MapPin,
  User, Upload, Download, Trash2, Menu, ChevronDown,
} from 'lucide-react';

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
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'layout-dashboard': LayoutDashboard,
  'calendar-days': CalendarDays,
  'layers': Layers,
};

export default function Header({
  isDark, toggleTheme,
  currentTime, currentDateStr,
  mobileMenuOpen, setMobileMenuOpen,
  deferredPrompt, isStandalone, installPWA,
  setSettingsModalOpen, setResetModalOpen, importData,
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

          {/* Profile Dropdown */}
          <ProfileDropdown
            fileInputRef={fileInputRef}
            importData={importData}
            setResetModalOpen={setResetModalOpen}
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
            <MobileProfileSection fileInputRef={fileInputRef} setMobileMenuOpen={setMobileMenuOpen} setResetModalOpen={setResetModalOpen} />
          </div>
        </div>
      )}
    </header>
  );
}

function ProfileDropdown({ fileInputRef, importData, setResetModalOpen }: {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  importData: (file: File) => void;
  setResetModalOpen: (v: boolean) => void;
}) {
  const [open, setOpen] = useState(false);

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
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-zinc-700 py-2 z-50 overflow-hidden">
            <div className="px-4 py-2 mb-1 border-b border-gray-100 dark:border-zinc-700">
              <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Hameez Khan</p>
              <p className="text-[10px] text-gray-500">Premium User</p>
            </div>
            <button
              onClick={() => { fileInputRef.current?.click(); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-sage-50 dark:hover:bg-sage-900/20 text-gray-700 dark:text-gray-300 hover:text-sage-600 dark:hover:text-sage-400 transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" /> Import Data
            </button>
            <a
              href="/api/export"
              target="_blank"
              onClick={() => setOpen(false)}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-sage-50 dark:hover:bg-sage-900/20 text-gray-700 dark:text-gray-300 hover:text-sage-600 dark:hover:text-sage-400 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export Data
            </a>
            <div className="border-t border-gray-100 dark:border-zinc-700 my-1" />
            <button
              onClick={() => { setResetModalOpen(true); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Reset Data
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function MobileProfileSection({ fileInputRef, setMobileMenuOpen, setResetModalOpen }: {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  setMobileMenuOpen: (v: boolean) => void;
  setResetModalOpen: (v: boolean) => void;
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
        <div className="flex flex-col gap-1 pl-4">
          <button onClick={() => { fileInputRef.current?.click(); setMobileMenuOpen(false); }} className="flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm gap-3 text-gray-500 dark:text-gray-400 hover:bg-sage-50 hover:text-sage-600 dark:hover:bg-zinc-800">
            <Upload className="w-4 h-4" /> <span>Import Data</span>
          </button>
          <a href="/api/export" target="_blank" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm gap-3 text-gray-500 dark:text-gray-400 hover:bg-sage-50 hover:text-sage-600 dark:hover:bg-zinc-800">
            <Download className="w-4 h-4" /> <span>Export Data</span>
          </a>
          <button onClick={() => { setResetModalOpen(true); setMobileMenuOpen(false); }} className="flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm gap-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 dark:text-red-400">
            <Trash2 className="w-4 h-4" /> <span>Reset Data</span>
          </button>
        </div>
      )}
    </div>
  );
}
