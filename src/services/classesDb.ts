import type { AppData, InfraClass, InfraItem } from '../types';
import { INFRA } from './mockData';

const DB_NAME = 'gestion-ruta-db';
const DB_VERSION = 1;
const STORE_NAME = 'clases';
const KEY = 'current';

type StoredClasses = Record<InfraClass, InfraItem[]>;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('No se pudo abrir IndexedDB'));
  });
}

function emptyStoredClasses(): StoredClasses {
  return INFRA.reduce((acc, cls) => {
    acc[cls] = [];
    return acc;
  }, {} as StoredClasses);
}

export async function saveClasses(data: AppData): Promise<void> {
  const db = await openDb();
  const payload = INFRA.reduce((acc, cls) => {
    acc[cls] = [...data[cls]];
    return acc;
  }, emptyStoredClasses());

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(payload, KEY);
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error ?? new Error('No se pudo guardar CLASES'));
  });

  db.close();
}

export async function loadClasses(): Promise<StoredClasses | null> {
  const db = await openDb();
  const stored = await new Promise<StoredClasses | null>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(KEY);
    req.onsuccess = () => resolve((req.result as StoredClasses | undefined) ?? null);
    req.onerror = () => reject(req.error ?? new Error('No se pudo leer CLASES'));
  });
  db.close();
  return stored;
}
