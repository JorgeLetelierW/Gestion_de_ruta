import { NavLink } from 'react-router-dom';
import type { UserRole } from '../types';

const items = ['Dashboard', 'Mapa', 'Trabajos', 'Clima', 'Rios', 'Usuarios', 'Configuracion'];

export default function Sidebar({ role }: { role: UserRole }) {
  const visibleItems =
    role === 'Administrador' ? items : items.filter(i => i !== 'Usuarios' && i !== 'Configuracion');
  return (
    <nav className="app-sidebar">
      {visibleItems.map(i => (
        <NavLink key={i} to={`/${i.toLowerCase()}`} className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}>
          {i}
        </NavLink>
      ))}
    </nav>
  );
}
