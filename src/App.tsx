import { Navigate, Route, Routes } from 'react-router-dom';
import { useState } from 'react';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Carga from './pages/Carga';
import Infraestructura from './pages/Infraestructura';
import Trabajos from './pages/Trabajos';
import Clima from './pages/Clima';
import Configuracion from './pages/Configuracion';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './auth/ProtectedRoute';

import { RiverRiskProvider } from './context/RiverRiskContext';

import { emptyData } from './services/mockData';
import type { AppData, LayerKey } from './types';

const initVisible: Record<LayerKey, boolean> = {
  Troncal: false,
  Enlace: false,
  Pasarela: false,
  PMV: false,
  'Peaje lateral': false,

  // NUEVAS CAPAS DE INFRAESTRUCTURA
  Atravieso: false,
  Puente: false,

  // TRABAJOS
  Noche: false,
  Día: false,
};

export default function App() {
  const [data, setData] = useState<AppData>(emptyData());

  const [visible, setVisible] =
    useState<Record<LayerKey, boolean>>(initVisible);

  const toggle = (key: LayerKey) => {
    setVisible((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  return (
    <Routes>
      {/* LANDING / LOGIN */}
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
          {/* ENTRADA A LA APLICACIÓN */}
          <Route
            index
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          {/* MAPA SIN MÓDULO ABIERTO */}
          <Route
            path="/mapa"
            element={null}
          />

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

          {/* TRABAJOS */}
          <Route
            path="/trabajos"
            element={
              <Trabajos
                visible={visible}
                onToggle={toggle}
              />
            }
          />

          {/* CLIMA */}
          <Route
            path="/clima"
            element={<Clima />}
          />

          {/* CONFIGURACIÓN */}
          <Route
            path="/configuracion"
            element={<Configuracion />}
          />

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
        </Route>
      </Route>
    </Routes>
  );
}
