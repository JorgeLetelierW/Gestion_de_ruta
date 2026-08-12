export type RouteKey = 'R5' | 'ASS';
export type UserRole = 'Administrador' | 'Supervisor' | 'Visor';
export interface UserAccount {
  username: string;
  role: UserRole;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}
export type InfraClass = 'Troncal' | 'Enlace' | 'Pasarela' | 'PMV' | 'Peaje lateral';
export type WorkClass = 'Noche' | 'Día';
export type LayerKey = InfraClass | WorkClass;
export type WorkStatus = 'Programado' | 'En ejecución' | 'Terminado';
export interface InfraItem { nombre:string; km:number; ruta:string; route:RouteKey; }
export interface Trabajo { tipo:WorkClass; nombre:string; trabajo:string; km:number; ruta:string; route:RouteKey; fecha:string; responsable:string; contratista:string; kmInicial:number; kmFinal:number; longitud:string; pistas:string; calzada:string; sector:string; horario:string; horaInicio:string; horaFinal:string; observacion:string; estadoManual:WorkStatus; horaInicioReal:string; horaTerminoReal:string; }
export interface RegionPoint { name:string; lat:number; lon:number; }
export interface RiverCrossing { name:string; route:string; routeKey:RouteKey; region:string; km:number; basin:string; gauges:{name:string;lat:number;lon:number}[]; }
export interface AppData { Troncal:InfraItem[]; Enlace:InfraItem[]; Pasarela:InfraItem[]; PMV:InfraItem[]; 'Peaje lateral':InfraItem[]; Noche:Trabajo[]; Día:Trabajo[]; }
export interface LogRow { ruta:string; trabajo:string; kmIni:number|string; kmFin:number|string; pista:string; sector:string; inicioReal:string; terminoReal:string; estado:string; }
