import { useState } from 'react';

import WeatherPanel from '../../components/WeatherPanel';
import ModulePanel from '../../components/ModulePanel';

export type WeatherView =
  | 'today'
  | 'week';

export default function Clima() {
  const [view, setView] =
    useState<WeatherView>('today');

  return (
    <ModulePanel
      title="Clima"
      fullScreen
      headerActions={
        <div className="weather-header-tabs">

          <button
            type="button"
            className={`weather-header-tab ${
              view === 'today'
                ? 'active'
                : ''
            }`}
            onClick={() =>
              setView('today')
            }
          >
            Hoy
          </button>

          <button
            type="button"
            className={`weather-header-tab ${
              view === 'week'
                ? 'active'
                : ''
            }`}
            onClick={() =>
              setView('week')
            }
          >
            Pronóstico
          </button>

        </div>
      }
    >
      <WeatherPanel
        view={view}
      />
    </ModulePanel>
  );
}
