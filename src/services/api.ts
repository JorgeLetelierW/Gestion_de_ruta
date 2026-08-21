import * as XLSX from 'xlsx';

import type {
  AppData,
  InfraClass,
  InfraItem,
  WorkClass,
  Trabajo,
  RouteKey,
} from '../types';

import { INFRA } from './mockData';

/* =========================================================
   UTILIDADES GENERALES
   ========================================================= */

export const norm = (v: any) =>
  String(v ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();

export const clean = (v: any) =>
  String(v ?? '')
    .replace(/_x000D_/g, '')
    .trim();

export function num(v: any) {
  if (typeof v === 'number') {
    return Number.isFinite(v) ? v : NaN;
  }

  let s = String(v ?? '')
    .trim()
    .toUpperCase()
    .replace(/KM/g, '')
    .replace(/\s/g, '');

  const m = s.match(
    /(-?\d+(?:[\.,]\d+)?)\+(\d{1,3})/,
  );

  if (m) {
    return (
      parseFloat(m[1].replace(',', '.')) +
      parseFloat(m[2].padEnd(3, '0')) / 1000
    );
  }

  s = s
    .replace(',', '.')
    .replace(/[^0-9.\-]/g, '');

  const p = s.split('.');

  if (p.length > 2) {
    s = p[0] + '.' + p.slice(1).join('');
  }

  const n = parseFloat(s);

  return Number.isFinite(n) ? n : NaN;
}

export const routeOf = (v: any): RouteKey => {
  const s = norm(v);

  return (
    s.includes('ASS') ||
    s.includes('ACCESO SUR') ||
    s.includes('TUNEL')
  )
    ? 'ASS'
    : 'R5';
};

/* =========================================================
   UTILIDADES DE HORARIO
   ========================================================= */

const pad = (n: any) =>
  String(n).padStart(2, '0');

function fmtHora(v: any) {
  if (v == null || v === '') {
    return '';
  }

  if (
    v instanceof Date &&
    !isNaN(+v)
  ) {
    return (
      pad(v.getHours()) +
      ':' +
      pad(v.getMinutes())
    );
  }

  if (
    typeof v === 'number' &&
    Number.isFinite(v)
  ) {
    const f = ((v % 1) + 1) % 1;

    const tm = Math.round(
      f * 24 * 60,
    );

    const h =
      Math.floor(tm / 60) % 24;

    const m =
      tm % 60;

    return (
      pad(h) +
      ':' +
      pad(m)
    );
  }

  const s =
    String(v).trim();

  const m = s.match(
    /(?:\d{1,2}\/\d{1,2}\/\d{2,4}\s+)?(\d{1,2}):(\d{2})(?::\d{2})?/,
  );

  return m
    ? pad(m[1]) + ':' + m[2]
    : s;
}

/* =========================================================
   UTILIDADES EXCEL
   ========================================================= */

function rows(
  wb: XLSX.WorkBook,
  sh: string,
) {
  return XLSX.utils.sheet_to_json<any[]>(
    wb.Sheets[sh],
    {
      header: 1,
      defval: '',
      blankrows: false,
    },
  );
}

function findHeader(
  rs: any[][],
  need: string[],
) {
  for (
    let i = 0;
    i < Math.min(rs.length, 12);
    i++
  ) {
    const line =
      rs[i]
        .map(norm)
        .join('|');

    if (
      need.every((n) =>
        line.includes(n),
      )
    ) {
      return {
        row: i,
      };
    }
  }

  return null;
}

function mapHeaders(
  row: any[],
  preferFrom = 0,
) {
  const cols: any = {};

  row.forEach((v, i) => {
    const h = norm(v);

    if (
      !h ||
      i < preferFrom
    ) {
      return;
    }

    if (h.includes('RUTA')) {
      cols.ruta ??= i;
    } else if (
      h.includes('FECHA')
    ) {
      cols.fecha ??= i;
    } else if (
      h.includes('RESPONSABLE')
    ) {
      cols.responsable = i;
    } else if (
      h.includes('TIPO DE TRABAJOS') ||
      h === 'ACTIVIDAD'
    ) {
      cols.trabajo ??= i;
    } else if (
      h.includes('CONTRATISTA')
    ) {
      cols.contratista = i;
    } else if (
      h.includes('KM INICIAL')
    ) {
      cols.kmInicial ??= i;
    } else if (
      h.includes('KM FINAL')
    ) {
      cols.kmFinal ??= i;
    } else if (
      h.includes('LONGITUD')
    ) {
      cols.longitud = i;
    } else if (
      h.includes('PISTA')
    ) {
      cols.pistas ??= i;
    } else if (
      h.includes('CALZADA')
    ) {
      cols.calzada = i;
    } else if (
      h.includes('SECTOR')
    ) {
      cols.sector = i;
    } else if (
      h.includes('HORARIO')
    ) {
      cols.horario = i;
    } else if (
      h.includes('HORA INICIO')
    ) {
      cols.horaInicio = i;
    } else if (
      h.includes('HORA FINAL')
    ) {
      cols.horaFinal = i;
    } else if (
      h.includes('OBSERVACION')
    ) {
      cols.observacion = i;
    }
  });

  return cols;
}

const val = (
  r: any[],
  i: any,
) =>
  i == null
    ? ''
    : clean(r[i]);

/* =========================================================
   INFRAESTRUCTURA
   ========================================================= */

/*
 * El Excel usa nombres de hojas en plural:
 *
 * Enlaces
 * Pasarelas
 * Atraviesos
 * Puentes
 *
 * La aplicación utiliza nombres de capa
 * en singular.
 */

const INFRA_SHEET_MAP: Record<
  string,
  InfraClass
> = {
  TRONCAL: 'Troncal',

  ENLACE: 'Enlace',
  ENLACES: 'Enlace',

  PASARELA: 'Pasarela',
  PASARELAS: 'Pasarela',

  PMV: 'PMV',

  'PEAJE LATERAL':
    'Peaje lateral',

  ATRAVIESO: 'Atravieso',
  ATRAVIESOS: 'Atravieso',

  PUENTE: 'Puente',
  PUENTES: 'Puente',
};

/*
 * Lee las columnas del inventario.
 *
 * Columnas principales:
 *
 * A → nombre
 * B → km
 * C → ruta
 *
 * Cuando existen:
 *
 * D → lado
 * E → marca
 */

function parseInfraRow(
  row: any[],
): InfraItem | null {
  const nombre =
    clean(row[0]);

  const km =
    num(row[1]);

  const ruta =
    clean(row[2]);

  if (
    !nombre ||
    !Number.isFinite(km) ||
    km < 0 ||
    km > 219
  ) {
    return null;
  }

  const item: InfraItem = {
    nombre,
    km,
    ruta,
    route: routeOf(ruta),
  };

  const lado =
    clean(row[3]);

  const marca =
    clean(row[4]);

  if (lado) {
    item.lado = lado;
  }

  if (marca) {
    item.marca = marca;
  }

  return item;
}

/* =========================================================
   TRABAJOS
   ========================================================= */

function workObj(
  tipo: WorkClass,
  r: any[],
  c: any,
  trabajo: string,
  k1: number,
  k2: number,
  km: number,
): Trabajo {
  const ruta =
    tipo === 'Día'
      ? (
          val(r, c.rutaPanel) ||
          val(r, c.ruta) ||
          val(r, 1)
        )
      : val(r, c.ruta);

  const route =
    routeOf(ruta);

  return {
    tipo,

    nombre: trabajo,
    trabajo,

    km,

    ruta,
    route,

    fecha:
      val(r, c.fecha) ||
      val(r, c.fechaPanel),

    responsable:
      val(r, c.responsable),

    contratista:
      val(r, c.contratista),

    kmInicial: k1,
    kmFinal: k2,

    longitud:
      val(r, c.longitud),

    pistas:
      val(r, c.pistas),

    calzada:
      val(r, c.calzada),

    sector:
      val(r, c.sector),

    horario:
      val(r, c.horario),

    horaInicio:
      fmtHora(r[c.horaInicio]),

    horaFinal:
      fmtHora(r[c.horaFinal]),

    observacion:
      val(r, c.observacion),

    estadoManual:
      'Programado',

    horaInicioReal: '',
    horaTerminoReal: '',
  };
}

/* =========================================================
   CARGA DE ARCHIVOS
   ========================================================= */

export async function parseWorkbookFile(
  file: File,
  base: AppData,
  kind: 'classes' | 'works',
) {
  const buf =
    await file.arrayBuffer();

  const wb =
    XLSX.read(buf, {
      type: 'array',
      cellDates: true,
    });

  /*
   * Copia independiente del estado actual.
   *
   * Importante:
   * ahora incluye las 7 clases
   * de infraestructura.
   */

  const next: AppData = {
    ...base,

    Troncal:
      [...base.Troncal],

    Enlace:
      [...base.Enlace],

    Pasarela:
      [...base.Pasarela],

    PMV:
      [...base.PMV],

    'Peaje lateral':
      [...base['Peaje lateral']],

    Atravieso:
      [...base.Atravieso],

    Puente:
      [...base.Puente],

    Noche:
      [...base.Noche],

    Día:
      [...base.Día],
  };

  let total = 0;

  /* =======================================================
     CARGA DE CLASES / INFRAESTRUCTURA
     ======================================================= */

  if (kind === 'classes') {
    /*
     * Al cargar un nuevo CLASES.xlsx
     * reemplazamos el inventario actual.
     */

    INFRA.forEach((cls) => {
      next[cls] = [];
    });

    wb.SheetNames.forEach(
      (sheetName) => {
        const normalized =
          norm(sheetName);

        /*
         * Curvas se ignora deliberadamente.
         */

        if (
          normalized === 'CURVA' ||
          normalized === 'CURVAS'
        ) {
          return;
        }

        const cls =
          INFRA_SHEET_MAP[
            normalized
          ];

        if (!cls) {
          return;
        }

        const rs =
          rows(wb, sheetName);

        /*
         * La primera fila corresponde
         * a encabezados.
         */

        rs
          .slice(1)
          .forEach((row) => {
            const item =
              parseInfraRow(row);

            if (!item) {
              return;
            }

            next[cls].push(item);

            total++;
          });
      },
    );
  }

  /* =======================================================
     CARGA DE TRABAJOS
     ======================================================= */

  else {
    next.Noche = [];
    next.Día = [];

    const map: any = {};

    wb.SheetNames.forEach(
      (s) => {
        map[norm(s)] = s;
      },
    );

    const load = (
      tipo: WorkClass,
    ) => {
      const name =
        tipo === 'Noche'
          ? map.NOCHE
          : (
              map.DIA ||
              map['DÍA']
            );

      if (!name) {
        return;
      }

      const rs =
        rows(wb, name);

      const hdr =
        findHeader(
          rs,
          [
            'TIPO DE TRABAJOS',
            'CONTRATISTA',
            'KM INICIAL',
            'HORA INICIO',
            'RESPONSABLE',
          ],
        );

      let cols: any;

      let start = 4;

      if (hdr) {
        cols =
          tipo === 'Día'
            ? {
                ...mapHeaders(
                  rs[hdr.row],
                  11,
                ),

                rutaPanel:
                  mapHeaders(
                    rs[hdr.row],
                    0,
                  ).ruta,

                fechaPanel:
                  mapHeaders(
                    rs[hdr.row],
                    0,
                  ).fecha,
              }
            : mapHeaders(
                rs[hdr.row],
              );

        start =
          hdr.row + 1;
      } else {
        cols =
          tipo === 'Día'
            ? {
                rutaPanel: 1,
                fechaPanel: 2,

                ruta: 1,
                fecha: 2,

                trabajo: 4,

                kmInicial: 5,
                kmFinal: 6,

                pistas: 7,
                calzada: 8,
                sector: 9,
              }
            : {
                ruta: 1,

                responsable: 3,

                trabajo: 4,

                contratista: 5,

                kmInicial: 6,
                kmFinal: 7,

                longitud: 8,

                pistas: 9,
                calzada: 10,
                sector: 11,

                horario: 12,

                horaInicio: 13,
                horaFinal: 14,

                fecha: 15,

                observacion: 16,
              };
      }

      rs
        .slice(start)
        .forEach((r) => {
          const trabajo =
            clean(
              r[cols.trabajo],
            );

          const k1 =
            num(
              r[cols.kmInicial],
            );

          const k2 =
            num(
              r[cols.kmFinal],
            );

          const km =
            (k1 + k2) / 2;

          if (
            trabajo &&
            Number.isFinite(km) &&
            km >= 0 &&
            km <= 219
          ) {
            next[tipo].push(
              workObj(
                tipo,
                r,
                cols,
                trabajo,
                k1,
                k2,
                km,
              ),
            );

            total++;
          }
        });
    };

    load('Noche');
    load('Día');
  }

  return {
    data: next,
    total,
  };
}

/* =========================================================
   CLIMA ACTUAL
   ========================================================= */

export async function fetchWeatherAt(
  lat: number,
  lon: number,
) {
  const u =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat.toFixed(4)}` +
    `&longitude=${lon.toFixed(4)}` +
    `&current=temperature_2m,wind_speed_10m,weather_code,is_day` +
    `&timezone=auto` +
    `&forecast_days=1`;

  try {
    const r =
      await fetch(u);

    if (!r.ok) {
      throw new Error(
        'weather',
      );
    }

    const j =
      await r.json();

    const c =
      j.current;

    const codes: any = {
      0: 'Despejado',
      1: 'Mayormente despejado',
      2: 'Parcialmente nublado',
      3: 'Nublado',
      45: 'Neblina',
      48: 'Neblina con escarcha',
      51: 'Llovizna ligera',
      53: 'Llovizna',
      55: 'Llovizna intensa',
      61: 'Lluvia ligera',
      63: 'Lluvia',
      65: 'Lluvia intensa',
      71: 'Nieve ligera',
      73: 'Nieve',
      75: 'Nieve intensa',
      80: 'Chubascos ligeros',
      81: 'Chubascos',
      82: 'Chubascos intensos',
      95: 'Tormenta',
    };

    return (
      `${codes[c.weather_code] || 'Condiciones variables'}` +
      ` · ${Math.round(c.temperature_2m)}°C` +
      ` · viento ${Math.round(c.wind_speed_10m)} km/h`
    );
  } catch {
    return 'Clima no disponible';
  }
}

/* =========================================================
   PRONÓSTICO
   ========================================================= */

export interface WeatherForecastDay {
  date: string;
  weatherCode: number;
  emoji: string;
  max: number;
  min: number;
}

export interface WeatherForecast {
  current: string;
  days: WeatherForecastDay[];
}

function weatherEmoji(
  code: number,
): string {
  if (code === 0) {
    return '☀️';
  }

  if (
    code === 1 ||
    code === 2
  ) {
    return '🌤️';
  }

  if (code === 3) {
    return '☁️';
  }

  if (
    code === 45 ||
    code === 48
  ) {
    return '🌫️';
  }

  if (
    code === 51 ||
    code === 53 ||
    code === 55
  ) {
    return '🌦️';
  }

  if (
    code === 61 ||
    code === 63 ||
    code === 65 ||
    code === 80 ||
    code === 81 ||
    code === 82
  ) {
    return '🌧️';
  }

  if (
    code === 71 ||
    code === 73 ||
    code === 75
  ) {
    return '🌨️';
  }

  if (code === 95) {
    return '⛈️';
  }

  return '🌤️';
}

export async function fetchWeatherForecast(
  lat: number,
  lon: number,
): Promise<WeatherForecast> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat.toFixed(4)}` +
    `&longitude=${lon.toFixed(4)}` +
    `&current=temperature_2m,wind_speed_10m,weather_code,is_day` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
    `&timezone=auto` +
    `&forecast_days=16`;

  try {
    const response =
      await fetch(url);

    if (!response.ok) {
      throw new Error(
        'weather',
      );
    }

    const data =
      await response.json();

    const current =
      data.current;

    const codes: Record<
      number,
      string
    > = {
      0: 'Despejado',
      1: 'Mayormente despejado',
      2: 'Parcialmente nublado',
      3: 'Nublado',
      45: 'Neblina',
      48: 'Neblina con escarcha',
      51: 'Llovizna ligera',
      53: 'Llovizna',
      55: 'Llovizna intensa',
      61: 'Lluvia ligera',
      63: 'Lluvia',
      65: 'Lluvia intensa',
      71: 'Nieve ligera',
      73: 'Nieve',
      75: 'Nieve intensa',
      80: 'Chubascos ligeros',
      81: 'Chubascos',
      82: 'Chubascos intensos',
      95: 'Tormenta',
    };

    const currentText =
      `${codes[current.weather_code] || 'Condiciones variables'}` +
      ` · ${Math.round(current.temperature_2m)}°C` +
      ` · viento ${Math.round(current.wind_speed_10m)} km/h`;

    const days:
      WeatherForecastDay[] =
      data.daily.time
        .slice(1)
        .map(
          (
            date: string,
            index: number,
          ) => {
            const dailyIndex =
              index + 1;

            const code =
              data.daily
                .weather_code[
                  dailyIndex
                ];

            return {
              date,

              weatherCode:
                code,

              emoji:
                weatherEmoji(
                  code,
                ),

              max:
                Math.round(
                  data.daily
                    .temperature_2m_max[
                      dailyIndex
                    ],
                ),

              min:
                Math.round(
                  data.daily
                    .temperature_2m_min[
                      dailyIndex
                    ],
                ),
            };
          },
        );

    return {
      current:
        currentText,

      days,
    };
  } catch {
    return {
      current:
        'Clima no disponible',

      days: [],
    };
  }
}
