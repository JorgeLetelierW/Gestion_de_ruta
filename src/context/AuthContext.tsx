import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import type { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// Duración máxima de sesión: 1 hora
const SESSION_DURATION = 60 * 60 * 1000;

const LOGIN_TIME_KEY = 'gestion_ruta_login_time';

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = async () => {
    localStorage.removeItem(LOGIN_TIME_KEY);

    await supabase.auth.signOut();

    setSession(null);
  };

  const signIn = async (
    email: string,
    password: string
  ) => {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      throw error;
    }

    localStorage.setItem(
      LOGIN_TIME_KEY,
      Date.now().toString()
    );

    setSession(data.session);
  };

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const checkSession = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!currentSession) {
        localStorage.removeItem(LOGIN_TIME_KEY);
        setSession(null);
        setLoading(false);
        return;
      }

      const storedLoginTime =
        localStorage.getItem(LOGIN_TIME_KEY);

      const loginTime = storedLoginTime
        ? Number(storedLoginTime)
        : Date.now();

      if (!storedLoginTime) {
        localStorage.setItem(
          LOGIN_TIME_KEY,
          loginTime.toString()
        );
      }

      const elapsed = Date.now() - loginTime;
      const remaining = SESSION_DURATION - elapsed;

      if (remaining <= 0) {
        await signOut();
        setLoading(false);
        return;
      }

      setSession(currentSession);
      setLoading(false);

      timeout = setTimeout(() => {
        void signOut();
      }, remaining);
    };

    void checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => {
      subscription.unsubscribe();

      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth debe utilizarse dentro de AuthProvider'
    );
  }

  return context;
}
