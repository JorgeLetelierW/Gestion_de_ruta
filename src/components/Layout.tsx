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

const MOBILE_BREAKPOINT = 900;

export default function Layout({
  data,
  visible,
  setData,
}: LayoutProps) {
  /* =======================================================
     ESTADO
     ======================================================= */

  const [mobile, setMobile] = useState(
    () => window.innerWidth <= MOBILE_BREAKPOINT,
  );

  const [sidebarOpen, setSidebarOpen] = useState(
    () => window.innerWidth > MOBILE_BREAKPOINT,
  );

  /* =======================================================
     DETECTAR CAMBIO ENTRE MÓVIL Y ESCRITORIO
     ======================================================= */

  useEffect(() => {
    const media = window.matchMedia(
      `(max-width: ${MOBILE_BREAKPOINT}px)`,
    );

    const handleChange = (
      event?: MediaQueryListEvent,
    ) => {
      const isMobile =
        event?.matches ?? media.matches;

      setMobile(isMobile);

      /*
       * Al cambiar de tipo de dispositivo:
       *
       * Escritorio -> sidebar abierto.
       * Móvil      -> sidebar cerrado.
       */
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

  /* =======================================================
     ANCHO SIDEBAR
     ======================================================= */

  const sidebarWidth = mobile
    ? '0px'
    : sidebarOpen
      ? '240px'
      : '56px';

  /* =======================================================
     CONTROLES SIDEBAR
     ======================================================= */

  const toggleSidebar = () => {
    setSidebarOpen(
      (current) => !current,
    );
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  /* =======================================================
     LAYOUT
     ======================================================= */

  return (
    <div
      className="app-layout"
      style={{
        width: '100vw',
        height: '100dvh',

        display: 'grid',

        /*
         * ESCRITORIO:
         *
         * ┌──────────┬────────────────────┐
         * │          │       HEADER       │
         * │ SIDEBAR  ├────────────────────┤
         * │          │                    │
         * │          │       MAIN         │
         * │          │                    │
         * └──────────┴────────────────────┘
         *
         * El sidebar ocupa LAS DOS FILAS.
         */

        gridTemplateColumns: `${sidebarWidth} minmax(0, 1fr)`,

        gridTemplateRows:
          '64px minmax(0, 1fr)',

        gridTemplateAreas: `
          "sidebar header"
          "sidebar main"
        `,

        overflow: 'hidden',

        transition:
          'grid-template-columns 0.2s ease',
      }}
    >
      {/* =================================================
          SIDEBAR ESCRITORIO
          ================================================= */}

      {!mobile && (
        <aside
          className="layout-sidebar"
          style={{
            gridArea: 'sidebar',

            position: 'relative',

            width: '100%',
            height: '100%',

            minWidth: 0,
            minHeight: 0,

            overflow: 'hidden',

            /*
             * El sidebar queda visualmente
             * por encima del resto de la interfaz.
             */
            zIndex: 100,
          }}
        >
          <Sidebar
            open={sidebarOpen}
            mobile={false}
            onToggle={toggleSidebar}
            onClose={closeSidebar}
          />
        </aside>
      )}

      {/* =================================================
          HEADER
          ================================================= */}

      <header
        className="layout-header"
        style={{
          gridArea: 'header',

          position: 'relative',

          width: '100%',
          height: '64px',

          minWidth: 0,
          minHeight: 0,

          overflow: 'visible',

          zIndex: 30,
        }}
      >
        <Header />
      </header>

      {/* =================================================
          SIDEBAR MÓVIL
          ================================================= */}

      {mobile && (
        <Sidebar
          open={sidebarOpen}
          mobile
          onToggle={toggleSidebar}
          onClose={closeSidebar}
        />
      )}

      {/* =================================================
          ÁREA PRINCIPAL
          ================================================= */}

      <main
        className="layout-main"
        style={{
          gridArea: 'main',

          position: 'relative',

          width: '100%',
          height: '100%',

          minWidth: 0,
          minHeight: 0,

          overflow: 'hidden',

          zIndex: 1,
        }}
      >
        {/* ===============================================
            MAPA
            =============================================== */}

        <div
          className="layout-map"
          style={{
            position: 'absolute',

            inset: 0,

            width: '100%',
            height: '100%',

            overflow: 'hidden',

            zIndex: 0,
          }}
        >
          <RouteCanvas
            data={data}
            visible={visible}
            setData={setData}
          />
        </div>

        {/* ===============================================
            LOGO CORPORATIVO
            =============================================== */}

        <img
          src={logoRutaMaipo}
          alt="Ruta del Maipo ISA Vías"
          className="app-corporate-logo"
        />

        {/* ===============================================
            MÓDULOS
            =============================================== */}

        <div
          className="layout-modules"
          style={{
            position: 'absolute',

            inset: 0,

            minWidth: 0,
            minHeight: 0,

            overflow: 'hidden',

            zIndex: 10,

            /*
             * El contenedor no bloquea el mapa.
             * Cada ModulePanel vuelve a activar
             * pointer-events mediante CSS.
             */
            pointerEvents: 'none',
          }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}
