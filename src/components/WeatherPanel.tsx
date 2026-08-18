import { useEffect, useState } from 'react';

import { REGION_POINTS } from '../services/mockData';
import {
  fetchWeatherForecast,
  type WeatherForecast,
} from '../services/api';

type WeatherView = 'today' | 'week';

const dayFormatter = new Intl.DateTimeFormat('es-CL', {
  weekday: 'short',
});

export default function WeatherPanel() {
  const [rows, setRows] = useState<
    Array<WeatherForecast | undefined>
  >([]);

  const [view, setView] =
    useState<WeatherView>('today');

  useEffect(() => {
    REGION_POINTS.forEach((point, index) => {
      fetchWeatherForecast(
        point.lat,
        point.lon,
      ).then((forecast) => {
        setRows((current) => {
          const next = [...current];
          next[index] = forecast;
          return next;
        });
      });
    });
  }, []);

  return (
    <>
      <div className="title">
        Clima por sector
      </div>

      {/* SELECTOR HOY / SEMANA */}
      <div className="weather-tabs">
        <button
          type="button"
          className={`weather-tab ${
            view === 'today' ? 'active' : ''
          }`}
          onClick={() => setView('today')}
        >
          Hoy
        </button>

        <button
          type="button"
          className={`weather-tab ${
            view === 'week' ? 'active' : ''
          }`}
          onClick={() => setView('week')}
        >
          Semana
        </button>
      </div>

      {/* CONTENIDO */}
      <div className="weather-list">
        {REGION_POINTS.map((point, index) => {
          const forecast = rows[index];

          return (
            <div
              className="weather-sector-row"
              key={point.name}
            >
              <strong className="weather-sector-name">
                {point.name}
              </strong>

              {/* HOY */}
              {view === 'today' ? (
                <div className="weather-current">
                  {forecast?.current ||
                    'cargando...'}
                </div>
              ) : null}

              {/* SEMANA */}
              {view === 'week' ? (
                <div className="weather-week-scroll">
                  <div className="weather-week-row">
                    {forecast?.days.length ? (
                      forecast.days.map((day) => {
                        const date = new Date(
                          `${day.date}T12:00:00`,
                        );

                        const dayName =
                          dayFormatter
                            .format(date)
                            .replace('.', '');

                        return (
                          <div
                            className="weather-week-day"
                            key={day.date}
                          >
                            <span className="weather-week-name">
                              {dayName}
                            </span>

                            <span className="weather-week-emoji">
                              {day.emoji}
                            </span>

                            <span className="weather-week-temp">
                              {day.min}°/{day.max}°
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <span className="weather-loading">
                        cargando...
                      </span>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </>
  );
}
