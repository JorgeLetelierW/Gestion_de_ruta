import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const items = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Carga', path: '/carga' },
  { label: 'Infraestructura', path: '/infraestructura' },
  { label: 'Trabajos', path: '/trabajos' },
  { label: 'Clima', path: '/clima' },
  { label: 'Ríos', path: '/rios' },
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
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const [signingOut, setSigningOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleModuleClick = (path: string) => {
    if (location.pathname === path) {
      navigate('/mapa');
    } else {
      navigate(path);
    }

    if (mobile) {
      onClose();
    }
  };

  const requestSignOut = () => {
    setShowLogoutConfirm(true);
  };

  const cancelSignOut = () => {
    if (signingOut) return;

    setShowLogoutConfirm(false);
  };

  const handleSignOut = async () => {
    if (signingOut) return;

    setSigningOut(true);

    try {
      await signOut();

      setShowLogoutConfirm(false);

      if (mobile) {
        onClose();
      }

      navigate('/', {
        replace: true,
      });
    } catch (error) {
      console.error(
        'Error al cerrar sesión:',
        error,
      );

      setSigningOut(false);
    }
  };

  /*
   * BOTÓN CERRAR SESIÓN
   */

  const logoutButton = (
    <button
      type="button"
      className="sidebar-logout-button"
      onClick={requestSignOut}
      disabled={signingOut}
    >
      Cerrar sesión
    </button>
  );

  /*
   * CONFIRMACIÓN
   */

  const logoutConfirmation = showLogoutConfirm ? (
    <div
      className="logout-confirm-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          cancelSignOut();
        }
      }}
    >
      <div
        className="logout-confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-confirm-title"
      >
        <h3 id="logout-confirm-title">
          Cerrar sesión
        </h3>

        <p>
          ¿Seguro que deseas cerrar sesión?
        </p>

        <div className="logout-confirm-actions">
          <button
            type="button"
            className="logout-cancel-button"
            onClick={cancelSignOut}
            disabled={signingOut}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="logout-confirm-button"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut
              ? 'Cerrando...'
              : 'Cerrar sesión'}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  /*
   * MÓVIL
   */

  if (mobile) {
    return (
      <>
        <button
          type="button"
          className="sidebar-mobile-toggle"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls="app-sidebar-mobile"
          aria-label={
            open ? 'Cerrar menú' : 'Abrir menú'
          }
        >
          {open ? '✕' : '☰'}
        </button>

        {open ? (
          <button
            type="button"
            className="sidebar-scrim"
            onClick={onClose}
            aria-label="Cerrar menú"
          />
        ) : null}

        <nav
          id="app-sidebar-mobile"
          className={`app-sidebar-mobile ${
            open ? 'open' : ''
          }`}
        >
          <div className="sidebar-title">
            Menú
          </div>

          <div className="sidebar-links">
            {items.map((item) => {
              const active =
                location.pathname === item.path;

              return (
                <button
                  key={item.path}
                  type="button"
                  className={`side-link ${
                    active ? 'active' : ''
                  }`}
                  onClick={() =>
                    handleModuleClick(item.path)
                  }
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="sidebar-logout-area">
            {logoutButton}
          </div>
        </nav>

        {logoutConfirmation}
      </>
    );
  }

  /*
   * ESCRITORIO - COLAPSADO
   */

  if (!open) {
    return (
      <>
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

        {logoutConfirmation}
      </>
    );
  }

  /*
   * ESCRITORIO - ABIERTO
   */

  return (
    <>
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
          {items.map((item) => {
            const active =
              location.pathname === item.path;

            return (
              <button
                key={item.path}
                type="button"
                className={`side-link ${
                  active ? 'active' : ''
                }`}
                onClick={() =>
                  handleModuleClick(item.path)
                }
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="sidebar-logout-area">
          {logoutButton}
        </div>
      </nav>

      {logoutConfirmation}
    </>
  );
}
