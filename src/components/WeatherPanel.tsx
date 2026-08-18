import { useEffect, useState } from 'react';

import { REGION_POINTS } from '../services/mockData';
import { fetchWeatherAt } from '../services/api';

export default function WeatherPanel() {
  const [rows, setRows] = useState<string[]>([]);

  useEffect(() => {
    REGION_POINTS.forEach((point, index) => {
      fetchWeatherAt(point.lat, point.lon).then((text) => {
        setRows((current) => {
          const next = [...current];

          next[index] = text;

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

      {REGION_POINTS.map((point, index) => (
        <div
          className="weather-item"
          key={point.name}
        >
          <b>{point.name}</b>

          <span>
            {rows[index] || 'cargando...'}
          </span>
        </div>
      ))}
    </>
  );
}
