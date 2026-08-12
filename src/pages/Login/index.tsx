import { useState } from 'react';
import type { UserRole } from '../../types';

const ROLES: UserRole[] = ['Administrador', 'Supervisor', 'Visor'];

export default function Login({ login }: { login: (email: string, role: UserRole) => void }) {
  const [email, setEmail] = useState('ingresa usuario');
  const [role, setRole] = useState<UserRole>('Supervisor');

  return (
    <div className="login">
      <div className="panel login-card">
        <h1>Gestión de Ruta JLW</h1>
        <input value={email} onChange={e => setEmail(e.target.value)} />
        <select value={role} onChange={e => setRole(e.target.value as UserRole)}>
          {ROLES.map(item => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <button onClick={() => login(email, role)}>Ingresar</button>
      </div>
    </div>
  );
}
