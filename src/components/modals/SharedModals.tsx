'use client';

import { AlertTriangle, X, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import type { AlertModalState, ToastState } from '@/lib/utils';

// Reset Confirmation Modal
export function ResetModal({ open, onClose, onConfirm }: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-sm shadow-2xl relative z-10 overflow-hidden flex flex-col p-6 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Reset All Data?</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">This will permanently delete all your prayer logs, Qaza backlog, and settings. This action cannot be undone.</p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 h-[42px] bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all text-sm">Cancel</button>
          <button onClick={onConfirm} className="flex-1 h-[42px] bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all text-sm active:scale-95 shadow-sm">Yes, Reset Everything</button>
        </div>
      </div>
    </div>
  );
}

// Alert Modal
export function AlertModalComponent({ alertModal, onClose }: {
  alertModal: AlertModalState;
  onClose: () => void;
}) {
  if (!alertModal.open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-sm shadow-2xl relative z-10 overflow-hidden flex flex-col p-6 text-center">
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
          alertModal.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'
        }`}>
          {alertModal.type === 'success'
            ? <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            : <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          }
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{alertModal.title}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{alertModal.message}</p>
        <button onClick={onClose} className="w-full h-[42px] bg-sage-800 dark:bg-emerald-600 text-white font-bold rounded-xl hover:bg-sage-900 dark:hover:bg-emerald-700 transition-all text-sm active:scale-95 shadow-sm">OK</button>
      </div>
    </div>
  );
}

// Toast
export function Toast({ toast }: { toast: ToastState }) {
  if (!toast.show) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[999] animate-slide-up">
      <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md text-white font-bold text-sm border ${
        toast.type === 'success'
          ? 'bg-emerald-600/90 dark:bg-emerald-700/90 border-emerald-500/30'
          : 'bg-red-600/90 dark:bg-red-700/90 border-red-500/30'
      }`}>
        {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
        <span>{toast.message}</span>
        <div className="absolute bottom-0 left-0 h-[3px] bg-white/40 rounded-full animate-shrink-width w-full" />
      </div>
    </div>
  );
}

// Processing Overlay
export function ProcessingOverlay({ isProcessing, title, message }: {
  isProcessing: boolean;
  title: string;
  message: string;
}) {
  if (!isProcessing) return null;
  return (
    <div className="fixed inset-0 z-[250] bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-sage-600 dark:text-sage-400 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{title}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
}
