import { useState } from 'react';
import {
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    session,
    loading,
    signIn,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const from =
    (location.state as { from?: string } | null)?.from ||
    '/dashboard';

  const handleLogin = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError('');
    setSending(true);

    try {
      await signIn(email, password);

      navigate(from, {
        replace: true,
      });
    } catch {
      setError('Correo o contraseña incorrectos.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="login">
        Comprobando sesión...
      </div>
    );
  }

  // Si ya existe sesión, no mostramos nuevamente el login
  if (session) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return (
    <div className="login">
      <div className="panel login-card">
        <h1>Gestión de Ruta</h1>

        <p>
          Inicia sesión para acceder a la plataforma.
        </p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            autoComplete="email"
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            autoComplete="current-password"
            required
          />

          {error && (
            <p
              style={{
                color: '#fecaca',
                marginBottom: '12px',
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={sending}
          >
            {sending
              ? 'Ingresando...'
              : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
