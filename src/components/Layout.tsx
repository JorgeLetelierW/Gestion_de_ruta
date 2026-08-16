import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import RouteCanvas from './RouteCanvas';
import type { AppData, LayerKey } from '../types';

interface LayoutProps {
  data: AppData;
  visible: Record<LayerKey, boolean>;
  setData: (d: AppData) => void;
}

export default function Layout({ data, visible, setData }: LayoutProps) {
  return (
    <>
      {/* Canvas permanente como fondo de toda la app */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <RouteCanvas data={data} visible={visible} setData={setData} />
      </div>

      {/* Sidebar y Header sobre el canvas */}
      <Sidebar />
      <Header />

      {/* Outlet: cada página flota como panel sobre el canvas */}
      <main style={{ position: 'fixed', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto' }}>
          <Outlet />
        </div>
      </main>
    </>
  );
}
