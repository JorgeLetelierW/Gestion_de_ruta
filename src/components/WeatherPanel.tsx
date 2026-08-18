import { useEffect, useState } from 'react';

import { REGION_POINTS } from '../services/mockData';
import {
  fetchWeatherForecast,
  type WeatherForecast,
} from '../services/api';

const dayFormatter = new Intl.DateTimeFormat('es-CL', {
  weekday: 'short',
});

export default function WeatherPanel() {
  const [rows, setRows] = useState<
    Array<WeatherForecast | undefined>
  >([]);

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

      {REGION_POINTS.map((point, index) => {
        const forecast = rows[index];

        return (
          <div
            className="weather-sector"
            key={point.name}
          >
            <strong className="weather-sector-name">
              {point.name}
            </strong>

            <div className="weather-today">
              <span className="weather-label">
                Hoy
              </span>

              <span>
                {forecast?.current ||
                  'cargando...'}
              </span>
            </div>

            {forecast?.days.length ? (
              <div className="weather-week">
                {forecast.days.map((day) => {
                  /*
                   * Se agrega T12:00 para evitar problemas
                   * de cambio de fecha por zona horaria.
                   */
                  const date = new Date(
                    `${day.date}T12:00:00`,
                  );

                  return (
                    <div
                      className="weather-day"
                      key={day.date}
                    >
                      <span className="weather-day-name">
                        {dayFormatter.format(date)}
                      </span>

                      <span className="weather-day-emoji">
                        {day.emoji}
                      </span>

                      <span className="weather-day-temp">
                        {day.max}°/{day.min}°
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </>
  );
}
