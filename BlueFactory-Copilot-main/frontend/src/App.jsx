import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout';
import AgvFleetDashboard   from './pages/AgvFleetDashboard';
import MapPage             from './pages/MapPage';
import MissionManagement   from './pages/MissionManagement';
import AgvFleetManager     from './pages/AgvFleetManager';
import DigitalTwinSimulation from './pages/DigitalTwinSimulation';
import SwarmCoordination   from './pages/SwarmCoordination';
import PredictiveMaintenance from './pages/PredictiveMaintenance';
import SafetySettings      from './pages/SafetySettings';
import AiCopilotChat       from './pages/AiCopilotChat';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index                       element={<AgvFleetDashboard />}    />
          <Route path="map"                  element={<MapPage />}              />
          <Route path="mission-management"   element={<MissionManagement />}    />
          <Route path="fleet-manager"        element={<AgvFleetManager />}      />
          <Route path="digital-twin"         element={<DigitalTwinSimulation />} />
          <Route path="swarm-coordination"   element={<SwarmCoordination />}    />
          <Route path="predictive-maintenance" element={<PredictiveMaintenance />} />
          <Route path="safety-settings"      element={<SafetySettings />}       />
          <Route path="ai-copilot"           element={<AiCopilotChat />}        />
          <Route path="*"                    element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;