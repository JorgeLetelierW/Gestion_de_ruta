import { useState } from 'react';
import type { UserRole } from '../../types';

const ROLES: UserRole[] = ['Administrador', 'Supervisor', 'Visor'];

export default function Login({ login }: { login: (email: string, role: UserRole) => void }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Supervisor');
  const canLogin = email.trim().length > 0;

  return (
    <div className="login">
      <div className="panel login-card">
        <h1>Gestión de Ruta JLW</h1>
        <input value={email} placeholder="ingresa usuario" onChange={e => setEmail(e.target.value)} />
        <select value={role} onChange={e => setRole(e.target.value as UserRole)}>
          {ROLES.map(item => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <button disabled={!canLogin} onClick={() => login(email.trim(), role)}>Ingresar</button>
      </div>
    </div>
  );
}
