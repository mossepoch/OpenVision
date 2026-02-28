
import { useState } from 'react';
import StationGrid from './components/StationGrid';
import StationDetail from './components/StationDetail';

export default function MonitoringPage() {
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);

  // Render detail view only when we have a valid station id
  if (selectedStationId) {
    return (
      <StationDetail
        stationId={selectedStationId}
        onBack={() => setSelectedStationId(null)}
      />
    );
  }

  // Otherwise render the grid of stations
  return (
    <StationGrid onSelectStation={(id) => setSelectedStationId(id)} />
  );
}
