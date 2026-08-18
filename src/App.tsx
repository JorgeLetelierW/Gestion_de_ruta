import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import { useState } from 'react';

import LoginPage from './pages/LoginPage';
import ProtectedRoute from './auth/ProtectedRoute';
import Layout from './components/Layout';

import { emptyData } from './services/mockData';
import type { AppData, LayerKey } from './types';

const initVisible: Record<LayerKey, boolean> = {
  Troncal: false,
  Enlace: false,
  Pasarela: false,
  PMV: false,
  'Peaje lateral': false,
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
      LAYOUT FUNCIONA
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
      <Route
        path="/"
        element={<LoginPage />}
      />

      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <Layout
              data={data}
              visible={visible}
              setData={setData}
            />
          }
        >
          <Route
            path="/dashboard"
            element={<TestPage />}
          />
        </Route>
      </Route>

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
