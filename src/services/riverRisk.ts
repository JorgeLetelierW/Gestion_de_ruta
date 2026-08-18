import type { RiverCrossing } from '../types';

export type RiverRiskLevel =
  | 'Normal'
  | 'Vigilancia preventiva'
  | 'Alerta alta de crecida'
  | 'Sin dato';

export interface BasinPointResult {
  name: string;
  lat: number;
  lon: number;

  last6: number;
  last24: number;
  last48: number;
  next24: number;

  maxHour: number;
  wetHours48: number;

  snowfall24: number;
  snowDepth: number;
}

export interface RiverRisk {
  level: RiverRiskLevel;
  emoji: string;
  reason: string;
}

export interface RiverEvaluation {
  risk: RiverRisk;
  points: BasinPointResult[];
}

const OPEN_METEO_URL =
  'https://api.open-meteo.com/v1/forecast';

function parseMetric(value: unknown): number {
  const number = Number(
    String(value ?? '')
      .replace(',', '.')
      .replace(/[^0-9.\-]/g, ''),
  );

  return Number.isFinite(number) ? number : 0;
}

function sumArray(values: unknown[]): number {
  return (values || []).reduce<number>(
    (total, value) => total + parseMetric(value),
    0,
  );
}

function maxArray(values: unknown[]): number {
  return Math.max(
    0,
    ...(values || []).map(parseMetric),
  );
}

function sliceLast<T>(values: T[], amount: number): T[] {
  return (values || []).slice(
    Math.max(0, values.length - amount),
  );
}

/*
 * Consulta las condiciones meteorológicas
 * de un punto representativo de la cuenca.
 */
async function fetchBasinPoint(
  gauge: RiverCrossing['gauges'][number],
): Promise<BasinPointResult> {
  const url =
    `${OPEN_METEO_URL}` +
    `?latitude=${gauge.lat.toFixed(4)}` +
    `&longitude=${gauge.lon.toFixed(4)}` +
    '&hourly=precipitation,rain,showers,snowfall,snow_depth,temperature_2m' +
    '&past_days=2' +
    '&forecast_days=2' +
    '&timezone=auto';

  const response = await fetch(url, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('No fue posible consultar Open-Meteo');
  }

  const json = await response.json();

  const hourly = json.hourly || {};

  const now = Date.now();

  const times = (hourly.time || []).map(
    (time: string) => new Date(time).getTime(),
  );

  let index = times.findIndex(
    (time: number) => time >= now,
  );

  if (index < 0) {
    index = Math.max(0, times.length - 48);
  }

  const precipitation = hourly.precipitation || [];
  const snowfall = hourly.snowfall || [];
  const snowDepth = hourly.snow_depth || [];

  const last48 = sliceLast(
    precipitation.slice(0, index + 1),
    48,
  );

  const last24 = sliceLast(
    precipitation.slice(0, index + 1),
    24,
  );

  const last6 = sliceLast(
    precipitation.slice(0, index + 1),
    6,
  );

  const next24 = precipitation.slice(
    index,
    index + 24,
  );

  return {
    name: gauge.name,
    lat: gauge.lat,
    lon: gauge.lon,

    last6: sumArray(last6),
    last24: sumArray(last24),
    last48: sumArray(last48),
    next24: sumArray(next24),

    maxHour: maxArray(last48),

    wetHours48: last48.filter(
      (value: unknown) => parseMetric(value) >= 0.5,
    ).length,

    snowfall24: sumArray(
      sliceLast(
        snowfall.slice(0, index + 1),
        24,
      ),
    ),

    snowDepth: maxArray(
      sliceLast(
        snowDepth.slice(0, index + 1),
        24,
      ),
    ),
  };
}

/*
 * Clasifica el riesgo de la cuenca.
 *
 * IMPORTANTE:
 * Los umbrales son los mismos utilizados
 * por la versión HTML estable.
 */
export function classifyBasinRisk(
  points: BasinPointResult[],
): RiverRisk {
  if (!points.length) {
    return {
      level: 'Sin dato',
      emoji: '⚪',
      reason:
        'No fue posible recuperar datos meteorológicos',
    };
  }

  const worst = points.reduce((a, b) =>
    b.last48 + b.next24 + b.snowDepth >
    a.last48 + a.next24 + a.snowDepth
      ? b
      : a,
  );

  const maxHour = maxArray(
    points.map((point) => point.maxHour),
  );

  const max24 = maxArray(
    points.map((point) => point.last24),
  );

  const max48 = maxArray(
    points.map((point) => point.last48),
  );

  const maxNext24 = maxArray(
    points.map((point) => point.next24),
  );

  const wetMax = maxArray(
    points.map((point) => point.wetHours48),
  );

  const snowDepth = maxArray(
    points.map((point) => point.snowDepth),
  );

  const snowfall = maxArray(
    points.map((point) => point.snowfall24),
  );

  /*
   * ALERTA ROJA
   */
  const red =
    maxHour >= 15 ||
    max24 >= 70 ||
    max48 >= 100 ||
    (wetMax >= 24 && max48 >= 60) ||
    (snowDepth >= 20 && maxNext24 >= 25) ||
    snowfall >= 15;

  /*
   * VIGILANCIA NARANJA
   */
  const yellow =
    maxHour >= 8 ||
    max24 >= 35 ||
    max48 >= 60 ||
    wetMax >= 18 ||
    (snowDepth >= 10 && maxNext24 >= 15) ||
    snowfall >= 8;

  if (red) {
    return {
      level: 'Alerta alta de crecida',
      emoji: '🔴',
      reason:
        `Lluvia intensa/persistente o nieve relevante. ` +
        `Máx 24h ${max24.toFixed(1)} mm, ` +
        `48h ${max48.toFixed(1)} mm, ` +
        `próxima 24h ${maxNext24.toFixed(1)} mm, ` +
        `nieve ${snowDepth.toFixed(1)} cm. ` +
        `Punto crítico: ${worst.name}`,
    };
  }

  if (yellow) {
    return {
      level: 'Vigilancia preventiva',
      emoji: '🟠',
      reason:
        `Condiciones favorables a aumento de caudal. ` +
        `Máx 24h ${max24.toFixed(1)} mm, ` +
        `48h ${max48.toFixed(1)} mm, ` +
        `próxima 24h ${maxNext24.toFixed(1)} mm, ` +
        `nieve ${snowDepth.toFixed(1)} cm. ` +
        `Punto crítico: ${worst.name}`,
    };
  }

  return {
    level: 'Normal',
    emoji: '🟢',
    reason:
      `Sin señal pluviométrica relevante. ` +
      `Máx 24h ${max24.toFixed(1)} mm, ` +
      `48h ${max48.toFixed(1)} mm, ` +
      `próxima 24h ${maxNext24.toFixed(1)} mm.`,
  };
}

/*
 * Evalúa completamente un río.
 */
export async function evaluateRiverBasin(
  river: RiverCrossing,
): Promise<RiverEvaluation> {
  try {
    const points = await Promise.all(
      (river.gauges || []).map(fetchBasinPoint),
    );

    const risk = classifyBasinRisk(points);

    return {
      risk,
      points,
    };
  } catch {
    return {
      risk: {
        level: 'Sin dato',
        emoji: '⚪',
        reason:
          'No se pudo consultar la API meteorológica en línea',
      },
      points: [],
    };
  }
}
