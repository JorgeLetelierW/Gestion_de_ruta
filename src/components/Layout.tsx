import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';

import Sidebar from './Sidebar';
import Header from './Header';
import RouteCanvas from './RouteCanvas';

import logoRutaMaipo from '../assets/logo-ruta-maipo.png';

import type { AppData, LayerKey } from '../types';

interface LayoutProps {
  data: AppData;
  visible: Record<LayerKey, boolean>;
  setData: (data: AppData) => void;
}

export default function Layout({
  data,
  visible,
  setData,
}: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(
    () => window.innerWidth > 900,
  );

  const [mobile, setMobile] = useState(
    () => window.innerWidth <= 900,
  );

  useEffect(() => {
    const media = window.matchMedia(
      '(max-width: 900px)',
    );

    const handleChange = () => {
      const isMobile = media.matches;

      setMobile(isMobile);

      // Móvil: cerrado.
      // Escritorio: abierto.
      setSidebarOpen(!isMobile);
    };

    handleChange();

    media.addEventListener(
      'change',
      handleChange,
    );

    return () => {
      media.removeEventListener(
        'change',
        handleChange,
      );
    };
  }, []);

  const sidebarWidth = mobile
    ? '0px'
    : sidebarOpen
      ? '240px'
      : '56px';

  return (
    <div
      className="app-layout"
      style={{
        width: '100vw',
        height: '100dvh',
        overflow: 'hidden',

        display: 'grid',

        /*
         * ESCRITORIO
         *
         * Sidebar ocupa toda la altura.
         * Header solamente ocupa el área
         * situada a la derecha del sidebar.
         */
        gridTemplateColumns: `${sidebarWidth} minmax(0, 1fr)`,

        gridTemplateRows:
          '64px minmax(0, 1fr)',

        gridTemplateAreas: `
          "sidebar header"
          "sidebar main"
        `,

        transition:
          'grid-template-columns 0.2s ease',
      }}
    >
      {/* ==========================================
          SIDEBAR ESCRITORIO
          ========================================== */}

      {!mobile ? (
        <aside
          style={{
            gridArea: 'sidebar',

            position: 'relative',

            minWidth: 0,
            minHeight: 0,

            overflow: 'visible',

            /*
             * Sidebar por encima del Header,
             * mapa y módulos.
             */
            zIndex: 50,
          }}
        >
          <Sidebar
            open={sidebarOpen}
            mobile={false}
            onToggle={() =>
              setSidebarOpen(
                (current) => !current,
              )
            }
            onClose={() =>
              setSidebarOpen(false)
            }
          />
        </aside>
      ) : null}

      {/* ==========================================
          HEADER
          ========================================== */}

      <header
        style={{
          gridArea: 'header',

          position: 'relative',

          minWidth: 0,
          minHeight: 0,

          zIndex: 30,
        }}
      >
        <Header />
      </header>

      {/* ==========================================
          SIDEBAR MÓVIL
          ========================================== */}

      {mobile ? (
        <Sidebar
          open={sidebarOpen}
          mobile
          onToggle={() =>
            setSidebarOpen(
              (current) => !current,
            )
          }
          onClose={() =>
            setSidebarOpen(false)
          }
        />
      ) : null}

      {/* ==========================================
          ÁREA PRINCIPAL
          ========================================== */}

      <main
        style={{
          gridArea: 'main',

          position: 'relative',

          minWidth: 0,
          minHeight: 0,

          overflow: 'hidden',
        }}
      >
        {/* MAPA */}

        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
          }}
        >
          <RouteCanvas
            data={data}
            visible={visible}
            setData={setData}
          />
        </div>

        {/* LOGO CORPORATIVO */}

        <img
          src={logoRutaMaipo}
          alt="Ruta del Maipo ISA Vías"
          className="app-corporate-logo"
        />

        {/* MÓDULOS */}

        <div
          style={{
            position: 'absolute',
            inset: 0,

            zIndex: 10,

            pointerEvents: 'none',
          }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}
