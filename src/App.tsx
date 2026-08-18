import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import { useState } from 'react';

import LoginPage from './pages/LoginPage';
import ProtectedRoute from './auth/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Carga from './pages/Carga';
import Infraestructura from './pages/Infraestructura';

import { RiverRiskProvider } from './context/RiverRiskContext';

import { emptyData } from './services/mockData';
import type { AppData, LayerKey } from './types';

const initVisible: Record<LayerKey, boolean> = {
  Troncal: false,
  Enlace: false,
  Pasarela: false,
  PMV: false,
  'Peaje lateral': false,
  Atravieso: false,
  Puente: false,
  Noche: false,
  Día: false,
};

export default function App() {
  const [data, setData] = useState<AppData>(
    emptyData()
  );

  const [visible, setVisible] =
    useState<Record<LayerKey, boolean>>(
      initVisible
    );

  const toggle = (key: LayerKey) => {
    setVisible((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  return (
    <Routes>
      {/* LOGIN */}
      <Route
        path="/"
        element={<LoginPage />}
      />

      {/* APLICACIÓN PROTEGIDA */}
      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <RiverRiskProvider>
              <Layout
                data={data}
                visible={visible}
                setData={setData}
              />
            </RiverRiskProvider>
          }
        >
          {/* DASHBOARD */}
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* CARGA */}
          <Route
            path="/carga"
            element={
              <Carga
                data={data}
                setData={setData}
              />
            }
          />

          {/* INFRAESTRUCTURA */}
          <Route
            path="/infraestructura"
            element={
              <Infraestructura
                visible={visible}
                onToggle={toggle}
              />
            }
          />
        </Route>
      </Route>

      {/* RUTA DESCONOCIDA */}
      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />
    </Routes>
  );
}
