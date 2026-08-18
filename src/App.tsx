import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import { useState } from 'react';

import LoginPage from './pages/LoginPage';
import ProtectedRoute from './auth/ProtectedRoute';
import Layout from './components/Layout';

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

function TestPage() {
  return (
    <div
      style={{
        padding: '50px',
        fontSize: '32px',
        color: 'white',
      }}
    >
      RIVER RISK + LAYOUT FUNCIONAN
    </div>
  );
}

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
          <Route
            path="/dashboard"
            element={<TestPage />}
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
