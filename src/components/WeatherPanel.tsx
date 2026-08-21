import { useEffect, useState } from 'react';

import type {
  WeatherView,
} from '../pages/Clima';

import { REGION_POINTS } from '../services/mockData';

import {
  fetchWeatherForecast,
  type WeatherForecast,
} from '../services/api';

/*
 * Día de la semana.
 * Ejemplo: sáb
 */
const dayFormatter = new Intl.DateTimeFormat(
  'es-CL',
  {
    weekday: 'short',
  },
);

/*
 * Fecha.
 * Ejemplo: 22/08
 */
const dateFormatter = new Intl.DateTimeFormat(
  'es-CL',
  {
    day: '2-digit',
    month: '2-digit',
  },
);

interface WeatherPanelProps {
  view: WeatherView;
}

export default function WeatherPanel({
  view,
}: WeatherPanelProps) {
  const [rows, setRows] = useState<
    Array<WeatherForecast | undefined>
  >([]);

  /*
   * -------------------------------------------------------
   * CARGAR PRONÓSTICOS
   * -------------------------------------------------------
   */

  useEffect(() => {
    REGION_POINTS.forEach(
      (point, index) => {
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
      },
    );
  }, []);

  /*
   * Primer pronóstico disponible.
   *
   * Lo utilizamos para construir
   * los encabezados de los días.
   */
  const firstForecast = rows.find(
    (row) => row?.days?.length,
  );

  return (
    <div className="weather-panel-content">

      {/* ===================================================
          HOY
          =================================================== */}

      {view === 'today' ? (
        <div className="weather-today-list">

          {REGION_POINTS.map(
            (point, index) => {
              const forecast =
                rows[index];

              return (
                <div
                  className="weather-today-row"
                  key={point.name}
                >
                  <strong>
                    {point.name}
                  </strong>

                  <span>
                    {forecast?.current ||
                      'cargando...'}
                  </span>
                </div>
              );
            },
          )}

        </div>
      ) : null}

      {/* ===================================================
          PRONÓSTICO
          =================================================== */}

      {view === 'week' ? (
        <div className="weather-table-scroll">

          <div className="weather-table">

            {/* =============================================
                ENCABEZADO
                ============================================= */}

            <div className="weather-table-header">

              <div className="weather-location-header">
                Sector
              </div>

              {firstForecast?.days.map(
                (day) => {
                  /*
                   * T12:00 evita problemas de fecha
                   * provocados por zona horaria.
                   */
                  const date = new Date(
                    `${day.date}T12:00:00`,
                  );

                  const dayName =
                    dayFormatter
                      .format(date)
                      .replace('.', '');

                  const formattedDate =
                    dateFormatter.format(
                      date,
                    );

                  return (
                    <div
                      key={day.date}
                      className="weather-day-header"
                    >
                      <div>
                        {dayName}
                      </div>

                      <div className="weather-day-date">
                        {formattedDate}
                      </div>
                    </div>
                  );
                },
              )}

            </div>

            {/* =============================================
                SECTORES
                ============================================= */}

            {REGION_POINTS.map(
              (point, index) => {
                const forecast =
                  rows[index];

                return (
                  <div
                    className="weather-table-row"
                    key={point.name}
                  >

                    <div className="weather-location">
                      {point.name}
                    </div>

                    {forecast?.days.length ? (
                      forecast.days.map(
                        (day) => (
                          <div
                            className="weather-day-cell"
                            key={day.date}
                          >
                            <span className="weather-day-icon">
                              {day.emoji}
                            </span>

                            <span className="weather-day-temperature">
                              {day.min}°/{day.max}°
                            </span>
                          </div>
                        ),
                      )
                    ) : (
                      <div className="weather-table-loading">
                        cargando...
                      </div>
                    )}

                  </div>
                );
              },
            )}

          </div>

        </div>
      ) : null}

    </div>
  );
}
