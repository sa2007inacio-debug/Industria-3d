import React, { useState } from 'react';
import { useIndustrialStore } from './store/industrialStore';
import { HeaderNav } from './components/layout/HeaderNav';
import { FactoryCanvas } from './components/factory3d/FactoryCanvas';
import { MachineDetailDrawer } from './components/panels/MachineDetailDrawer';
import { MachineInspectModal } from './components/panels/MachineInspectModal';
import { SectorsGridView } from './components/views/SectorsGridView';
import { MachinesListView } from './components/views/MachinesListView';
import { FactoryBIView } from './components/views/FactoryBIView';
import { MachineTabletHMI } from './components/hmi/MachineTabletHMI';
import { Esp32ArchitectureView } from './components/views/Esp32ArchitectureView';
import { AlertsModal } from './components/modals/AlertsModal';
import { BatchSimulationModal } from './components/modals/BatchSimulationModal';

export const App: React.FC = () => {
  const {
    sectors,
    machines,
    selectedMachineId,
    selectedMachine,
    selectedSectorId,
    inspectedMachineId,
    inspectedMachine,
    hmiMachineId,
    activeTab,
    cameraFocusTarget,
    navigationRoute,
    isSimulatorRunning,
    alerts,
    selectMachine,
    selectSector,
    setInspectedMachineId,
    setHmiMachineId,
    setActiveTab,
    generateNavigationRoute,
    clearNavigationRoute,
    updateMachineStatus,
    simulatePulse,
    registerScrap,
    toggleMachineWifi,
    acknowledgeAlert,
    setIsSimulatorRunning,
    batchUpdateMachines,
    batchSimulatePulses,
    triggerStressScenario,
    isChaosMode,
    setIsChaosMode,
    totalStressEvents
  } = useIndustrialStore();

  const [showAlertsModal, setShowAlertsModal] = useState<boolean>(false);
  const [showBatchModal, setShowBatchModal] = useState<boolean>(false);

  const unreadAlertCount = alerts.filter((a) => !a.acknowledged).length;

  const handleOpenHmi = (machineId: string) => {
    setHmiMachineId(machineId);
    setActiveTab('hmi-tablet');
  };

  const handleSelectMachineFromOtherViews = (machineId: string) => {
    selectMachine(machineId);
    setActiveTab('3d-map');
  };

  const handleSelectSector = (sectorId: any) => {
    selectSector(sectorId);
    setActiveTab('3d-map');
  };

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-slate-900 text-slate-100 font-sans">
      {/* Top Header Bar following Top Bar Contract */}
      <HeaderNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadAlertCount={unreadAlertCount}
        onOpenAlerts={() => setShowAlertsModal(true)}
        isSimulatorRunning={isSimulatorRunning}
        onToggleSimulator={() => setIsSimulatorRunning(!isSimulatorRunning)}
        onOpenBatchSimulation={() => setShowBatchModal(true)}
        isChaosMode={isChaosMode}
      />

      {/* Main View Area */}
      <main className="flex-1 relative overflow-hidden bg-slate-950">
        {/* TAB 1: 3D Factory Map */}
        {activeTab === '3d-map' && (
          <div className="relative w-full h-full">
            <FactoryCanvas
              sectors={sectors}
              machines={machines}
              selectedMachineId={selectedMachineId}
              selectedSectorId={selectedSectorId}
              cameraFocusTarget={cameraFocusTarget}
              navigationRoute={navigationRoute}
              onSelectMachine={(id) => selectMachine(id)}
              onInspectMachine={(id) => setInspectedMachineId(id)}
              onClearRoute={clearNavigationRoute}
              onOpenBatchSimulation={() => setShowBatchModal(true)}
            />

            {/* Side Drawer for Selected Machine */}
            <MachineDetailDrawer
              machine={selectedMachine}
              onClose={() => selectMachine(null)}
              onInspect={(id) => setInspectedMachineId(id)}
              onOpenHmi={handleOpenHmi}
              onNavigateTo={(id) => generateNavigationRoute(id)}
              onUpdateStatus={updateMachineStatus}
              onSimulatePulse={simulatePulse}
            />
          </div>
        )}

        {/* TAB 2: Sectors Grid */}
        {activeTab === 'sectors' && (
          <div className="w-full h-full overflow-y-auto bg-slate-50 text-slate-900">
            <SectorsGridView
              sectors={sectors}
              machines={machines}
              onSelectSector={handleSelectSector}
              onSelectMachine={handleSelectMachineFromOtherViews}
              onGoTo3D={() => setActiveTab('3d-map')}
            />
          </div>
        )}

        {/* TAB 3: Machines List & Inventory */}
        {activeTab === 'machines' && (
          <div className="w-full h-full overflow-y-auto bg-slate-50 text-slate-900">
            <MachinesListView
              machines={machines}
              onSelectMachine={handleSelectMachineFromOtherViews}
              onInspectMachine={(id) => setInspectedMachineId(id)}
              onOpenHmi={handleOpenHmi}
              onNavigateTo={(id) => {
                generateNavigationRoute(id);
                setActiveTab('3d-map');
              }}
              onGoTo3D={() => setActiveTab('3d-map')}
            />
          </div>
        )}

        {/* TAB 4: BI & OEE Analytics */}
        {activeTab === 'bi' && (
          <div className="w-full h-full overflow-y-auto bg-slate-50 text-slate-900">
            <FactoryBIView
              sectors={sectors}
              machines={machines}
              onSelectMachine={handleSelectMachineFromOtherViews}
            />
          </div>
        )}

        {/* TAB 5: Tablet HMI Mounted on Machine Panel */}
        {activeTab === 'hmi-tablet' && (
          <div className="w-full h-full overflow-y-auto bg-slate-950">
            <MachineTabletHMI
              machines={machines}
              currentMachineId={hmiMachineId}
              onSelectMachine={(id) => setHmiMachineId(id)}
              onUpdateStatus={updateMachineStatus}
              onSimulatePulse={simulatePulse}
              onRegisterScrap={registerScrap}
            />
          </div>
        )}

        {/* TAB 6: IoT Architecture & ESP32 Console */}
        {activeTab === 'iot-arch' && (
          <div className="w-full h-full overflow-y-auto bg-slate-50 text-slate-900">
            <Esp32ArchitectureView
              machines={machines}
              onUpdateStatus={updateMachineStatus}
              onSimulatePulse={simulatePulse}
              onToggleWifi={toggleMachineWifi}
            />
          </div>
        )}
      </main>

      {/* Machine Inspect Modal */}
      {inspectedMachine && (
        <MachineInspectModal
          machine={inspectedMachine}
          onClose={() => setInspectedMachineId(null)}
          onOpenHmi={handleOpenHmi}
        />
      )}

      {/* Alerts Modal */}
      {showAlertsModal && (
        <AlertsModal
          alerts={alerts}
          onClose={() => setShowAlertsModal(false)}
          onAcknowledge={acknowledgeAlert}
          onSelectMachine={handleSelectMachineFromOtherViews}
        />
      )}

      {/* Batch Simulation / Stress Test Modal */}
      {showBatchModal && (
        <BatchSimulationModal
          machines={machines}
          sectors={sectors}
          onClose={() => setShowBatchModal(false)}
          onBatchUpdate={batchUpdateMachines}
          onBatchPulses={batchSimulatePulses}
          onTriggerScenario={triggerStressScenario}
          isChaosMode={isChaosMode}
          onToggleChaos={() => setIsChaosMode(!isChaosMode)}
          totalStressEvents={totalStressEvents}
        />
      )}
    </div>
  );
};

export default App;
