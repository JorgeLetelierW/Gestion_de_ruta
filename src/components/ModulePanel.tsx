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
}

export default function ModulePanel({
  title,
  subtitle,
  children,
  width = '400px',
}: ModulePanelProps) {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/mapa');
  };

  return (
    <section
      className="module-panel"
      style={
        {
          '--module-panel-width': width,
        } as CSSProperties
      }
    >
      {/* Barra para identificar el panel móvil */}
      <div className="module-panel-handle" />

      {/* Encabezado */}
      <header className="module-panel-header">
        <div className="module-panel-heading">
          <h1>{title}</h1>

          {subtitle ? (
            <p>{subtitle}</p>
          ) : null}
        </div>

        {/* Cerrar módulo */}
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

      {/* Contenido del módulo */}
      <div className="module-panel-content">
        {children}
      </div>
    </section>
  );
}
