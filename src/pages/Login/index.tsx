import { useState } from 'react';
import type { UserRole } from '../../types';
import { DEFAULT_ADMIN_PASSWORD } from '../../services/usersDb';

const ROLES: UserRole[] = ['Administrador', 'Supervisor', 'Visor'];

export default function Login({
  login,
}: {
  login: (username: string, role: UserRole, password: string) => Promise<{ ok: boolean; message?: string }>;
}) {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<UserRole>('Supervisor');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canLogin = username.trim().length > 0 && password.length > 0;

  const onLogin = async () => {
    if (!canLogin || isSubmitting) return;
    setIsSubmitting(true);
    setError('');
    const result = await login(username.trim(), role, password);
    if (!result.ok) {
      setError(result.message ?? 'No fue posible iniciar sesión');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login hero-login">
      <div className="hero-content">
        <p className="hero-kicker">Plataforma Segura</p>
        <h1>Gestión de Ruta JLW</h1>
        <p>Accede desde cualquier URL de la aplicación usando tu tipo de usuario y contraseña.</p>
      </div>
      <div className="panel login-card">
        <h2>Iniciar sesión</h2>
        <input value={username} placeholder="usuario" onChange={e => setUsername(e.target.value)} />
        <select value={role} onChange={e => setRole(e.target.value as UserRole)}>
          {ROLES.map(item => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <input
          type="password"
          value={password}
          placeholder="contraseña"
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onLogin()}
        />
        {error && <p className="login-error">{error}</p>}
        <button disabled={!canLogin || isSubmitting} onClick={onLogin}>
          {isSubmitting ? 'Validando...' : 'Ingresar'}
        </button>
        <p className="login-help">
          Desarrollo/Test: admin <strong>{DEFAULT_ADMIN_PASSWORD}</strong>
        </p>
      </div>
    </div>
  );
}
