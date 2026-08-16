import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';

const items = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Carga', path: '/carga' },
  { label: 'Infraestructura', path: '/infraestructura' },
  { label: 'Trabajos', path: '/trabajos' },
  { label: 'Clima', path: '/clima' },
  { label: 'Configuración', path: '/configuracion' },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 901px)');
    const sync = () => setOpen(media.matches);

    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  const close = () => {
    if (!window.matchMedia('(min-width: 901px)').matches) setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className="panel sidebar-toggle"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="app-sidebar"
      >
        <span className="sidebar-toggle-icon">{open ? '✕' : '☰'}</span>
        <span>Menú</span>
      </button>

      {open ? <button type="button" className="sidebar-scrim" onClick={close} aria-label="Cerrar menú" /> : null}

      <nav id="app-sidebar" className={`panel app-sidebar ${open ? 'open' : ''}`}>
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={close}
            className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
