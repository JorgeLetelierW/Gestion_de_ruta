import type { UserAccount, UserRole } from '../types';

const DB_NAME = 'gestion-ruta-users-db';
const DB_VERSION = 1;
const STORE_NAME = 'users';
const DEFAULT_ADMIN_USER = 'admin';
export const DEFAULT_ADMIN_PASSWORD = 'admin1234';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'username' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('No se pudo abrir la base de usuarios'));
  });
}

async function sha256(value: string): Promise<string> {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(digest))
    .map(item => item.toString(16).padStart(2, '0'))
    .join('');
}

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

function closeDb(db: IDBDatabase) {
  db.close();
}

async function seedAdminIfEmpty(): Promise<void> {
  const db = await openDb();
  const count = await new Promise<number>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('No se pudo contar usuarios'));
  });

  if (count === 0) {
    const now = new Date().toISOString();
    const admin: UserAccount = {
      username: DEFAULT_ADMIN_USER,
      role: 'Administrador',
      passwordHash: await sha256(DEFAULT_ADMIN_PASSWORD),
      createdAt: now,
      updatedAt: now,
    };

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(admin);
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(tx.error ?? new Error('No se pudo crear admin por defecto'));
    });
  }

  closeDb(db);
}

export async function listUsers(): Promise<UserAccount[]> {
  await seedAdminIfEmpty();
  const db = await openDb();
  const users = await new Promise<UserAccount[]>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve((req.result as UserAccount[]).sort((a, b) => a.username.localeCompare(b.username)));
    req.onerror = () => reject(req.error ?? new Error('No se pudieron listar usuarios'));
  });
  closeDb(db);
  return users;
}

export async function authenticateUser(username: string, role: UserRole, password: string): Promise<UserAccount | null> {
  await seedAdminIfEmpty();
  const normalized = normalizeUsername(username);
  const db = await openDb();
  const account = await new Promise<UserAccount | null>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(normalized);
    req.onsuccess = () => resolve((req.result as UserAccount | undefined) ?? null);
    req.onerror = () => reject(req.error ?? new Error('No se pudo autenticar usuario'));
  });
  closeDb(db);
  if (!account || account.role !== role) return null;
  const hash = await sha256(password);
  return account.passwordHash === hash ? account : null;
}

export async function createUser(input: { username: string; role: UserRole; password: string }): Promise<void> {
  await seedAdminIfEmpty();
  const normalized = normalizeUsername(input.username);
  if (!normalized) throw new Error('El usuario es obligatorio');
  if (input.password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres');

  const db = await openDb();
  const existing = await new Promise<UserAccount | null>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(normalized);
    req.onsuccess = () => resolve((req.result as UserAccount | undefined) ?? null);
    req.onerror = () => reject(req.error ?? new Error('No se pudo validar usuario existente'));
  });
  if (existing) {
    closeDb(db);
    throw new Error('El usuario ya existe');
  }

  const now = new Date().toISOString();
  const next: UserAccount = {
    username: normalized,
    role: input.role,
    passwordHash: await sha256(input.password),
    createdAt: now,
    updatedAt: now,
  };

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).add(next);
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error ?? new Error('No se pudo crear usuario'));
  });

  closeDb(db);
}

export async function updateUser(input: { username: string; role: UserRole; password?: string }): Promise<void> {
  await seedAdminIfEmpty();
  const normalized = normalizeUsername(input.username);
  const db = await openDb();
  const current = await new Promise<UserAccount | null>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(normalized);
    req.onsuccess = () => resolve((req.result as UserAccount | undefined) ?? null);
    req.onerror = () => reject(req.error ?? new Error('No se pudo leer usuario para actualizar'));
  });
  if (!current) {
    closeDb(db);
    throw new Error('Usuario no encontrado');
  }

  const next: UserAccount = {
    ...current,
    role: input.role,
    updatedAt: new Date().toISOString(),
  };
  if (input.password) {
    if (input.password.length < 6) {
      closeDb(db);
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }
    next.passwordHash = await sha256(input.password);
  }

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(next);
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error ?? new Error('No se pudo actualizar usuario'));
  });
  closeDb(db);
}

export async function deleteUser(username: string): Promise<void> {
  await seedAdminIfEmpty();
  const normalized = normalizeUsername(username);
  if (normalized === DEFAULT_ADMIN_USER) throw new Error('No se puede eliminar el admin por defecto en desarrollo');

  const users = await listUsers();
  const target = users.find(item => item.username === normalized);
  if (!target) throw new Error('Usuario no encontrado');
  if (target.role === 'Administrador') {
    const admins = users.filter(item => item.role === 'Administrador');
    if (admins.length <= 1) throw new Error('Debe existir al menos un administrador');
  }

  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(normalized);
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error ?? new Error('No se pudo eliminar usuario'));
  });
  closeDb(db);
}
