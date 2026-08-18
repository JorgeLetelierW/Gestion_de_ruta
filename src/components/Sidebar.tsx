import { NavLink } from 'react-router-dom';

const items = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Carga', path: '/carga' },
  { label: 'Infraestructura', path: '/infraestructura' },
  { label: 'Trabajos', path: '/trabajos' },
  { label: 'Clima', path: '/clima' },
  { label: 'Configuración', path: '/configuracion' },
];

interface SidebarProps {
  open: boolean;
  mobile: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export default function Sidebar({
  open,
  mobile,
  onToggle,
  onClose,
}: SidebarProps) {
  const handleNavigation = () => {
    if (mobile) {
      onClose();
    }
  };

  /*
   * VERSIÓN MÓVIL
   */
  if (mobile) {
    return (
      <>
        {/* BOTÓN ABRIR / CERRAR */}
        <button
          type="button"
          className="sidebar-mobile-toggle"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls="app-sidebar-mobile"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        >
          {open ? '✕' : '☰'}
        </button>

        {/* FONDO OSCURO */}
        {open ? (
          <button
            type="button"
            className="sidebar-scrim"
            onClick={onClose}
            aria-label="Cerrar menú"
          />
        ) : null}

        {/* DRAWER */}
        <nav
          id="app-sidebar-mobile"
          className={`app-sidebar-mobile ${
            open ? 'open' : ''
          }`}
        >
          <div className="sidebar-title">
            Menú
          </div>

          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavigation}
              className={({ isActive }) =>
                `side-link ${isActive ? 'active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </>
    );
  }

  /*
   * ESCRITORIO - COLAPSADO
   */
  if (!open) {
    return (
      <div className="sidebar-collapsed">
        <button
          type="button"
          className="sidebar-collapse-button"
          onClick={onToggle}
          aria-label="Abrir menú"
          title="Abrir menú"
        >
          ☰
        </button>
      </div>
    );
  }

  /*
   * ESCRITORIO - ABIERTO
   */
  return (
    <nav className="app-sidebar-desktop">
      <div className="sidebar-desktop-header">
        <strong>Menú</strong>

        <button
          type="button"
          className="sidebar-collapse-button"
          onClick={onToggle}
          aria-label="Colapsar menú"
          title="Colapsar menú"
        >
          ◀
        </button>
      </div>

      <div className="sidebar-links">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `side-link ${isActive ? 'active' : ''}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
