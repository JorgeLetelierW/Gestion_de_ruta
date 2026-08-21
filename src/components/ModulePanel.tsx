import type {
  CSSProperties,
  ReactNode,
} from 'react';

import { useNavigate } from 'react-router-dom';

interface ModulePanelProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  width?: string;
  fullScreen?: boolean;

  /*
   * Controles opcionales que aparecen
   * junto al título.
   */
  headerActions?: ReactNode;
}

export default function ModulePanel({
  title,
  subtitle,
  children,
  width = '400px',
  fullScreen = false,
  headerActions,
}: ModulePanelProps) {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/mapa');
  };

  return (
    <section
      className={`module-panel ${
        fullScreen
          ? 'module-panel-fullscreen'
          : ''
      }`}
      style={
        {
          '--module-panel-width': width,
        } as CSSProperties
      }
    >
      <div className="module-panel-handle" />

      <header className="module-panel-header">

        <div className="module-panel-header-main">

          <div className="module-panel-heading">
            <h1>{title}</h1>

            {subtitle ? (
              <p>{subtitle}</p>
            ) : null}
          </div>

          {headerActions ? (
            <div className="module-panel-header-actions">
              {headerActions}
            </div>
          ) : null}

        </div>

        <button
          type="button"
          className="module-panel-close"
          onClick={handleClose}
          aria-label={`Cerrar ${title}`}
          title="Cerrar"
        >
          ×
        </button>

      </header>

      <div className="module-panel-content">
        {children}
      </div>
    </section>
  );
}
