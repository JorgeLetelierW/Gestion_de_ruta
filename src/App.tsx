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

  const [visible] =
    useState<Record<LayerKey, boolean>>(
      initVisible
    );

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
          {/* DASHBOARD REAL */}
          <Route
            path="/dashboard"
            element={<Dashboard />}
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
