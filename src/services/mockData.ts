import type {
  AppData,
  InfraItem,
  RegionPoint,
  RiverCrossing,
} from '../types';

import { BASE_INFRASTRUCTURE } from '../data/infrastructure';

/* =========================================================
   CONFIGURACIÓN GENERAL
   ========================================================= */

export const CFG = {
  kmMin: 0,
  kmMax: 219,

  r5Min: 29,
  r5Max: 219,

  assMin: 0,
  assLineEnd: 40,
  assConnectEnd: 43.5,

  zMin: 0.5,
  zMax: 30,

  textBase: 14,
  textMin: 8,
  textMax: 30,
  textStep: 2,

  clusterGapKm: 0.2,
  visualStepKm: 0.1,
  tourZoom: 3.5,
};

/* =========================================================
   COLORES
   ========================================================= */

export const COLORS: Record<string, string> = {
  Troncal: '#00a6ff',
  Enlace: '#39ff88',
  Pasarela: '#d1d5db',
  PMV: '#ffd400',

  'Peaje lateral': '#4be3d1',

  Atravieso: '#c084fc',
  Puente: '#fb923c',

  Noche: '#4fc3f7',
  Día: '#ffd600',
};

/* =========================================================
   CLASES DE INFRAESTRUCTURA
   ========================================================= */

export const INFRA = [
  'Troncal',
  'Enlace',
  'Pasarela',
  'PMV',
  'Peaje lateral',
  'Atravieso',
  'Puente',
] as const;

/* =========================================================
   TRABAJOS
   ========================================================= */

export const WORKS = [
  {
    name: 'Noche' as const,
    emoji: '🌙',
  },
  {
    name: 'Día' as const,
    emoji: '☀️',
  },
];

/* =========================================================
   DATOS INICIALES
   ========================================================= */

/*
 * La infraestructura ya NO parte vacía.
 *
 * BASE_INFRASTRUCTURE contiene los datos provenientes
 * de CLASES.xlsx incorporados permanentemente a la APP.
 *
 * Creamos nuevas matrices con [...] para evitar modificar
 * directamente los datos base.
 */

export const emptyData = (): AppData => ({
  Troncal: [
    ...BASE_INFRASTRUCTURE.Troncal,
  ] as InfraItem[],

  Enlace: [
    ...BASE_INFRASTRUCTURE.Enlace,
  ] as InfraItem[],

  Pasarela: [
    ...BASE_INFRASTRUCTURE.Pasarela,
  ] as InfraItem[],

  PMV: [
    ...BASE_INFRASTRUCTURE.PMV,
  ] as InfraItem[],

  'Peaje lateral': [
    ...BASE_INFRASTRUCTURE['Peaje lateral'],
  ] as InfraItem[],

  Atravieso: [
    ...BASE_INFRASTRUCTURE.Atravieso,
  ] as InfraItem[],

  Puente: [
    ...BASE_INFRASTRUCTURE.Puente,
  ] as InfraItem[],

  /*
   * Los trabajos siguen partiendo vacíos.
   * Se cargarán desde su Excel correspondiente.
   */
  Noche: [],
  Día: [],
});

/* =========================================================
   PUNTOS DE REFERENCIA DE LA RUTA
   ========================================================= */

export const ROUTE_ANCHORS = {
  R5: [
    { km: 29, lat: -33.612, lon: -70.742 },
    { km: 43.5, lat: -33.533, lon: -70.69 },
    { km: 60, lat: -33.72, lon: -70.733 },
    { km: 80, lat: -33.912, lon: -70.713 },
    { km: 100, lat: -34.098, lon: -70.742 },
    { km: 120, lat: -34.274, lon: -70.832 },
    { km: 140, lat: -34.43, lon: -70.9 },
    { km: 160, lat: -34.61, lon: -71.01 },
    { km: 180, lat: -34.845, lon: -71.16 },
    { km: 200, lat: -35.122, lon: -71.345 },
    { km: 219, lat: -35.43, lon: -71.665 },
  ],

  ASS: [
    { km: 0, lat: -33.617, lon: -70.705 },
    { km: 5, lat: -33.605, lon: -70.7 },
    { km: 10, lat: -33.592, lon: -70.698 },
    { km: 15, lat: -33.575, lon: -70.696 },
    { km: 20, lat: -33.562, lon: -70.695 },
    { km: 25, lat: -33.552, lon: -70.694 },
    { km: 30, lat: -33.545, lon: -70.692 },
    { km: 35, lat: -33.539, lon: -70.691 },
    { km: 40, lat: -33.535, lon: -70.69 },
    { km: 43.5, lat: -33.533, lon: -70.69 },
  ],
};

/* =========================================================
   CURVAS
   ========================================================= */

/*
 * Las conservamos por ahora porque RouteCanvas las utiliza,
 * pero NO forman parte de la nueva infraestructura base.
 */

export const CURVES = {
  R5: [
    { ini: 45.2, fin: 45.48 },
    { ini: 48.35, fin: 48.8 },
    { ini: 52.9, fin: 53.8 },
    { ini: 68.6, fin: 69.72 },
    { ini: 94.55, fin: 95.15 },
    { ini: 116.18, fin: 116.54 },
    { ini: 140, fin: 140.65 },
    { ini: 176.6, fin: 176.9 },
    { ini: 190.6, fin: 190.85 },
    { ini: 209.15, fin: 209.5 },
    { ini: 217.45, fin: 217.9 },
  ],

  ASS: [
    { ini: 9.65, fin: 10.8 },
    { ini: 15.4, fin: 16.6 },
    { ini: 17.7, fin: 18.6 },
  ],
};

/* =========================================================
   PUNTOS METEOROLÓGICOS
   ========================================================= */

export const REGION_POINTS: RegionPoint[] = [
  { name: 'Acceso Sur', lat: -33.58, lon: -70.69 },
  { name: 'Paine', lat: -33.81, lon: -70.74 },
  { name: 'Buin', lat: -33.73, lon: -70.74 },
  { name: 'Angostura', lat: -34.07, lon: -70.72 },
  { name: 'Mostazal', lat: -33.98, lon: -70.72 },

  {
    name: 'Bypass Rancagua (km 85)',
    lat: -34.17,
    lon: -70.76,
  },

  { name: 'Requínoa', lat: -34.28, lon: -70.81 },
  { name: 'Pelequén', lat: -34.49, lon: -71.11 },
  { name: 'San Fernando', lat: -34.58, lon: -70.99 },
  { name: 'Tinguiririca', lat: -34.71, lon: -71.02 },
  { name: 'Chimbarongo', lat: -34.72, lon: -71.04 },
  { name: 'Quinta', lat: -34.86, lon: -71.11 },
  { name: 'Teno', lat: -34.87, lon: -71.17 },
  { name: 'Romeral', lat: -34.98, lon: -71.13 },
  { name: 'Curicó', lat: -34.98, lon: -71.24 },
  { name: 'Lontué', lat: -35.08, lon: -71.29 },
  { name: 'Molina', lat: -35.12, lon: -71.28 },
  { name: 'Itahue', lat: -35.22, lon: -71.32 },
  { name: 'Rio claro', lat: -35.27, lon: -71.32 },
];

/* =========================================================
   RÍOS
   ========================================================= */

export const RIVER_CROSSINGS: RiverCrossing[] = [
  {
    name: 'Río Maipo',
    route: 'Acceso Sur',
    routeKey: 'ASS',
    region: 'Metropolitana',
    km: 17.8,
    basin: 'Cuenca alta y media del Maipo',

    gauges: [
      {
        name: 'San José de Maipo',
        lat: -33.64,
        lon: -70.35,
      },
      {
        name: 'El Volcán',
        lat: -33.82,
        lon: -70.06,
      },
      {
        name: 'Embalse El Yeso',
        lat: -33.67,
        lon: -70.08,
      },
    ],
  },

  {
    name: 'Río Angostura',
    route: 'Acceso Sur',
    routeKey: 'ASS',
    region: 'Metropolitana',
    km: 41.5,
    basin: 'Subcuenca Angostura - Paine',

    gauges: [
      {
        name: 'Paine',
        lat: -33.81,
        lon: -70.74,
      },
      {
        name: 'Valdivia de Paine',
        lat: -33.89,
        lon: -70.86,
      },
      {
        name: 'Angostura',
        lat: -34.07,
        lon: -70.72,
      },
    ],
  },

  {
    name: 'Río Cachapoal',
    route: 'Ruta 5 Sur',
    routeKey: 'R5',
    region: "O'Higgins",
    km: 83.8,
    basin: 'Cuenca alta del Cachapoal',

    gauges: [
      {
        name: 'Coya',
        lat: -34.19,
        lon: -70.57,
      },
      {
        name: 'Sewell',
        lat: -34.08,
        lon: -70.38,
      },
      {
        name: 'Rancagua',
        lat: -34.17,
        lon: -70.74,
      },
    ],
  },

  {
    name: 'Río Claro (Rengo)',
    route: 'Ruta 5 Sur',
    routeKey: 'R5',
    region: "O'Higgins",
    km: 99.5,
    basin: 'Subcuenca Río Claro de Rengo',

    gauges: [
      {
        name: 'Rengo',
        lat: -34.41,
        lon: -70.86,
      },
      {
        name: 'Requínoa',
        lat: -34.28,
        lon: -70.81,
      },
      {
        name: 'Los Queñes sector norte',
        lat: -34.96,
        lon: -70.82,
      },
    ],
  },

  {
    name: 'Río Tinguiririca',
    route: 'Ruta 5 Sur',
    routeKey: 'R5',
    region: "O'Higgins",
    km: 132.4,
    basin: 'Cuenca alta del Tinguiririca',

    gauges: [
      {
        name: 'San Fernando',
        lat: -34.58,
        lon: -70.99,
      },
      {
        name: 'Termas del Flaco',
        lat: -34.95,
        lon: -70.43,
      },
      {
        name: 'Chimbarongo',
        lat: -34.72,
        lon: -71.04,
      },
    ],
  },

  {
    name: 'Río Teno',
    route: 'Ruta 5 Sur',
    routeKey: 'R5',
    region: 'Maule',
    km: 166.8,
    basin: 'Cuenca alta del Teno',

    gauges: [
      {
        name: 'Los Queñes',
        lat: -34.98,
        lon: -70.8,
      },
      {
        name: 'Romeral',
        lat: -34.98,
        lon: -71.13,
      },
      {
        name: 'Curicó',
        lat: -34.98,
        lon: -71.24,
      },
    ],
  },

  {
    name: 'Río Lontué',
    route: 'Ruta 5 Sur',
    routeKey: 'R5',
    region: 'Maule',
    km: 186.2,
    basin: 'Cuenca alta del Lontué',

    gauges: [
      {
        name: 'Radal Siete Tazas',
        lat: -35.45,
        lon: -71.02,
      },
      {
        name: 'Molina',
        lat: -35.12,
        lon: -71.28,
      },
      {
        name: 'Lontué',
        lat: -35.08,
        lon: -71.29,
      },
    ],
  },

  {
    name: 'Río Mataquito',
    route: 'Ruta 5 Sur',
    routeKey: 'R5',
    region: 'Maule',
    km: 191.5,
    basin: 'Sistema Mataquito: Teno + Lontué',

    gauges: [
      {
        name: 'Curicó',
        lat: -34.98,
        lon: -71.24,
      },
      {
        name: 'Molina',
        lat: -35.12,
        lon: -71.28,
      },
      {
        name: 'Radal Siete Tazas',
        lat: -35.45,
        lon: -71.02,
      },
    ],
  },

  {
    name: 'Río Claro (Molina)',
    route: 'Ruta 5 Sur',
    routeKey: 'R5',
    region: 'Maule',
    km: 203.8,
    basin: 'Subcuenca Río Claro de Molina',

    gauges: [
      {
        name: 'Molina',
        lat: -35.12,
        lon: -71.28,
      },
      {
        name: 'Radal Siete Tazas',
        lat: -35.45,
        lon: -71.02,
      },
      {
        name: 'Itahue',
        lat: -35.22,
        lon: -71.32,
      },
    ],
  },
];
