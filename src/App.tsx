import { Navigate, Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import Layout from './components/Layout';
import DataLoader from './components/DataLoader';
import { LayerPanel } from './components/LayerPanel';
import Dashboard from './pages/Dashboard';
import Mapa from './pages/Mapa';
import Trabajos from './pages/Trabajos';
import Clima from './pages/Clima';
import Rios from './pages/Rios';
import Usuarios from './pages/Usuarios';
import Configuracion from './pages/Configuracion';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './auth/ProtectedRoute';
import { emptyData } from './services/mockData';
import type { LayerKey } from './types';

const initVisible: Record<LayerKey, boolean> = {
  Troncal: false,
  Enlace: false,
  Pasarela: false,
  PMV: false,
  'Peaje lateral': false,
  Noche: false,
  Día: false,
};

export default function App() {
  const [data, setData] = useState(emptyData);
  const [visible, setVisible] = useState(initVisible);
  const toggle = (k: LayerKey) => setVisible((v) => ({ ...v, [k]: !v[k] }));

  return (
    <>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="mapa" element={<Mapa data={data} visible={visible} setData={setData} />} />
            <Route path="trabajos" element={<Trabajos />} />
            <Route path="clima" element={<Clima />} />
            <Route path="rios" element={<Rios />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="configuracion" element={<Configuracion />} />
            <Route path="*" element={<Navigate to="/mapa" replace />} />
          </Route>
        </Route>
      </Routes>

      <div className="legacy-panels">
        <DataLoader data={data} setData={setData} />
        <LayerPanel type="infra" visible={visible} onToggle={toggle} />
        <LayerPanel type="works" visible={visible} onToggle={toggle} />
      </div>
    </>
  );
}
