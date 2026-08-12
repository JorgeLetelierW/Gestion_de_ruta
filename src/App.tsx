import { Navigate, Route, Routes } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';

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
import type { AppData, LayerKey } from './types';
import { loadPersistedClasses, replacePersistedClasses } from './services/classesStore';

const initVisible: Record<LayerKey, boolean> = {
  Troncal: false,
  Enlace: false,
  Pasarela: false,
  PMV: false,
  'Peaje lateral': false,
  Noche: false,
  Día: false,
};

function PrivateApp() {
  const [data, setData] = useState(emptyData);
  const [visible, setVisible] = useState(initVisible);

  const toggle = (k: LayerKey) =>
    setVisible((v) => ({
      ...v,
      !v[k],
    }));

  useEffect(() => {
    let ok = true;

    loadPersistedClasses()
      .then((saved) => {
        if (ok && saved) {
          setData((d) => ({
            ...d,
            ...saved,
          }));
        }
      })
      .catch((e) => {
        console.warn('No fue posible leer CLASES persistidas', e);
      });

    return () => {
      ok = false;
    };
  }, []);

  const onDataLoaded = useCallback(
    async (next: AppData, kind: 'classes' | 'works') => {
      setData(next);

      if (kind === 'classes') {
        await replacePersistedClasses(next);
      }
    },
    []
  );

  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/mapa" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="mapa" element={<Mapa data={data} visible={visible} setData={setData} />} />
          <Route path="trabajos" element={<Trabajos />} />
          <Route path="clima" element={<Clima />} />
          <Route path="rios" element={<Rios />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="configuracion" element={<Configuracion />} />
          <Route path="*" element={<Navigate to="/mapa" replace />} />
        </Route>
      </Routes>

      <div className="legacy-panels">
        <DataLoader data={data} onDataLoaded={onDataLoaded} />
        <LayerPanel type="infra" visible={visible} onToggle={toggle} />
        <LayerPanel type="works" visible={visible} onToggle={toggle} />
      </div>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/*" element={<PrivateApp />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}