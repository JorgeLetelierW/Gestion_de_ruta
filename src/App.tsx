import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import {
  useEffect,
  useState,
} from 'react';

import LoginPage from './pages/LoginPage';
import ProtectedRoute from './auth/ProtectedRoute';

import Layout from './components/Layout';

import Dashboard from './pages/Dashboard';
import Carga from './pages/Carga';
import Infraestructura from './pages/Infraestructura';
import Trabajos from './pages/Trabajos';
import Clima from './pages/Clima';
import Rios from './pages/Rios';
import Configuracion from './pages/Configuracion';

import { RiverRiskProvider } from './context/RiverRiskContext';

import { emptyData } from './services/mockData';

import {
  cargarIntervencionesAutomaticas,
} from './services/intervenciones';

import type {
  AppData,
  LayerKey,
} from './types';

/*
 * ---------------------------------------------------------
 * CAPAS VISIBLES INICIALMENTE
 * ---------------------------------------------------------
 */

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

/*
 * ---------------------------------------------------------
 * APP
 * ---------------------------------------------------------
 */

export default function App() {
  const [data, setData] =
    useState<AppData>(emptyData());

  const [visible, setVisible] =
    useState<Record<LayerKey, boolean>>(
      initVisible,
    );

  /*
   * -------------------------------------------------------
   * CARGA AUTOMÁTICA DE INTERVENCIONES
   * -------------------------------------------------------
   *
   * Por ahora esta función se ejecuta una sola vez cuando
   * se inicia App.
   *
   * Flujo:
   *
   * Apps Script
   *      ↓
   * último archivo XLSX
   *      ↓
   * descarga
   *      ↓
   * parseWorkbookFile()
   *      ↓
   * actualización de AppData
   */

  useEffect(() => {
    let cancelled = false;

    const cargarIntervenciones = async () => {
      try {
        console.log(
          '[Intervenciones] Iniciando carga automática...',
        );

        const base = emptyData();

        const resultado =
          await cargarIntervencionesAutomaticas(
            base,
          );

        if (cancelled) {
          return;
        }

        setData(resultado.data);

        console.log(
          '[Intervenciones] Carga completada.',
        );

        console.log(
          '[Intervenciones] Archivo:',
          resultado.archivo,
        );

        console.log(
          '[Intervenciones] ID:',
          resultado.archivoId,
        );

        console.log(
          '[Intervenciones] Fecha actualización:',
          resultado.fechaActualizacion,
        );

        console.log(
          '[Intervenciones] Registros procesados:',
          resultado.total,
        );
      } catch (error) {
        /*
         * IMPORTANTE:
         *
         * Si falla la carga automática, la aplicación
         * continúa funcionando normalmente.
         */

        console.error(
          '[Intervenciones] Error en carga automática:',
          error,
        );
      }
    };

    cargarIntervenciones();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * -------------------------------------------------------
   * ACTIVAR / DESACTIVAR CAPAS
   * -------------------------------------------------------
   */

  const toggle = (key: LayerKey) => {
    setVisible((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  return (
    <Routes>

      {/* ===================================================
          LOGIN
          =================================================== */}

      <Route
        path="/"
        element={<LoginPage />}
      />

      {/* ===================================================
          APLICACIÓN PROTEGIDA
          =================================================== */}

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

          {/* ===============================================
              MAPA SIN PANEL
              =============================================== */}

          <Route
            path="/mapa"
            element={null}
          />

          {/* ===============================================
              DASHBOARD
              =============================================== */}

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* ===============================================
              CARGA
              =============================================== */}

          <Route
            path="/carga"
            element={
              <Carga
                data={data}
                setData={setData}
              />
            }
          />

          {/* ===============================================
              INFRAESTRUCTURA
              =============================================== */}

          <Route
            path="/infraestructura"
            element={
              <Infraestructura
                visible={visible}
                onToggle={toggle}
              />
            }
          />

          {/* ===============================================
              TRABAJOS
              =============================================== */}

          <Route
            path="/trabajos"
            element={
              <Trabajos
                visible={visible}
                onToggle={toggle}
              />
            }
          />

          {/* ===============================================
              CLIMA
              =============================================== */}

          <Route
            path="/clima"
            element={<Clima />}
          />

          {/* ===============================================
              RÍOS
              =============================================== */}

          <Route
            path="/rios"
            element={<Rios />}
          />

          {/* ===============================================
              CONFIGURACIÓN
              =============================================== */}

          <Route
            path="/configuracion"
            element={<Configuracion />}
          />

        </Route>

      </Route>

      {/* ===================================================
          RUTA DESCONOCIDA
          =================================================== */}

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
