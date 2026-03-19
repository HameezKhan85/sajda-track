'use client';

import { AppProvider, useApp } from '@/context/AppContext';
import Header from '@/components/Header';
import SettingsModal from '@/components/modals/SettingsModal';
import DayModal from '@/components/modals/DayModal';
import { ResetModal, AlertModalComponent, Toast, ProcessingOverlay, NotificationToast } from '@/components/modals/SharedModals';
import { useNotifications } from '@/hooks/useNotifications';

function LayoutInner({ children }: { children: React.ReactNode }) {
  const state = useApp();
  const notifs = useNotifications({ prayerTimes: state.prayerTimes, todayLogs: state.todayLogs });

  return (
    <div className="flex flex-col min-h-screen max-h-screen overflow-hidden">
      <Header
        currentView={state.currentView}
        setCurrentView={state.setCurrentView}
        isDark={state.isDark}
        toggleTheme={state.toggleTheme}
        currentTime={state.currentTime}
        currentDateStr={state.currentDateStr}
        mobileMenuOpen={state.mobileMenuOpen}
        setMobileMenuOpen={state.setMobileMenuOpen}
        deferredPrompt={state.deferredPrompt}
        isStandalone={state.isStandalone}
        installPWA={state.installPWA}
        setSettingsModalOpen={state.setSettingsModalOpen}
        setResetModalOpen={state.setResetModalOpen}
        importData={state.importData}
        notifications={notifs.notifications}
        unreadCount={notifs.unreadCount}
        notificationsEnabled={notifs.notificationsEnabled}
        markAllRead={notifs.markAllRead}
        clearNotifications={notifs.clearNotifications}
        dismissNotification={notifs.dismissNotification}
        sendTestNotification={notifs.sendTestNotification}
        enableNotifications={notifs.enableNotifications}
        disableNotifications={notifs.disableNotifications}
      />

      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Shared Modals */}
      <SettingsModal
        open={state.settingsModalOpen}
        onClose={() => state.setSettingsModalOpen(false)}
        settingsLat={state.settingsLat}
        settingsLng={state.settingsLng}
        settingsFiqh={state.settingsFiqh}
        setSettingsFiqh={state.setSettingsFiqh}
        geoStatus={state.geoStatus}
        locationSource={state.locationSource}
        detectedLocationName={state.detectedLocationName}
        detectLocation={state.detectLocation}
        saveSettings={state.saveSettings}
      />

      <DayModal
        open={state.modalOpen}
        onClose={() => state.setModalOpen(false)}
        selectedDate={state.selectedDate}
        selectedDateLogs={state.selectedDateLogs}
        updateStatusDate={state.updateStatusDate}
      />

      <ResetModal
        open={state.resetModalOpen}
        onClose={() => state.setResetModalOpen(false)}
        onConfirm={state.resetData}
      />

      <AlertModalComponent
        alertModal={state.alertModal}
        onClose={() => state.setAlertModal({ ...state.alertModal, open: false })}
      />

      <Toast toast={state.toast} />
      <NotificationToast notification={notifs.notificationToast} onDismiss={() => notifs.setNotificationToast(null)} />

      <ProcessingOverlay
        isProcessing={state.isProcessing}
        title={state.processingTitle}
        message={state.processingMessage}
      />
    </div>
  );
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <LayoutInner>{children}</LayoutInner>
    </AppProvider>
  );
}
