'use client';

import { useApp } from '@/context/AppContext';
import QazaTracking from '@/components/QazaTracking';

export default function QazaPage() {
  const state = useApp();

  return (
    <QazaTracking
      qazaData={state.qazaData}
      setQazaData={state.setQazaData}
      totalBacklog={state.totalBacklog}
      monthStats={state.monthStats}
      getTotalQazaCompleted={state.getTotalQazaCompleted}
      getMostCompletedQaza={state.getMostCompletedQaza}
      calculateEstimateDate={state.calculateEstimateDate}
      performQazaAction={state.performQazaAction}
      qazaModalOpen={state.qazaModalOpen}
      setQazaModalOpen={state.setQazaModalOpen}
      qazaCalc={state.qazaCalc}
      setQazaCalc={state.setQazaCalc}
      calculateAndAddQaza={state.calculateAndAddQaza}
    />
  );
}
