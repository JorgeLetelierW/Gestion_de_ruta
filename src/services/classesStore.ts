import type { AppData, InfraClass, InfraItem } from '../types';

const DB_NAME = 'gestion_de_ruta';
const DB_VERSION = 1;
const STORE = 'app_state';
const KEY = 'classes';
const CLASSES:InfraClass[] = ['Troncal', 'Enlace', 'Pasarela', 'PMV', 'Peaje lateral'];

type ClassesData = Pick<AppData, InfraClass>;
type StoredClasses = { key:string; value:ClassesData; updatedAt:string };

function openDb(){
  return new Promise<IDBDatabase>((resolve,reject)=>{
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => { if(!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE,{keyPath:'key'}); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('indexeddb_open_error'));
  });
}

function toClassesData(data:AppData):ClassesData{
  return CLASSES.reduce((acc,k)=>{ acc[k] = data[k]; return acc; }, {} as ClassesData);
}

function isInfraItem(v:any):v is InfraItem{
  return v && typeof v.nombre==='string' && typeof v.km==='number' && typeof v.ruta==='string' && (v.route==='R5'||v.route==='ASS');
}

function normalizeStored(value:any):ClassesData|null{
  if(!value || typeof value!=='object') return null;
  const parsed:any = {};
  for(const cls of CLASSES){
    if(!Array.isArray(value[cls])) return null;
    parsed[cls] = value[cls].filter(isInfraItem);
  }
  return parsed as ClassesData;
}

export async function loadPersistedClasses(){
  if(typeof indexedDB==='undefined') return null;
  const db = await openDb();
  try{
    const tx = db.transaction(STORE,'readonly');
    const store = tx.objectStore(STORE);
    const row = await new Promise<StoredClasses|undefined>((resolve,reject)=>{
      const req = store.get(KEY);
      req.onsuccess = ()=>resolve(req.result as StoredClasses|undefined);
      req.onerror = ()=>reject(req.error || new Error('indexeddb_read_error'));
    });
    return normalizeStored(row?.value ?? null);
  } finally { db.close(); }
}

export async function replacePersistedClasses(data:AppData){
  if(typeof indexedDB==='undefined') return;
  const db = await openDb();
  try{
    const tx = db.transaction(STORE,'readwrite');
    tx.objectStore(STORE).put({key:KEY, value:toClassesData(data), updatedAt:new Date().toISOString()} satisfies StoredClasses);
    await new Promise<void>((resolve,reject)=>{
      tx.oncomplete = ()=>resolve();
      tx.onerror = ()=>reject(tx.error || new Error('indexeddb_write_error'));
      tx.onabort = ()=>reject(tx.error || new Error('indexeddb_write_aborted'));
    });
  } finally { db.close(); }
}
