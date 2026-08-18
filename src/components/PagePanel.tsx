import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface PagePanelProps {
  children: ReactNode;
  width?: string;
  className?: string;
}

export default function PagePanel({
  children,
  width = 'min(760px, calc(100% - 32px))',
  className = '',
}: PagePanelProps) {
  const navigate = useNavigate();

  return (
    <section
      className={`page-panel ${className}`}
      style={{
        width,
      }}
    >
      <button
        type="button"
        className="page-panel-close"
        onClick={() => navigate('/mapa')}
        aria-label="Cerrar módulo"
        title="Cerrar"
      >
        ✕
      </button>

      <div className="page-panel-content">
        {children}
      </div>
    </section>
  );
}
