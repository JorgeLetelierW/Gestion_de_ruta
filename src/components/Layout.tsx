import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
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
      <div
        style={{
          gridArea: 'header',
          minWidth: 0,
          minHeight: 0,
          zIndex: 20,
        }}
      >
        <Header />
      </div>

      {/* SIDEBAR */}
      <div
        style={{
          gridArea: 'sidebar',
          minWidth: 0,
          minHeight: 0,
          overflow: 'hidden',
          zIndex: 10,
        }}
      >
        <Sidebar />
      </div>

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
        <Outlet />
      </main>
    </div>
  );
}
