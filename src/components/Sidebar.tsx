import { NavLink } from 'react-router-dom';

const items = [
  'Dashboard',
  'Mapa',
  'Carga',
  'Infraestructura',
  'Trabajos',
  'Clima',
  'Configuracion',
];

export default function Sidebar() {
  return (
    <nav className="app-sidebar">
      {items.map((item) => (
        <NavLink
          key={item}
          to={`/${item.toLowerCase()}`}
          className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}
        >
          {item}
        </NavLink>
      ))}
    </nav>
  );
}
