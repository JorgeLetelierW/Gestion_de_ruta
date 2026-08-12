import { useState } from 'react';
import type { UserRole } from '../types';
import { authenticateUser } from '../services/usersDb';

type AuthSession = { username: string; role: UserRole };

const SESSION_KEY = 'jlw_auth';
const LEGACY_USER_KEY = 'jlw_user';
const ROLES: UserRole[] = ['Administrador', 'Supervisor', 'Visor'];
const isUserRole = (value: unknown): value is UserRole => ROLES.includes(value as UserRole);

function readSession(): AuthSession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<AuthSession>;
      if (parsed.username && isUserRole(parsed.role)) return { username: parsed.username, role: parsed.role };
    } catch {
      // no-op
    }
  }

  const legacyUser = localStorage.getItem(LEGACY_USER_KEY);
  if (!legacyUser) return null;
  return { username: legacyUser, role: 'Administrador' };
}

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(() => readSession());

  const login = async (username: string, role: UserRole, password: string) => {
    const account = await authenticateUser(username, role, password);
    if (!account) {
      return { ok: false as const, message: 'Credenciales inválidas' };
    }
    const next = { username: account.username, role: account.role };
    localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    setSession(next);
    return { ok: true as const };
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(LEGACY_USER_KEY);
    setSession(null);
  };

  return {
    user: session?.username ?? null,
    role: session?.role ?? null,
    login,
    logout,
    isAuthenticated: !!session,
  };
}
