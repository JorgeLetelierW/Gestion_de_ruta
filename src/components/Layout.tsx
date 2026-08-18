import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar';
import Header from './Header';
import RouteCanvas from './RouteCanvas';

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
  return (
    <div
      className="app-layout"
      style={{
        width: '100vw',
        height: '100dvh',
        overflow: 'hidden',

        display: 'grid',

        gridTemplateColumns: '240px minmax(0, 1fr)',
        gridTemplateRows: '64px minmax(0, 1fr)',

        gridTemplateAreas: `
          "header header"
          "sidebar main"
        `,
      }}
    >
      {/* HEADER */}
      <header
        style={{
          gridArea: 'header',
          minWidth: 0,
          minHeight: 0,
          zIndex: 30,
        }}
      >
        <Header />
      </header>

      {/* SIDEBAR */}
      <aside
        style={{
          gridArea: 'sidebar',
          minWidth: 0,
          minHeight: 0,
          overflow: 'hidden',
          zIndex: 20,
        }}
      >
        <Sidebar />
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main
        style={{
          gridArea: 'main',
          position: 'relative',
          minWidth: 0,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {/* MAPA PERMANENTE */}
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

        {/* CONTENIDO DE CADA MÓDULO */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,

            /*
             * El contenido no bloquea el mapa completo.
             * Cada página podrá habilitar interacción
             * solamente en sus propios controles.
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
