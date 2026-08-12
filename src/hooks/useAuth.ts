import { useState } from 'react';
import type { UserRole } from '../types';

type AuthSession = { email: string; role: UserRole };

const SESSION_KEY = 'jlw_auth';
const LEGACY_USER_KEY = 'jlw_user';

function readSession(): AuthSession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<AuthSession>;
      if (parsed.email && parsed.role) return { email: parsed.email, role: parsed.role };
    } catch {
      // no-op
    }
  }

  const legacyUser = localStorage.getItem(LEGACY_USER_KEY);
  if (!legacyUser) return null;
  return { email: legacyUser, role: 'Administrador' };
}

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(() => readSession());

  const login = (email: string, role: UserRole) => {
    const next = { email, role };
    localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    setSession(next);
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(LEGACY_USER_KEY);
    setSession(null);
  };

  return {
    user: session?.email ?? null,
    role: session?.role ?? null,
    login,
    logout,
    isAuthenticated: !!session,
  };
}
