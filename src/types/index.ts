export type RouteKey =
  | 'R5'
  | 'ASS';

export type InfraClass =
  | 'Troncal'
  | 'Enlace'
  | 'Pasarela'
  | 'PMV'
  | 'Peaje lateral'
  | 'Atravieso'
  | 'Puente';

export type WorkClass =
  | 'Noche'
  | 'Día';

export type LayerKey =
  | InfraClass
  | WorkClass;

export type WorkStatus =
  | 'Programado'
  | 'En ejecución'
  | 'Terminado';

/* =========================================================
   INFRAESTRUCTURA
   ========================================================= */

export interface InfraItem {
  nombre: string;
  km: number;
  ruta: string;
  route: RouteKey;

  /*
   * Información adicional proveniente de CLASES.xlsx.
   * Son opcionales porque no todas las clases la poseen.
   */
  lado?: string;
  marca?: string;
}

/* =========================================================
   TRABAJOS
   ========================================================= */

export interface Trabajo {
  tipo: WorkClass;

  nombre: string;
  trabajo: string;

  km: number;

  ruta: string;
  route: RouteKey;

  fecha: string;

  responsable: string;
  contratista: string;

  kmInicial: number;
  kmFinal: number;

  longitud: string;

  pistas: string;
  calzada: string;

  sector: string;

  horario: string;

  horaInicio: string;
  horaFinal: string;

  observacion: string;

  estadoManual: WorkStatus;

  horaInicioReal: string;
  horaTerminoReal: string;
}

/* =========================================================
   CLIMA
   ========================================================= */

export interface RegionPoint {
  name: string;
  lat: number;
  lon: number;
}

/* =========================================================
   RÍOS
   ========================================================= */

export interface RiverCrossing {
  name: string;

  route: string;
  routeKey: RouteKey;

  region: string;

  km: number;

  basin: string;

  gauges: {
    name: string;
    lat: number;
    lon: number;
  }[];
}

/* =========================================================
   DATOS GENERALES DE LA APP
   ========================================================= */

export interface AppData {
  /* Infraestructura */

  Troncal: InfraItem[];
  Enlace: InfraItem[];
  Pasarela: InfraItem[];
  PMV: InfraItem[];
  'Peaje lateral': InfraItem[];

  Atravieso: InfraItem[];
  Puente: InfraItem[];

  /* Trabajos */

  Noche: Trabajo[];
  Día: Trabajo[];
}

/* =========================================================
   REGISTRO DE TRABAJOS
   ========================================================= */

export interface LogRow {
  ruta: string;

  trabajo: string;

  kmIni: number | string;
  kmFin: number | string;

  pista: string;

  sector: string;

  inicioReal: string;
  terminoReal: string;

  estado: string;
}
